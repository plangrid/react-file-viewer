import React from 'react';

const VideoViewer = props => (
  <div className="pg-driver-view" width={`${props.width}px`} height={`${props.height}px`}>
    <video
      controls
      type="video/mp4"
      src={props.filePath}
    >
      Video playback is not supported by your browser.
    </video>
  </div>
);

export default VideoViewer;
