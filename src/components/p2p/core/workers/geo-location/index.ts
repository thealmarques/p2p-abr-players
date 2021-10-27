const API_URL = 'https://api.ipgeolocation.io/ipgeo';
const API_KEY = 'fbea1ad5c52d4901ba8887780104a784';

export async function getGeoLocation() {
    return fetch(`${API_URL}?apiKey=${API_KEY}`)
        .then(response => response.json()).then((data) => {
            return data;
        });
}