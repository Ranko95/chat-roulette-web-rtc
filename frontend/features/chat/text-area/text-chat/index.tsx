import React, { FunctionComponent, useRef, useState, useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
import Button from "../../../../components/button";
import MessageInput from "../../../../components/message-input";
import css from "./index.module.css";

const TextChat: FunctionComponent = () => {
  const [value, setValue] = useState<string>("");

  const messageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={css.Container}>
      <div className={css.MessagesContainer}>

      </div>
      <div className={css.MessageInputWrapper}>
        <MessageInput 
          ref={messageInputRef}
          value={value}
          placeholder="Type something..."
        />
        <Button type="grey">Send</Button>
      </div>
    </div>
  )
}

export default TextChat;
