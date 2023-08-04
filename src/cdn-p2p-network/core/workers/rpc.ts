import { BootMessage, MessageReady, MessageRequest, MessageResponse, PromiseResponse, RpcContract, RpcMessageType, RpcRouterType } from "./interfaces/rpc";
import { setAssetId } from "./state/assets";
import { setBrowserLocation } from "./state/browser";

// Hotfix for CRA knwon issue with worker-loader (alternative is to use worker-plugin).
if (process.env.NODE_ENV !== 'production') {
    (global as any).$RefreshReg$ = () => {};
    (global as any).$RefreshSig$ = () => () => {};
}

export class RpcWorker<C extends RpcContract> {
    private worker: Worker;
    private exposedMethods: RpcContract;
    private onReady?: PromiseResponse<C>;
    private messageHandlers: Record<string, (...args: any[]) => void>;
    private resolveRegistry: Record<string, PromiseResponse<unknown>[]>;
    private type: RpcRouterType;

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
            [RpcMessageType.BOOT]: this.bootRequestReceived.bind(this),
            [RpcMessageType.READY]:  this.ready.bind(this),
            [RpcMessageType.REQUEST]: this.rpcRequestReceived.bind(this),
            [RpcMessageType.RESPONSE]: this.rpcResponseReceived.bind(this),
        }
        this.type = type;
    }

    private async bootRequestReceived(data: BootMessage) {
        // const location = await getGeoLocation();
        setBrowserLocation(data.config.browserId, data.coordinates);
        setAssetId(data.assetId);

        this.worker.postMessage({
            type: RpcMessageType.READY,
            methods: Object.keys(this.exposedMethods),
        });
    }

    private ready(data: MessageReady) {
        const proxy = this.createProxy(data.methods);
        this.onReady?.(proxy as C);

        if (this.type === RpcRouterType.UI) {
            this.worker.postMessage({
                type: RpcMessageType.READY,
                methods: Object.keys(this.exposedMethods),
            });
        }
    }

    private createProxy(methods: string[]) {
        const proxy: Record<string, () => Promise<unknown>> = {};
        for (let i = 0; i < methods.length; i++) {
            proxy[methods[i]] = (...params: any[]) => new Promise((resolve) => {
                if (!this.resolveRegistry[methods[i]]) {
                    this.resolveRegistry[methods[i]] = [];
                }

                this.resolveRegistry[methods[i]].push(resolve);
                this.worker.postMessage({
                    type: RpcMessageType.REQUEST,
                    handler: methods[i],
                    params,
                });
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
        this.resolveRegistry[event.handler].shift()?.(event.data);
    }

    private messageReceived(event: MessageEvent) {
        this.messageHandlers[event.data.type](event.data);
    }

    public sendBootRequest(message: BootMessage) {
        this.worker.postMessage(message);
    }
}