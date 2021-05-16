import React, { FunctionComponent, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";

import { iceServers } from "../consts/ice-server";

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

    socket.on("peer-connection-message", async (message: any) => {
      console.log("MESSAGE", message);

      if (!webRTC) {
        return;
      }

      if (message.type === "ice-candidate") {
        await webRTC.addIceCandidate({ candidate: message.candidate });
        return;
      }

      if (message.type === "sdp") {
        if (isMaster) {
          await webRTC.addAnswer({ answerSdp: message.sdp });
          return;
        }

        await webRTC.processOffer({ offerSdp: message.sdp });
        return;
      }
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages(p => [...p, message]);
    });
  };

  const handleGotOffer = ({ sdp }: { sdp: string }) => {
    if (socket) {
      socket.emit("signaling-channel", { type: "sdp", sdp });
    }
  };
  
  const handleGotIceCandidate = ({ candidate } : { candidate: RTCIceCandidate }) => {
    if (socket) {
      socket.emit("signaling-channel", { type: "ice-candidate", candidate });
    }
  };  

  const handleGotStream = ({ stream }: { stream: MediaStream }) => {
    console.log(stream, "GOT STREAM");
  };

  const handleIceConnectionStateDisconnected = () => {

  };

  const handleIceConnectionStateFailed = () => {

  };

  useEffect(() => {
    if (sessionId && webRTC) {
      const connectionData: IWebRtcConnectionConstructorData = {
        iceServers,
        type: isMaster ? "caller" : "callee",
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
