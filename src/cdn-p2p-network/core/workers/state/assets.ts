import { informPeerNetwork } from "./peer";

// Segments are stored in the following format:
let assetData: Record<string, ArrayBuffer> = {};

// Represents the asset (Movie, Show, etc.)
let assetId: string;

export function setAssetData(uri: string, data: ArrayBuffer) {
    return new Promise((resolve) => {
        assetData[uri] = data;
        informPeerNetwork(uri);

        resolve(assetData[uri]);
    });
}

export function getAssetData(uri: string) {
    return new Promise((resolve) => {
        resolve(assetData[uri]);
    });
}

export function getAllAssetData() {
    return assetData;
}

export function setAssetId(id: string) {
    assetId = id;
}

export function getAssetId() {
    return assetId;
}