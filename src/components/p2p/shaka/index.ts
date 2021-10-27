import { isBrowserSupported } from "./utils/browser";
import * as shaka from 'shaka-player';
import { startWorker } from "../core/workers";

export class P2PShakaPlayer {
    private static player: shaka.Player;

    static start(video: HTMLVideoElement, manifestUri: string) {
        if (!isBrowserSupported()) {
            throw new Error('Browser is not supported');
        }

        // Install built-in polyfills to patch browser incompatibilities.
        shaka.polyfill.installAll();

        // Activate network listeners
        shaka.net.NetworkingEngine.registerScheme("http", this.handleRequest.bind(this));
        shaka.net.NetworkingEngine.registerScheme("https", this.handleRequest.bind(this));

        startWorker();

        const player = (this.player = new shaka.Player(video));
        player.load(manifestUri)
            .catch((error: Error) => console.error(error));
    }

    private static handleRequest(
        uri: string,
        request: shaka.extern.Request,
        requestType: shaka.net.NetworkingEngine.RequestType,
        progressUpdated: shaka.extern.ProgressUpdated
    ): shaka.extern.IAbortableOperation<any> {
        const promiseResponse = (async () => {
            const response = await shaka.net.HttpXHRPlugin.parse(uri, request, requestType, progressUpdated).promise;
            return response;
        })();

        return new shaka.util.AbortableOperation(promiseResponse, async () => undefined);
    }
}