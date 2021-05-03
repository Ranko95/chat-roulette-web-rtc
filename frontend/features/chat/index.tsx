import React, { FunctionComponent, useState, useContext, useEffect } from "react";
import { Context as RoulleteContext } from "../../context/roulette";
import TextArea from "./text-area";
import VideoArea from "./video-area";
import { IDeviceSettings } from "../../lib/webrtc";
import css from "./index.module.css";

const initialDeviceSettingsState: IDeviceSettings = {
  localStream: null,
  remoteStream: null,
  hasCameraAccess: false,
  hasMicrophoneAccess: false,
  isBlocked: false
};

const Chat: FunctionComponent = () => {
  const { 
    socket,
    webRTC,
  } = useContext(RoulleteContext);

  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettings>(initialDeviceSettingsState);

  const handleStart = async () => {
    if (!deviceSettings.localStream) {
      await webRTC?.aquireDevices();
    }

    if (socket) {
      socket.emit("start");
    }
  };

  const onToggleCamera = () => {
    if (!webRTC) {
      return;
    }

    webRTC.toggleCamera();
  };

  const onToggleMicrophone = () => {
    if (!webRTC) {
      return;
    }

    webRTC.toggleMicrophone();
  };

  const handleUpdate = (deviceSettings: IDeviceSettings) => {
    console.log("onDeviceUpdated", deviceSettings)
    setDeviceSettings(deviceSettings);
  };

  useEffect(() => {
    if (webRTC) {
      webRTC.on("onDeviceUpdated", handleUpdate);
    }
  }, [webRTC]);

  return (
    <div className={css.Container}>
      <VideoArea deviceSettings={deviceSettings} onToggleCamera={onToggleCamera} onToggleMicrophone={onToggleMicrophone} />
      <TextArea onStart={handleStart} />
    </div>
  )
}

export default Chat;
