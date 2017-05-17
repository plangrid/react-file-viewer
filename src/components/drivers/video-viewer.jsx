import React from "react";

const VideoViewer = props => {
  const width = `${props.width}px`;
  const height =  `${props.height}px`;

  return (
    <div className="pg-driver-view" width={width} height={height}>
      <video
        controls
        type="video/mp4"
        src={props.filePath}
      >
        Video playback is not supported by your browser.
      </video>
    </div>
  )
};

export default VideoViewer;
