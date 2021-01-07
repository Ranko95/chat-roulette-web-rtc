import React, { FunctionComponent, useEffect, useState } from "react";
import css from "./index.module.css";
import TextArea from "./text-area";
import VideoArea from "./video-area";

const Chat: FunctionComponent = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const openMediaDevices = async (constraints: MediaStreamConstraints) => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  const handleStart = async () => {
    try {
      const stream = await openMediaDevices({ "video": true });
      console.log("Got MediaStream:", stream);
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media devies", error);
    }
  };

  const toggleTrack = (type: "video" | "audio"): void => {
    if (!localStream) {
      return;
    }

    if (type === "video") {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }

    if (type === "audio") {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  return (
    <div className={css.Container}>
      <VideoArea localStream={localStream} remoteStream={null} toggleTrack={toggleTrack} />
      <TextArea onStart={handleStart} />
    </div>
  )
}

export default Chat;
