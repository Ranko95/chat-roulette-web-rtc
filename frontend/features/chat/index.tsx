import React, { FunctionComponent, useState, useContext, useEffect } from "react";
import { Context as RoulleteContext } from "../../context/roulette";
import TextArea from "./text-area";
import VideoArea from "./video-area";
import { INITIAL_DEVICE_SETTINGS } from "../../consts/webrtc/INITIAL_DEVICE_SETTINGS";
import { Events, IDeviceSettings } from "../../lib/webrtc/WebRtcController";
import css from "./index.module.css";

const Chat: FunctionComponent = () => {
  const { 
    socket,
    webRTC,
  } = useContext(RoulleteContext);

  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettings>(INITIAL_DEVICE_SETTINGS);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleStart = async () => {
    if (!webRTC) {
      return;
    }

    if (!webRTC.localStream) {
      await webRTC.aquireDevices();
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

  const handleDeviceSettingsUpdate = (deviceSettings: IDeviceSettings) => {
    console.log(Events.DEVICE_UPDATED, deviceSettings);
    setDeviceSettings(deviceSettings);
  };

  const handleLocalStreamUpdated = (stream: MediaStream | null) => {
    console.log(Events.LOCAL_STREAM_UPDATED, stream);
    setLocalStream(stream);
  };

  const handleRemoteStreamUpdated = (stream: MediaStream | null) => {
    console.log(Events.REMOTE_STREAM_UPDATED, stream);
    setRemoteStream(stream);
  };

  useEffect(() => {
    if (webRTC) {
      webRTC.on(Events.DEVICE_UPDATED, handleDeviceSettingsUpdate);
      webRTC.on(Events.LOCAL_STREAM_UPDATED, handleLocalStreamUpdated);
      webRTC.on(Events.REMOTE_STREAM_UPDATED, handleRemoteStreamUpdated);
    }
  }, [webRTC]);

  return (
    <div className={css.Container}>
      <VideoArea 
        deviceSettings={deviceSettings}
        localStream={localStream} 
        remoteStream={remoteStream}
        onToggleCamera={onToggleCamera} 
        onToggleMicrophone={onToggleMicrophone} 
      />
      <TextArea onStart={handleStart} />
    </div>
  )
}

export default Chat;
