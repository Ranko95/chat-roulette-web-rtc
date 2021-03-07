import React, { FunctionComponent, useState, useContext, useEffect } from "react";
import { useUpdate } from "react-use";
import { Context as RoulleteContext } from "../../context/roulette";
import TextArea from "./text-area";
import VideoArea from "./video-area";
import { MediaTracks } from "./types";
import css from "./index.module.css";

const Chat: FunctionComponent = () => {
  const { 
    socket, 
    sessionId, 
    isMaster, 
    peerConnection, 
    localStream, 
    remoteStream, 
    setLocalStream, 
    setRemoteStream 
  } = useContext(RoulleteContext);

  const forceUpdate = useUpdate();

  const openMediaDevices = async (constraints: MediaStreamConstraints) => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  const aquireDevices = async () => {
    const stream = await openMediaDevices({ "video": true, "audio": { "echoCancellation": true } });
    console.log("Got MediaStream:", stream);
    setLocalStream(stream);
  }

  const handleStart = async () => {
    try {
      if (!localStream) {
        aquireDevices();
      }

      if (socket) {
        socket.emit("start");
      }
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  const toggleTrack = (type: MediaTracks): void => {
    if (!localStream) {
      aquireDevices();
      return
    }
    
    localStream.getTracks()
      .filter(track => track.kind === type)
      .forEach(track => track.enabled = !track.enabled);

      forceUpdate();
  };

  useEffect(() => {
    if (localStream && peerConnection) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      });
    }
  }, [localStream]);

  return (
    <div className={css.Container}>
      <VideoArea localStream={localStream} remoteStream={null} toggleTrack={toggleTrack} />
      <TextArea onStart={handleStart} />
    </div>
  )
}

export default Chat;
