import React, { FunctionComponent } from "react";
import Button from "../../../../components/button";
import css from "./index.module.css";

interface Props {
  onStart(): void;
}

const Controls: FunctionComponent<Props> = (props) => {
  const { onStart } = props;

  return (
    <div className={css.Container}>
      <Button type="blue" onClick={onStart}>Start</Button>
    </div>
  )
}

export default Controls;
