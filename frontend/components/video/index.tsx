import React, { FunctionComponent, useEffect, useRef } from "react";
import cn from "classnames";
import Camera from "../../assets/video.svg";
import CameraOff from "../../assets/no-video.svg";
import Microphone from "../../assets/microphone.svg";
import MicrophoneOff from "../../assets/no-microphone.svg";
import { VideoOptionsType, VIDEO_OPTIONS } from "../../consts/webrtc/VIDEO_TYPE";
import css from "./index.module.css";
interface IProps {
  type: VideoOptionsType;
  stream: MediaStream | null;
  hasCameraAccess?: boolean;
  hasMicrophoneAccess?: boolean;
  onToggleCamera?(): void;
  onToggleMicrophone?(): void;
}

const Video: FunctionComponent<IProps> = (props) => {
  const { type, stream, hasCameraAccess, hasMicrophoneAccess, onToggleCamera, onToggleMicrophone } = props;

  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);


  return (
    <div className={cn(css.Container, { [css.ContainerLocal]: type === VIDEO_OPTIONS.LOCAL, [css.ContainerRemote]: type === VIDEO_OPTIONS.REMOTE })}>
      <video autoPlay playsInline controls={false} ref={videoRef} />
      {type === VIDEO_OPTIONS.LOCAL && (
        <div className={css.Controls}>
          {hasCameraAccess ? (
            <Camera onClick={() => onToggleCamera && onToggleCamera()} />
          ) : (
            <CameraOff onClick={() => onToggleCamera && onToggleCamera()} />
          )}
          {hasMicrophoneAccess ? (
            <Microphone onClick={() => onToggleMicrophone && onToggleMicrophone()} />
          ) : (
            <MicrophoneOff onClick={() => onToggleMicrophone && onToggleMicrophone()} />
          )}
        </div>
      )}
    </div>
  )
}

export default Video;
