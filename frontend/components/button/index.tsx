import React, { FunctionComponent } from "react";
import cn from "classnames";
import { ButtonTypes } from "./types";
import css from "./index.module.css";

interface Props {
  type: ButtonTypes;
  onClick?(): void;
  disabled?: boolean;
  className?: string;
}

const Button: FunctionComponent<Props> = (props) => {
  const { type, onClick, disabled, className, children } = props;

  const buttonClassName = cn(
    css.Button,
    className,
    { [css.BlueButton]: type === "blue" },
    { [css.DangerButton]: type === "danger" },
    { [css.AttentionButton]: type === "attention" },
  );

  return (
    <button 
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={css.Text}>{children}</span>
    </button>
  )
}

export default Button;
