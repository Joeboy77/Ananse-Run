import { Suspense } from 'react'
import { CameraRig } from './run/CameraRig'
import { ModelBoundary } from './run/character/ModelBoundary'
import { ChaserView } from './run/ChaserView'
import { GameDriver } from './run/GameDriver'
import { GoldView } from './run/GoldView'
import { GroundView } from './run/GroundView'
import { ObstaclesView } from './run/ObstaclesView'
import { PickupsView } from './run/PickupsView'
import { PlayerView } from './run/PlayerView'
import { hasProps, PropsView } from './run/props/PropsView'

export function RunScene() {
  return (
    <>
      <GameDriver />
      <CameraRig />
      <GroundView />
      <ObstaclesView />
      {hasProps && (
        <ModelBoundary fallback={null}>
          <Suspense fallback={null}>
            <PropsView />
          </Suspense>
        </ModelBoundary>
      )}
      <GoldView />
      <PickupsView />
      <ChaserView />
      <PlayerView />
    </>
  )
}
