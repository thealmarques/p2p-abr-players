import { BrowserLocation, MapCoordinates } from "../interfaces/browser";

let browserLocation: BrowserLocation;

export function setBrowserLocation(id: string, coordinates: MapCoordinates) {
    browserLocation = {
        id,
        coordinates,
    };
}

export function getBrowserLocation() {
    return browserLocation;
}
