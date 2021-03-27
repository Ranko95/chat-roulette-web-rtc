import React, { FunctionComponent } from "react";
import Video from "../../../components/video";
import { IDeviceSettings } from "../../../lib/webrtc";
import css from "./index.module.css";

interface IProps {
  deviceSettings: IDeviceSettings;
  onToggleCamera(): void;
  onToggleMicrophone(): void;
}

const VideoArea: FunctionComponent<IProps> = (props) => {
  const { deviceSettings, onToggleCamera, onToggleMicrophone } = props;

  return (
    <div className={css.Container}>
      <Video type="remote" stream={deviceSettings.remoteStream} />
      <Video 
        type="local" 
        stream={deviceSettings.localStream}
        hasCameraAccess={deviceSettings.hasCameraAccess}
        hasMicrophoneAccess={deviceSettings.hasMicrophoneAccess} 
        onToggleCamera={onToggleCamera} 
        onToggleMicrophone={onToggleMicrophone} 
      />
    </div>
  )
}

export default VideoArea;
