import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import { iceServers } from "../consts";

export interface ContextValue {
  socket: typeof Socket | null;
  sessionId: string | null;
  isMaster: boolean;
  isRouletteStarted: boolean;
  peerConnection: RTCPeerConnection | null;
  setIsRouletteStarted(val: boolean): void;
}

export const Context = React.createContext<ContextValue>({} as ContextValue);

const CONFIGURATION = {'iceServers': iceServers};

export const Provider: FunctionComponent = (props) => {
  const { children } = props;

  const [socket, setSocket] = useState<typeof Socket | null>(null);
  
  const [isRouletteStarted, setIsRouletteStarted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  
  const makeCall = async () => {
    const newPeerConnection = new RTCPeerConnection(CONFIGURATION);

    const offer = await newPeerConnection.createOffer();
    await newPeerConnection.setLocalDescription(offer);
    setPeerConnection(newPeerConnection);

    socket?.emit("signaling-channel", offer);
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
        const newPeerConnection = new RTCPeerConnection(CONFIGURATION);

        newPeerConnection.setRemoteDescription(new RTCSessionDescription(message));
        const answer = await newPeerConnection.createAnswer();
        await newPeerConnection.setLocalDescription(answer);

        setPeerConnection(newPeerConnection);

        socket.emit("signaling-channel", answer);
      }

      if (message.type === "answer") {
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
        }
      }
    });
  };

  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, []);

  useEffect(() => {
    if (sessionId && isMaster) {
      makeCall();
    }
  }, [sessionId, isMaster]);

  useEffect(() => {
    if (peerConnection) {
      console.log(peerConnection);
      peerConnection.addEventListener("icecandidate", event => {
        console.log(event, "ICE CANDIDATE");
      });
    }
  }, [peerConnection]);

  return (
    <Context.Provider
      value={{
        socket,
        sessionId,
        isMaster,
        isRouletteStarted,
        peerConnection,
        setIsRouletteStarted,
      }}
    >
      {children}
    </Context.Provider>
  )
}
