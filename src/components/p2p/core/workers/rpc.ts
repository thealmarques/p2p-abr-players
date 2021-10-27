import { getGeoLocation } from "./geo-location";
import { BootMessage, MessageReady, MessageRequest, MessageResponse, PromiseResponse, RpcContract, RpcMessageType, RpcRouterType } from "./interfaces/rpc";
import { setBrowserLocation } from "./state/browser";

// Hotfix for CRA issue (alternative is to use worker-plugin instead of worker-load).
if (process.env.NODE_ENV !== 'production') {
    (global as any).$RefreshReg$ = () => {};
    (global as any).$RefreshSig$ = () => () => {};
}

const EMPTY_METHOD = () => {};

export class RpcWorker<C extends RpcContract> {
    private worker: Worker;
    private exposedMethods: RpcContract;
    private onReady?: PromiseResponse<C>;
    private messageHandlers: Record<string, (...args: any[]) => void>;
    private resolveRegistry: Record<string, PromiseResponse<unknown>>;

    constructor(
        type: RpcRouterType,
        worker: Worker,
        exposedMethods: RpcContract,
        onReady?: PromiseResponse<C>
    ){
        this.worker = worker;
        this.exposedMethods = exposedMethods;
        this.onReady = onReady;

        this.resolveRegistry = {};
        this.worker.addEventListener('message', this.messageReceived.bind(this));
        this.messageHandlers = {
            [RpcMessageType.BOOT]: type === RpcRouterType.WORKER ? this.bootRequestReceived.bind(this) : EMPTY_METHOD,
            [RpcMessageType.READY]: type === RpcRouterType.UI ? this.ready.bind(this) : EMPTY_METHOD,
            [RpcMessageType.REQUEST]: this.rpcRequestReceived.bind(this),
            [RpcMessageType.RESPONSE]: this.rpcResponseReceived.bind(this),
        }
    }

    private async bootRequestReceived(data: BootMessage) {
        const location = await getGeoLocation();
        setBrowserLocation(data.config.browserId, {
            lat: location.latitude,
            lng: location.longitude,
        });

        this.worker.postMessage({
            type: RpcMessageType.READY,
            methods: Object.keys(this.exposedMethods),
        });
    }

    private ready(data: MessageReady) {
        const proxy = this.createProxy(data.methods);
        this.onReady?.(proxy as C);
    }

    private createProxy(methods: string[]) {
        const proxy: Record<string, () => Promise<unknown>> = {};
        for (let i = 0; i < methods.length; i++) {
            proxy[methods[i]] = () => new Promise((resolve) => {
                this.worker.postMessage({
                    type: RpcMessageType.REQUEST,
                    handler: methods[i],
                });
                this.resolveRegistry[methods[i]] = resolve;
            });
        }

        return proxy;
    }

    private rpcRequestReceived(event: MessageRequest) {
        this.exposedMethods[event.handler](...(event.params || [])).then((data) => {
            this.worker.postMessage({
                type: RpcMessageType.RESPONSE,
                data,
                handler: event.handler,
            });
        });
    }

    private rpcResponseReceived(event: MessageResponse) {
        this.resolveRegistry[event.handler](event.data);
    }

    private messageReceived(event: MessageEvent) {
        this.messageHandlers[event.data.type](event.data);
    }

    public sendBootRequest(message: BootMessage) {
        this.worker.postMessage(message);
    }
}