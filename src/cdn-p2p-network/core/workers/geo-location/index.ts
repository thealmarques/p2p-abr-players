const API_URL = 'https://api.ipgeolocation.io/ipgeo';
const API_KEY = 'YOUR_API_KEY_HERE';

export async function getGeoLocation() {
    return fetch(`${API_URL}?apiKey=${API_KEY}`)
        .then(response => response.json()).then((data) => {
            return data;
        });
}