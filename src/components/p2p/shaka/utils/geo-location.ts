const API_URL = 'http://open.mapquestapi.com';
const API_KEY = 'iTLTcX94jBYBcRX9OOxCszEidBOh8H5d';

export function getCoordinates(address: string) {
    return fetch(`${API_URL}/geocoding/v1/address?key=${API_KEY}&location=${address}`)
        .then(response => response.json())
        .then((data) => {
            return data.results[0].locations[0].latLng;
        });
}