import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HlsPlayer({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          const token = import.meta.env.VITE_HLS_TOKEN;
          if (token) {
            xhr.setRequestHeader("X-Origin-Auth", token);
          }
        },
      });

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <video ref={videoRef} controls autoPlay muted className="w-full h-full" />
  );
}
