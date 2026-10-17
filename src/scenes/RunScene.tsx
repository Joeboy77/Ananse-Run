import { CameraRig } from './run/CameraRig'
import { ChaserView } from './run/ChaserView'
import { GameDriver } from './run/GameDriver'
import { GoldView } from './run/GoldView'
import { GroundView } from './run/GroundView'
import { ObstaclesView } from './run/ObstaclesView'
import { PickupsView } from './run/PickupsView'
import { PlayerView } from './run/PlayerView'

export function RunScene() {
  return (
    <>
      <GameDriver />
      <CameraRig />
      <GroundView />
      <ObstaclesView />
      <GoldView />
      <PickupsView />
      <ChaserView />
      <PlayerView />
    </>
  )
}
