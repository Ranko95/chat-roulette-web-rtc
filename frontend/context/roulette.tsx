import React, { FunctionComponent, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import WebRTC from "../lib/webrtc";

export interface ContextValue {
  socket: typeof Socket | null;
  webRTC: WebRTC | null;
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

  const [webRTC, setWebRTC] = useState<WebRTC | null>(null);
  
  const [isRouletteStarted, setIsRouletteStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const makeCall = async () => {
    if (socket && webRTC) {
      const offer = await webRTC.createOffer();
      socket.emit("signaling-channel", offer);
    }
  };

  const connect = () => {
    const socket = socketIOClient("http://localhost:5000", { transports: ["websocket"], forceNew: true });

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

      if (message.type === "offer" && webRTC) {
        const answer = await webRTC.receiveOffer(message);
        socket.emit("signaling-channel", answer);
      }

      if (message.type === "answer" && webRTC) {
        await webRTC.receiveAnswer(message);
      }

      if (message.type === "ice-candidate" && webRTC) {
        await webRTC.receiveIceCandidate(message.candidate);
      }
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages(p => [...p, message]);
    });
  };

  const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent): void => {
    if (event.candidate && socket) {
      console.log("RECEIVED ICE CANDIDATE")
      socket.emit("signaling-channel", {type: "ice-candidate", candidate: event.candidate });
    }
  };

  const handleConnectionStateChange = (event: any): void => {
    if (!webRTC) {
      return;
    }

    const peerConnection = webRTC.peerConnection;
    if (peerConnection && peerConnection.connectionState === "connected") {
      console.log("PEERS CONNECTED!!!!");
    }
  };

  const handleAddingTrack = (event: RTCTrackEvent): void => {
    if (!webRTC) {
      return;
    }

    webRTC.addRemoteMediaTrack(event.track);
  };

  useEffect(() => {
    if (sessionId && isMaster) {
      makeCall();
    }
  }, [sessionId, isMaster]);

  useEffect(() => {
    const webRTC = new WebRTC();
    setWebRTC(webRTC);
    // if (!socket) {
    //   connect();
    // }
  }, []);

  useEffect(() => {
    if (webRTC && !socket) {
      connect();
    }
  }, [webRTC]);

  useEffect(() => {
    if (webRTC && socket) {
      webRTC.peerConnection.createDataChannel("channel");
      webRTC.peerConnection.onicecandidate = handleICECandidateEvent;
      webRTC.peerConnection.onconnectionstatechange = handleConnectionStateChange;
      webRTC.peerConnection.ontrack = handleAddingTrack;
    }
  }, [webRTC, socket]);

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
