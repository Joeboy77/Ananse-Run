import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, resample, textureCompress } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [sourceArg, outputArg] = process.argv.slice(2)
const indexFile = join(root, 'src', 'game', 'assetIndex.json')
const sourceDir = sourceArg ?? join(root, 'assets-src')
const outputDir = outputArg ?? join(root, 'public', 'assets')
const CHARACTER_TEXTURE_SIZE = 1024
const PROP_TEXTURE_SIZE = 512
const CHARACTER_TRIANGLES = 15_000
const PROP_TRIANGLES = 3_000
const REQUIRED_CLIPS = [
  'idle',
  'run',
  'jump',
  'slide',
  'strafe_left',
  'strafe_right',
  'stumble',
  'crash',
  'swing',
]

const findModels = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return findModels(path)
      const isModel = ['.glb', '.gltf'].includes(extname(entry.name).toLowerCase())
      return isModel && !/_raw\.(glb|gltf)$/i.test(entry.name) ? [path] : []
    }),
  )
  return files.flat()
}

const countTriangles = (document) => {
  let triangles = 0
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const indices = primitive.getIndices()
      const position = primitive.getAttribute('POSITION')
      triangles += Math.floor((indices ? indices.getCount() : (position?.getCount() ?? 0)) / 3)
    }
  }
  return triangles
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

const main = async () => {
  await MeshoptDecoder.ready
  await MeshoptEncoder.ready
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder })

  const files = await findModels(sourceDir)
  if (files.length === 0) {
    console.log('No models found in assets-src/. Put .glb files there and run again.')
    return
  }

  let problems = 0
  const produced = []
  for (const file of files) {
    const rel = relative(sourceDir, file)

    const isCharacter = rel.startsWith('characters') && !rel.includes('extra_arms')
    const textureSize = rel.startsWith('characters') ? CHARACTER_TEXTURE_SIZE : PROP_TEXTURE_SIZE
    const document = await io.read(file)
    const triangles = countTriangles(document)
    const clips = document
      .getRoot()
      .listAnimations()
      .map((animation) => animation.getName())

    await document.transform(
      dedup(),
      prune(),
      resample(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureSize, textureSize] }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    )

    const target = join(outputDir, rel.replace(/\.gltf$/i, '.glb'))
    await mkdir(dirname(target), { recursive: true })
    await io.write(target, document)
    const before = (await stat(file)).size
    const after = (await stat(target)).size
    produced.push(`/assets/${relative(outputDir, target).split('\\').join('/')}`)
    console.log(`done  ${rel}  ${kb(before)} -> ${kb(after)}  ${triangles.toLocaleString()} triangles`)

    const budget = isCharacter ? CHARACTER_TRIANGLES : PROP_TRIANGLES
    if (triangles > budget) {
      problems++
      console.log(
        `      over budget: ${budget.toLocaleString()} triangles max. Add a Decimate modifier in Blender.`,
      )
    }
    if (isCharacter && clips.length > 0) {
      const missing = REQUIRED_CLIPS.filter((name) => !clips.includes(name))
      console.log(`      animations: ${clips.map((name) => name || '(unnamed)').join(', ')}`)
      if (missing.length > 0) {
        problems++
        console.log(`      missing animations: ${missing.join(', ')}`)
      }
    }
  }

  if (!sourceArg) await writeFile(indexFile, `${JSON.stringify(produced.sort(), null, 2)}\n`)
  console.log(problems === 0 ? '\nAll assets look good.' : `\n${problems} problem(s) to fix, see above.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
