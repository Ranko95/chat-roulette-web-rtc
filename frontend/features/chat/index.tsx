import React, { FunctionComponent } from "react";
import css from "./index.module.css";
import TextArea from "./text-area";
import VideoArea from "./video-area";

const Chat: FunctionComponent = () => {
  return (
    <div className={css.Container}>
      <VideoArea />
      <TextArea />
    </div>
  )
}

export default Chat;
