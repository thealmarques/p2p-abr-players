import { remote, startWorker } from "../../core/workers";
import { P2PAdapter } from "../../core/bridge";
import { PlayerConfig } from "../../interfaces/player";
import HLS, { HlsConfig, FragmentLoaderContext } from "hls.js";

const DEFAULT_DOWNLOAD_BANDWIDTH = 12500; // bytes per millisecond

export class P2PHlsPlayer {
  static start({ details }: PlayerConfig): Promise<void> {
    return startWorker(details.name).then(async () => {
      const player = new HLS({
        fLoader: fLoader as any,
        enableWorker: false,
      });
      player.attachMedia(details.element);
      player.loadSource(details.url);
      remote.createPeerManager();

      const browserID = await remote.getBrowserId();
      P2PAdapter.initialize(browserID);
    });
  }
}

class fLoader extends HLS.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    super(config);
    var load = this.load.bind(this);
    this.load = async function (
      context: FragmentLoaderContext,
      config,
      callbacks
    ) {
      var onSuccess = callbacks.onSuccess;
      callbacks.onSuccess = function (response, stats, context) {
        remote.setAssetData(context.url, response.data as ArrayBuffer);
        onSuccess(response, stats, context, undefined);
      };

      const segment = await P2PAdapter.getPeerSegment(context.url);
      if (segment) {
        // Get data from the Peer.
        const stats = {
          aborted: false,
          loaded: segment.data.byteLength,
          total: segment.data.byteLength,
          chunkCount: 1,
          bwEstimate: DEFAULT_DOWNLOAD_BANDWIDTH,
          loading: { start: 0, first: 0, end: 0 },
          parsing: { start: 0, end: 0 },
          buffering: { start: 0, first: 0, end: 0 },
          retry: 0,
        };

        setTimeout(
          () =>
            callbacks.onSuccess(
              {
                url: context.url,
                data: segment.data,
              },
              stats,
              context,
              undefined
            ),
          0
        );
      } else {
        load(context, config, callbacks);
      }
    };
  }
}
