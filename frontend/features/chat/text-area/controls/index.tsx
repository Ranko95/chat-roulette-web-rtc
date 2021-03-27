import React, { FunctionComponent, useContext } from "react";
import { Context as RouletteContext } from "../../../../context/roulette";
import Button from "../../../../components/button";
import css from "./index.module.css";

interface IProps {
  onStart(): void;
}

const Controls: FunctionComponent<IProps> = (props) => {
  const { onStart } = props;

  const { socket, sessionId, isRouletteStarted, setIsRouletteStarted } = useContext(RouletteContext);

  const handleStop = () => {
    if (socket) {
      socket.emit("stopped");
      setIsRouletteStarted(false);
    }
  };

  const handleNext = () => {
    if (socket) {
      socket.emit("next");
    }
  };

  return (
    <div className={css.Container}>
      {isRouletteStarted ? (
        <div className={css.ButtonsContainer}>
          <Button type={!sessionId ? "grey" : "danger"} onClick={handleStop}>{sessionId ? "Disconnect" : "Stop"}</Button>
          <Button type="blue" onClick={handleNext} disabled={!sessionId}>Next</Button>
        </div>
      ) : (
        <Button type="blue" onClick={onStart}>Start</Button>
      )}
    </div>
  )
}

export default Controls;
