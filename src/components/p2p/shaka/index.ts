import { getBrowserFingerPrint, isBrowserSupported } from "./utils/browser";
import * as shaka from 'shaka-player';

export class P2PShakaPlayer {
    private static player: shaka.Player;
    private static browserId: string;

    static start(video: HTMLVideoElement, manifestUri: string) {
        if (!isBrowserSupported()) {
            throw new Error('Browser is not supported');
        }

        getBrowserFingerPrint().then((id: string) => {
            this.browserId = id;

            // Install built-in polyfills to patch browser incompatibilities.
            shaka.polyfill.installAll();
            
            // Activate network listeners
            shaka.net.NetworkingEngine.registerScheme("http", this.handleRequest.bind(this));
            shaka.net.NetworkingEngine.registerScheme("https", this.handleRequest.bind(this));

            const player = (this.player = new shaka.Player(video));
            player.load(manifestUri)
                .catch((error) => console.error(error));
            });
    }

    private static handleRequest(
        uri: string,
        request: shaka.extern.Request,
        requestType: shaka.net.NetworkingEngine.RequestType,
        progressUpdated: shaka.extern.ProgressUpdated
    ): shaka.extern.IAbortableOperation < any > {
        console.log(uri);
        console.log(request);
        console.log(requestType);
        console.log(this.player.getBufferedInfo());
        const promiseResponse = (async () => {
            const response = await shaka.net.HttpXHRPlugin.parse(uri, request, requestType, progressUpdated).promise;
            console.log(response);
            return response;
        })();

        console.log('aqui');
        return new shaka.util.AbortableOperation(promiseResponse, async () => undefined);
    }
}