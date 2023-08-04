import { PeerDetail } from "../../../interfaces/peer";

const RAD = Math.PI/180;

// Source: https://github.com/ubilabs/kd-tree-javascript/blob/master/examples/map/index.html
export default function distance(a: PeerDetail, b: PeerDetail) {
    let lat1 = a.lat,
    lon1 = a.lng,
    lat2 = b.lat,
    lon2 = b.lng;

    var dLat = (lat2-lat1)*RAD;
    var dLon = (lon2-lon1)*RAD;
    lat1 = lat1*RAD;
    lat2 = lat2*RAD;

    var x = Math.sin(dLat/2);
    var y = Math.sin(dLon/2);

    const aux = x*x + y*y * Math.cos(lat1) * Math.cos(lat2);
    return Math.atan2(Math.sqrt(aux), Math.sqrt( 1 - aux));
  }