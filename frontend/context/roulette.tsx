import React, { FunctionComponent, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";

import { iceServers } from "../consts/ice-server";
import { CONNECTION_TYPE } from "../consts/webrtc/CONNECTION_TYPE";

import { IWebRtcConnectionConstructorData } from "../lib/webrtc/WebRtcConnection";
import { WebRtcController } from "../lib/webrtc/WebRtcController";

export interface IContextValue {
  socket: typeof Socket | null;
  webRTC: WebRtcController | null;
  sessionId: string | null;
  isMaster: boolean;
  isRouletteStarted: boolean;
  chatMessages: ChatMessage[];
  handleStop(): void;
  handleNext(): void;
}

export type ChatMessage = {
  id: string;
  message: string;
  sessionId: string;
}

export enum SDP_OPTIONS {
  OFFER = "offer",
  ANSWER = "answer",
  ICE_CANDIDATE = "ice-candidate",
}

export type SdpType = `${SDP_OPTIONS}`;

export const Context = React.createContext<IContextValue>({} as IContextValue);

export const Provider: FunctionComponent = (props) => {
  const { children } = props;

  const [socket, setSocket] = useState<typeof Socket | null>(null);

  const [webRTC, setWebRTC] = useState<WebRtcController | null>(null);
  
  const [isRouletteStarted, setIsRouletteStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const connect = () => {
    const socket = socketIOClient("/", { path: "/api/v1/roulette", transports: ["websocket"], forceNew: true });

    socket.on("connect", () => {
      setSocket(socket);
      console.log("Initial connect to roulette server");
    });

    socket.on("started", () => {
      console.log("roulette has started");
      setIsRouletteStarted(true);
    });
    
    socket.on("stopped", () => {
      setIsRouletteStarted(false);
    });

    socket.on("session-created", (data: { roomId: string, masterId: string }) => {
      if (data.roomId) {
        if (data.masterId === socket.id) {
          setIsMaster(true);
        }

        setSessionId(data.roomId);
      }
    });

    socket.on("peers-disconnected", (data: { initiatorId: string }) => {
      handleDisconnectFromRoulette({ isStarted: !(socket.id === data.initiatorId) });
    });

    socket.on("peer-connection-message", async (data: any) => {
      console.log("MESSAGE", data);

      if (!webRTC) {
        return;
      }

      if (data.type === SDP_OPTIONS.ICE_CANDIDATE) {
        await webRTC.addIceCandidate({ candidate: data.candidate });
        return;
      }
      if (data.type === SDP_OPTIONS.ANSWER) {
        await webRTC.addAnswer({ answerSdp: data.sdp });
        return;
      }
      if (data.type === SDP_OPTIONS.OFFER) {
        await webRTC.processOffer({ offerSdp: data.sdp });
        return;
      }
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages(p => [...p, message]);
    });
  };

  const handleStop = () => {
    if (socket) {
      socket.emit("stopped", { sessionId });
      // setIsRouletteStarted(false);
    }
  };

  const handleNext = () => {
    if (socket) {
      socket.emit("next", { sessionId });
    }
  };

  const handleDisconnectFromRoulette = ({ isStarted }: { isStarted: boolean }) => {
    setSessionId(null);
    setIsRouletteStarted(isStarted);
    setIsMaster(false);
    setChatMessages([]);
    if (webRTC) {
      webRTC.stopConnection();
    }
  };


  const handleGotOffer = (data: { sdp: string, type: SdpType }) => {
    if (socket) {
      socket.emit("signaling-channel", data);
    }
  };
  
  const handleGotIceCandidate = ({ candidate } : { candidate: RTCIceCandidate, }) => {
    if (socket) {
      socket.emit("signaling-channel", { type: SDP_OPTIONS.ICE_CANDIDATE, candidate });
    }
  };  

  const handleGotStream = ({ stream }: { stream: MediaStream }) => {
    console.log(stream, "GOT STREAM");
    if (!webRTC) {
      return;
    }

    webRTC.addRemoteStream({ stream });
  };

  const handleIceConnectionStateDisconnected = () => {

  };

  const handleIceConnectionStateFailed = () => {

  };

  const handleIceConnectionStateCompleted = () => {
    console.log("ICE CONNECTION COMPLETED");
  }

  useEffect(() => {
    if (sessionId && webRTC) {
      const connectionData: IWebRtcConnectionConstructorData = {
        iceServers,
        type: isMaster ? CONNECTION_TYPE.CALLER : CONNECTION_TYPE.CALLEE,
        stream: webRTC.localStream,
        onGotOffer: handleGotOffer,
        onGotCandidate: handleGotIceCandidate,
        onGotStream: handleGotStream,
        onIceConnectionStateDisconnected: handleIceConnectionStateDisconnected,
        onIceConnectionStateFailed: handleIceConnectionStateFailed,
        onIceConnectionStateCompleted: handleIceConnectionStateCompleted,
      };

      webRTC.createConnection(connectionData);
    }
  }, [sessionId, webRTC]);

  useEffect(() => {
    if (webRTC && !socket) {
      connect();
    }
  }, [webRTC]);

  useEffect(() => {
    const webRTC = new WebRtcController();
    setWebRTC(webRTC);
  }, []);

  return (
    <Context.Provider
      value={{
        socket,
        webRTC,
        sessionId,
        isMaster,
        isRouletteStarted,
        chatMessages,
        handleStop,
        handleNext,
      }}
    >
      {children}
    </Context.Provider>
  )
}
