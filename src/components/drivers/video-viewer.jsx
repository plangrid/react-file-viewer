import React from "react";

const VideoViewer = props => (
  <video
    controls
    autoPlay
    type="video/mp4"
    src={props.filePath}
  >
    Video playback is not supported by your browser.
  </video>
);

export default VideoViewer;
