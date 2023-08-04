import FingerprintJS from '@fingerprintjs/fingerprintjs'

export async function getBrowserFingerPrint(): Promise<string> {
    const fingerPrint = await FingerprintJS.load();
    const result = await fingerPrint.get();

    return result.visitorId;
}
