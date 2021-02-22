import React, { FunctionComponent, useRef, useState, useEffect, useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import { Context as RouletteContext } from "../../../../context/roulette";
import Button from "../../../../components/button";
import Text from "../../../../components/text";
import MessageInput from "../../../../components/message-input";
import css from "./index.module.css";

const TextChat: FunctionComponent = () => {
  const [value, setValue] = useState<string>("");

  const { isRouletteStarted } = useContext(RouletteContext);

  const messageInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLDivElement>) => {
    setValue(e.target.innerText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { charCode, ctrlKey, currentTarget } = e;
    // if (charCode === 13 && ctrlKey) {
    //   e.preventDefault();
    //   console.log("ctr + enter!!")
    //   return currentTarget.innerHTML += "\n";
    // }
    if (charCode === 13) {
      e.preventDefault();
      console.log("submit");
      setValue("");
      return currentTarget.innerHTML = "";
    }

  };

  return (
    <div className={css.Container}>
      <div className={css.MessagesContainer}>
        {isRouletteStarted ? (
          <div className={css.SearchingInfo}>
            <Text type="text">Searching for a partner...</Text>
          </div>
        ) : undefined}
      </div>
      <div className={css.MessageInputWrapper}>
        <MessageInput 
          ref={messageInputRef}
          value={value}
          placeholder="Type something..."
          onInput={handleInput}
          onKeyPress={handleKeyPress}
        />
        <Button type="grey">Send</Button>
      </div>
    </div>
  )
}

export default TextChat;
