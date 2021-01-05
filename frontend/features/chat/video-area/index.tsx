import React from "react";
import Video from "../../../components/video";
import css from "./index.module.css";

const VideoArea = () => {
  return (
    <div className={css.Container}>
      <Video type="remote" />
      <Video type="local" />
    </div>
  )
}

export default VideoArea;
