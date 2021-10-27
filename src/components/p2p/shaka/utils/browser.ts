import * as shaka from 'shaka-player';
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export function isBrowserSupported() {
    return shaka.Player.isBrowserSupported();
}

export async function getBrowserFingerPrint(): Promise<string> {
    const fingerPrint = await FingerprintJS.load();
    const result = await fingerPrint.get();

    return result.visitorId;
}
