import { remote } from "../core/workers";
import { PlayerConfig, PlayerType } from "../interfaces/player";
import { registerNetworkMap } from "../visualization";
import { P2PHlsPlayer } from "./hls";
import { P2PShakaPlayer } from "./shaka";

export function createP2Player(config: PlayerConfig) {
  switch (config.type) {
    case PlayerType.SHAKA_PLAYER:
      return P2PShakaPlayer.start(config).then(() => {
        // Visualization purposes.
        registerNetworkMap({ id: "map" });
        remote.onPeerConnect();
      });
    case PlayerType.HLS:
      return P2PHlsPlayer.start(config).then(() => {
        // Visualization purposes.
        registerNetworkMap({ id: "map" });
        remote.onPeerConnect();
      });
  }
}
