import React, { FunctionComponent, useEffect, useRef, useMemo } from "react";
import cn from "classnames";
import Camera from "../../assets/video.svg";
import CameraOff from "../../assets/no-video.svg";
import Microphone from "../../assets/microphone.svg";
import MicrophoneOff from "../../assets/no-microphone.svg";
import { MediaTracks } from "../../features/chat/types";
import css from "./index.module.css";
interface Props {
  type: "local" | "remote";
  stream: MediaStream | null;
  toggleTrack?(type: MediaTracks): void;
}

const Video: FunctionComponent<Props> = (props) => {
  const { type, stream, toggleTrack } = props;

  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoEnabled = stream?.getVideoTracks()[0].enabled;
  const isAudioEnabled = stream?.getAudioTracks()[0].enabled;
  
  useEffect(() => {
    if (videoRef && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn(css.Container, { [css.ContainerLocal]: type === "local", [css.ContainerRemote]: type === "remote" })}>
      <video autoPlay playsInline controls={false} ref={videoRef} />
      {type === "local" ? (
      <div className={css.Controls}>
        {isVideoEnabled ? (
          <Camera onClick={() => toggleTrack && toggleTrack(MediaTracks.Video)} />
        ) : (
          <CameraOff onClick={() => toggleTrack && toggleTrack(MediaTracks.Video)} />
        )}
        {isAudioEnabled ? (
          <Microphone onClick={() => toggleTrack && toggleTrack(MediaTracks.Audio)} />
        ) : (
          <MicrophoneOff onClick={() => toggleTrack && toggleTrack(MediaTracks.Audio)} />
        )}
      </div>) : undefined}
    </div>
  )
}

export default Video;
