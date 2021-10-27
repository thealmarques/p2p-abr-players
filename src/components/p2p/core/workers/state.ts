import { MapCoordinates } from "./interfaces/browser";

let browserId: string;
let userLocation: MapCoordinates;

export function setBrowserId(id: string) {
    browserId = id;
}

export function getBrowserId() {
    return browserId;
}

export function setUserLocation(coordinates: MapCoordinates) {
    userLocation = coordinates;
}

export function getUserLocation() {
    return userLocation;
}