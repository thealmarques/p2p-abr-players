import { useEffect, useRef } from 'react';
import './App.scss';
import { PlayerType } from './cdn-p2p-network/interfaces/player';
import { createP2Player } from './cdn-p2p-network/players';

// Sample video URLs
const DASH_URL = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd';
const HLS_URL = 'http://cdnapi.kaltura.com/p/1878761/sp/187876100/playManifest/entryId/1_usagz19w/flavorIds/1_5spqkazq,1_nslowvhp,1_boih5aji,1_qahc37ag/format/applehttp/protocol/http/a.m3u8';

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && peerMapRef.current) {
      createP2Player({
        type: PlayerType.SHAKA_PLAYER,
        details: {
          element: videoRef.current,
          url: DASH_URL,
          name: 'Sample',
        },
      });
    }
  }, []);

  return (
    <div className="App">
      <div className='video-container'>
        <video ref={videoRef}
          id="video"
          width="640"
          controls
          autoPlay>
        </video>
      </div>
      <div ref={peerMapRef} id="map" className='peer-map' />
    </div>
  );
}

export default App;

