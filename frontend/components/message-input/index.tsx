import React, { forwardRef, useState, useEffect } from "react";
import cn from "classnames";
import Scrollbars from "react-custom-scrollbars";
import css from "./index.module.css";

interface Props {
  value: string;
  placeholder: string;
}

const MessageInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { value, placeholder } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const messageInputClassName = cn(css.MessageInput, { [css.Placeholder]: !isFocused && value.length === 0 });

  const handleFocus = () => {
    setIsFocused(true);
    if (value.length === 0) {
      //@ts-ignore
      ref.current.innerText = "";
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value.length === 0) {
      //@ts-ignore
      ref.current.innerHTML = placeholder;
    }
  };

  useEffect(() => {
    if (!isFocused && value.length === 0) {
      //@ts-ignore
      ref.current.innerHTML = placeholder;
    }
  }, [value]);

  return (
    <div className={css.ScrollContainer}>
      <Scrollbars universal autoHide>
        <div 
          className={messageInputClassName}
          contentEditable
          suppressContentEditableWarning
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Scrollbars>
    </div>
  )
});

export default MessageInput;
