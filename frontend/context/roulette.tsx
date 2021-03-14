import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import { iceServers } from "../consts";

export interface ContextValue {
  socket: typeof Socket | null;
  sessionId: string | null;
  isMaster: boolean;
  isRouletteStarted: boolean;
  peerConnection: RTCPeerConnection | null;
  chatMessages: ChatMessage[];
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  setIsRouletteStarted(val: boolean): void;
  // setLocalStream(stream: MediaStream | null): void;
  // setRemoteStream(stream: MediaStream | null): void;
  setStream(stream: MediaStream | null, type: "local" | "remote"): void;
}

export type ChatMessage = {
  id: string;
  message: string;
  sessionId: string;
}

export const Context = React.createContext<ContextValue>({} as ContextValue);

const CONFIGURATION = {
  'iceServers': iceServers
};

export const Provider: FunctionComponent = (props) => {
  const { children } = props;

  const [socket, setSocket] = useState<typeof Socket | null>(null);

  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const [isRouletteStarted, setIsRouletteStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const makeCall = async () => {
    if (peerConnectionRef.current && socket) {
      const offer = await peerConnectionRef.current.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peerConnectionRef.current.setLocalDescription(offer);
  
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

      if (message.type === "offer") {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
    
          socket.emit("signaling-channel", answer);
        }
      }

      if (message.type === "answer") {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message));
        }
      }

      if (message.type === "ice-candidate") {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      }
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages(p => [...p, message]);
    });
  };

  const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate && socket) {
      socket.emit("signaling-channel", {type: "ice-candidate", candidate: event.candidate });
    }
  };

  const handleConnectionStateChange = (event: any) => {
    if (peerConnectionRef.current && peerConnectionRef.current.connectionState === "connected") {
      console.log("PEERS CONNECTED!!!!");
    }
  };

  const handleAddingTrack = (event: RTCTrackEvent) => {
    if (!remoteStreamRef.current) {
      const newStream = new MediaStream();
      newStream.addTrack(event.track);
      return setStream(newStream, "remote");
    }

    remoteStreamRef.current.addTrack(event.track);
  };

  const setStream = (stream: MediaStream | null, type: "local" | "remote") => {
    if (type === "local") {
      return localStreamRef.current = stream;
    }

    remoteStreamRef.current = stream;
  }

  useEffect(() => {
    if (sessionId && isMaster) {
      makeCall();
    }
  }, [sessionId, isMaster]);

  useEffect(() => {
    if (socket) {
      peerConnectionRef.current = new RTCPeerConnection(CONFIGURATION);

      if (peerConnectionRef.current) {
        peerConnectionRef.current.createDataChannel("channel");
        peerConnectionRef.current.onicecandidate = handleICECandidateEvent;
        peerConnectionRef.current.onconnectionstatechange = handleConnectionStateChange;
        peerConnectionRef.current.ontrack = handleAddingTrack;
      }
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, []);

  return (
    <Context.Provider
      value={{
        socket,
        sessionId,
        isMaster,
        isRouletteStarted,
        peerConnection: peerConnectionRef.current,
        chatMessages,
        localStream: localStreamRef.current,
        remoteStream: remoteStreamRef.current,
        setIsRouletteStarted,
        // setLocalStream,
        // setRemoteStream,
        setStream
      }}
    >
      {children}
    </Context.Provider>
  )
}
