import { RpcWorker } from "./rpc"
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker";
import { RpcMessageType, RpcRouterType } from "./interfaces/rpc";
import { getBrowserFingerPrint } from "../../players/utils/browser";
import { WorkerContract } from "./lifecycle";
import { P2PAdapter } from "../bridge";
import { onPeerConnect } from "../../visualization";

let worker: Worker;
export let remote: WorkerContract;

export async function startWorker(assetId: string) {
    if (worker) {
        worker.terminate();
    }

    worker = new Worker();
    return startThreadCommunication(assetId).then(
        (contract: WorkerContract) => {
            remote = contract;

            window.addEventListener('beforeunload', async (event) => {
                remote.disconnectPeer();
                event.preventDefault();
              });
        });
}

function startThreadCommunication(assetId: string): Promise<WorkerContract> {
    const EXPOSED_METHODS_TO_WORKER = {
        'createAnswer': P2PAdapter.createAnswer.bind(P2PAdapter),
        'addIceCandidate': P2PAdapter.addIceCandidate.bind(P2PAdapter),
        'onPeerConnect': onPeerConnect,
    };

    return new Promise(async (resolve) => {
        const rpc = new RpcWorker<WorkerContract>(RpcRouterType.UI, worker, EXPOSED_METHODS_TO_WORKER, resolve);
        const id = process.env.NODE_ENV === 'development' ?
            Math.random().toString(36).substr(2, 5)
                : await getBrowserFingerPrint();

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (!urlParams.has('lat') && !urlParams.has('lng')) {
            alert('Missing coordinates in url param (Example: http://localhost:3000/?lat=35.8617&lng=104.1954)');
            return;
        }

        rpc.sendBootRequest({
            type: RpcMessageType.BOOT,
            config: {
                browserId: id,
            },
            assetId,
            coordinates: {
                lat: parseFloat(urlParams.get('lat')!),
                lng: parseFloat(urlParams.get('lng')!),
            }
        });
    });
}
