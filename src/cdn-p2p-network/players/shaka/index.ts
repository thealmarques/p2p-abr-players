import * as shaka from 'shaka-player';
import { remote, startWorker } from "../../core/workers";
import { P2PAdapter } from "../../core/bridge";
import { PlayerConfig } from "../../interfaces/player";
import { timeoutPromise } from '../utils/network';

export class P2PShakaPlayer {
    static start( { details } : PlayerConfig): Promise<void> {
        // Install built-in polyfills to patch browser incompatibilities.
        shaka.polyfill.installAll();

        // Activate network listeners
        shaka.net.NetworkingEngine.registerScheme("http", this.handleRequest.bind(this));
        shaka.net.NetworkingEngine.registerScheme("https", this.handleRequest.bind(this));

        return startWorker(details.name).then(async () => {
            const player = new shaka.Player(details.element);
            player.load(details.url)
                .catch((error: Error) => console.error(error));
            remote.createPeerManager();

            const browserID = await remote.getBrowserId();
            P2PAdapter.initialize(browserID);
        });
    }

    private static handleRequest(
        uri: string,
        request: shaka.extern.Request,
        requestType: shaka.net.NetworkingEngine.RequestType,
        progressUpdated: shaka.extern.ProgressUpdated
    ): shaka.extern.IAbortableOperation<shaka.extern.Response> {
        const promiseResponse = (async () => {
            const segment = await P2PAdapter.getPeerSegment(uri);
            if (segment) {
                // Get data from the Peer.
                remote.setAssetData(uri, segment.data);
                return segment;
            }

            // Get data from the server.
            const response = await shaka.net.HttpXHRPlugin.parse(uri, request, requestType, progressUpdated).promise;
            remote.setAssetData(uri, response.data);
            return response;
        })();

        return new shaka.util.AbortableOperation(promiseResponse, async () => undefined);
    }
}
