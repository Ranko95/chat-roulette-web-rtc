import React, { FunctionComponent, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";

export interface ContextValue {
  socket: typeof Socket | null;
  isRouletteStarted: boolean;
  setIsRouletteStarted(val: boolean): void;
}

export const Context = React.createContext<ContextValue>({} as ContextValue);

export const Provider: FunctionComponent = (props) => {
  const { children } = props;

  const [socket, setSocket] = useState<typeof Socket | null>(null);
  
  const [isRouletteStarted, setIsRouletteStarted] = useState<boolean>(false);

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
  };
  

  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, []);

  return (
    <Context.Provider
      value={{
        socket,
        isRouletteStarted,
        setIsRouletteStarted,
      }}
    >
      {children}
    </Context.Provider>
  )
}
