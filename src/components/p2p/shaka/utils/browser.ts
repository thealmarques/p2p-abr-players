import * as shaka from 'shaka-player';
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { getCoordinates } from './geo-location';

export function isBrowserSupported() {
    return shaka.Player.isBrowserSupported();
}

export async function getBrowserFingerPrint() {
    const fingerPrint = await FingerprintJS.load();
    const result = await fingerPrint.get();

    const coordinates = await getCoordinates(result.components.timezone.value || '');
    console.log(coordinates)
    return result.visitorId;
}