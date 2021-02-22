import React, { FunctionComponent } from "react";
import Video from "../../../components/video";
import { MediaTracks } from "../types";
import css from "./index.module.css";

interface Props {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  toggleTrack(type: MediaTracks): void;
}

const VideoArea: FunctionComponent<Props> = (props) => {
  const { localStream, remoteStream, toggleTrack } = props;

  return (
    <div className={css.Container}>
      <Video type="remote" stream={remoteStream} />
      <Video type="local" stream={localStream} toggleTrack={toggleTrack} />
    </div>
  )
}

export default VideoArea;
