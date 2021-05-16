import React, { FunctionComponent, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";

import { iceServers } from "../consts/ice-server";
import { CONNECTION_TYPE } from "../consts/webrtc/CONNECTION_TYPE";

import { IWebRtcConnectionConstructorData } from "../lib/webrtc/WebRtcConnection";
import { WebRtcController } from "../lib/webrtc/WebRtcController";

export interface ContextValue {
  socket: typeof Socket | null;
  webRTC: WebRtcController | null;
  sessionId: string | null;
  isMaster: boolean;
  isRouletteStarted: boolean;
  chatMessages: ChatMessage[];
  setIsRouletteStarted(val: boolean): void;
}

export type ChatMessage = {
  id: string;
  message: string;
  sessionId: string;
}

export enum SDP {
  OFFER = "offer",
  ANSWER = "answer",
  ICE_CANDIDATE = "ice-candidate",
}

export type sdpType = `${SDP}`;

export const Context = React.createContext<ContextValue>({} as ContextValue);

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

    socket.on("session-created", (data: { roomId: string, masterId: string }) => {
      if (data.roomId) {
        if (data.masterId === socket.id) {
          setIsMaster(true);
        }

        setSessionId(data.roomId);
      }
    });

    socket.on("peer-connection-message", async (data: any) => {
      console.log("MESSAGE", data);

      if (!webRTC) {
        return;
      }

      if (data.type === SDP.ICE_CANDIDATE) {
        await webRTC.addIceCandidate({ candidate: data.candidate });
        return;
      }
      if (data.type === SDP.ANSWER) {
        await webRTC.addAnswer({ answerSdp: data.sdp });
        return;
      }
      if (data.type === SDP.OFFER) {
        await webRTC.processOffer({ offerSdp: data.sdp });
        return;
      }
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages(p => [...p, message]);
    });
  };

  const handleGotOffer = (data: { sdp: string, type: sdpType }) => {
    if (socket) {
      socket.emit("signaling-channel", data);
    }
  };
  
  const handleGotIceCandidate = ({ candidate } : { candidate: RTCIceCandidate, }) => {
    if (socket) {
      socket.emit("signaling-channel", { type: SDP.ICE_CANDIDATE, candidate });
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
        setIsRouletteStarted,
      }}
    >
      {children}
    </Context.Provider>
  )
}
