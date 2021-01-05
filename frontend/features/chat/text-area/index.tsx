import React, { FunctionComponent } from "react";
import Controls from "./controls";
import css from "./index.module.css";
import TextChat from "./text-chat";

const TextArea: FunctionComponent = () => {
  return (
    <div className={css.Container}>
      <Controls />
      <TextChat />
    </div>
  )
}

export default TextArea;
