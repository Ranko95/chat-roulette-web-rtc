import React, { FunctionComponent } from "react";
import Video from "../../../components/video";
import { VIDEO_OPTIONS } from "../../../consts/webrtc/VIDEO_TYPE";
import { IDeviceSettings } from "../../../lib/webrtc/WebRtcController";
import css from "./index.module.css";

interface IProps {
  deviceSettings: IDeviceSettings;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onToggleCamera(): void;
  onToggleMicrophone(): void;
}

const VideoArea: FunctionComponent<IProps> = (props) => {
  const { deviceSettings, localStream, remoteStream, onToggleCamera, onToggleMicrophone } = props;

  return (
    <div className={css.Container}>
      <Video type={VIDEO_OPTIONS.REMOTE} stream={remoteStream} />
      <Video 
        type={VIDEO_OPTIONS.LOCAL} 
        stream={localStream}
        hasCameraAccess={deviceSettings.hasCameraAccess}
        hasMicrophoneAccess={deviceSettings.hasMicrophoneAccess} 
        onToggleCamera={onToggleCamera} 
        onToggleMicrophone={onToggleMicrophone} 
      />
    </div>
  )
}

export default VideoArea;
