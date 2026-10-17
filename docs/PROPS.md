# Kejetia Market props (Phase 4)

Every prop is made the same way as Ananse: **ChatGPT image → Meshy Image to 3D → download GLB**. You do not need Blender for props. The game scales each prop to fit its collision box automatically, so exact sizes do not matter.

## How to make one prop (about 5 minutes each)

1. **Image:** open **chatgpt.com** → **New chat** → paste the **style line** below, then the prop's **prompt** from the table, as one message → Enter.
2. **Check the image:** one object only, whole object visible, plain white background, three-quarter view (you can see the front and one side). If not, tell ChatGPT what to fix.
3. **Download** the image (click it → download arrow).
4. **Meshy:** go to **meshy.ai** → the **"Upload a photo or sketch"** box → choose the image.
5. Under the box, open **High Detail ⌄** and choose **Smart Topology** if it is there. Click the **⚙️ gear** and set **Polycount** to the number in the **Triangles** column. Leave everything else as it is.
6. Click **Generate**. Rotate the result and check: it looks like the image, no holes, no floating bits, no extra ground plate.
7. Click **Download** → **Origin: Bottom** → **Format: glb** → **Download**.
8. Move the file into the folder in the **Save to** column and rename it to the **File name** exactly.

**Style line** (paste before every prompt):

> Stylised 3D cartoon game asset for a mobile endless runner set in a busy Ghanaian market (Kejetia, Kumasi) at golden hour, Subway Surfers style: bright warm colours, chunky simple shapes, clean surfaces, slightly exaggerated proportions. Single object only, three-quarter view, whole object visible, plain pure white background, no shadow, no text, no logos, no people unless asked.

## Batch 1: obstacles (do these first)

| #   | File name                | Save to            | Triangles | Prompt                                                                                                                             |
| --- | ------------------------ | ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `obstacle_crates.glb`    | `assets-src/props` | 1500      | Three wooden tomato crates stacked in a low pile, full of ripe red tomatoes, about knee high and as wide as a car lane.            |
| 2   | `obstacle_basin.glb`     | `assets-src/props` | 1500      | A large shiny aluminium market basin on the ground piled high with tomatoes and onions, with a folded cloth beside it.             |
| 3   | `obstacle_sacks.glb`     | `assets-src/props` | 1200      | A low pile of four white woven polypropylene sacks of gari, tied at the top, slightly slumped.                                     |
| 4   | `obstacle_dog.glb`       | `assets-src/props` | 2000      | A friendly brown-and-white street dog curled up asleep on the ground.                                                              |
| 5   | `obstacle_trotro.glb`    | `assets-src/props` | 3000      | A Ghanaian trotro minibus, older white-and-yellow van with a roof rack, rounded friendly shape, seen from the front three-quarter. |
| 6   | `obstacle_kiosk.glb`     | `assets-src/props` | 2000      | A small painted metal roadside kiosk with a flat roof and a serving window, bright blue and yellow paint.                          |
| 7   | `obstacle_chairs.glb`    | `assets-src/props` | 1500      | A tall stack of red plastic chairs, about two metres high.                                                                         |
| 8   | `obstacle_cart.glb`      | `assets-src/props` | 1500      | A wooden push truck cart with two big wheels and long handles, loaded with sacks.                                                  |
| 9   | `obstacle_okada.glb`     | `assets-src/props` | 3000      | A small motorbike taxi (okada) with a cheerful rider wearing a helmet, side three-quarter view. (People allowed for this one.)     |
| 10  | `obstacle_signboard.glb` | `assets-src/props` | 800       | A hanging painted wooden shop signboard on two short chains, colourful hand-painted pictures of food, no letters or words.         |

## Batch 2: market scenery

| #   | File name              | Save to                  | Triangles | Prompt                                                                                                                                     |
| --- | ---------------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 11  | `stall_umbrella_a.glb` | `assets-src/environment` | 2500      | A market table stall with a large colourful striped beach umbrella over it, table covered with fruit.                                      |
| 12  | `stall_umbrella_b.glb` | `assets-src/environment` | 2500      | A wooden market stall with a slanted corrugated metal roof, shelves of colourful cloth rolls.                                              |
| 13  | `building_a.glb`       | `assets-src/environment` | 2500      | The front of a two-storey Ghanaian shop building, painted walls, metal shutters, a small balcony. Flat front, shallow depth.               |
| 14  | `building_b.glb`       | `assets-src/environment` | 2500      | The front of a three-storey market building with arched windows and faded painted walls. Flat front, shallow depth.                        |
| 15  | `building_c.glb`       | `assets-src/environment` | 2500      | The front of a single-storey row of small shops with colourful awnings and metal doors. Flat front, shallow depth.                         |
| 16  | `hawker.glb`           | `assets-src/environment` | 3000      | A smiling market woman standing and carrying a wide tray of oranges on her head, colourful wax-print dress. (People allowed for this one.) |
| 17  | `gold_weight.glb`      | `assets-src/props`       | 800       | A small brass Akan gold weight in the shape of a stylised bird, shiny polished brass.                                                      |

## Made by Claude Code (nothing for you to do)

Awning poles, cloth lines, ramps, road surface and gutters, gold dust, power-up gems, and the sky backdrop.

## Later: Osebo the leopard (chaser)

Done after Batch 2, together. Meshy can make the model; rigging a four-legged animal needs a different route than Mixamo, which Claude Code will set up.

## Licence

Everything made with your Meshy Pro plan and ChatGPT is yours. Claude Code records each file in `assets-src/LICENSES.md` when you hand it over.
