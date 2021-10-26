import { useEffect, useRef } from 'react';
import { P2PShakaPlayer } from './components/p2p/shaka';

const HLS_URL = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      P2PShakaPlayer.start(videoRef.current, HLS_URL);
    }
  }, []);

  return (
    <div className="App">
      <video ref={videoRef}
        id="video"
        width="640"
        poster="//shaka-player-demo.appspot.com/assets/poster.jpg"
        controls
        autoPlay>
      </video>
    </div>
  );
}

export default App;

