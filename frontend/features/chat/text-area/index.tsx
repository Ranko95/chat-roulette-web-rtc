import React, { FunctionComponent } from "react";
import Controls from "./controls";
import css from "./index.module.css";
import TextChat from "./text-chat";

interface Props {
  onStart(): void;
}

const TextArea: FunctionComponent<Props> = (props) => {
  const { onStart } = props;

  return (
    <div className={css.Container}>
      <Controls onStart={onStart} />
      <TextChat />
    </div>
  )
}

export default TextArea;
