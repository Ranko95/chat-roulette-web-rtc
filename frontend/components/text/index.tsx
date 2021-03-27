import React, { FunctionComponent } from "react";
import cn from "classnames";
import { TextTypes } from "./types";
import css from "./index.module.css";

interface IProps {
  type: TextTypes;
  className?: string;
}

const Text: FunctionComponent<IProps> = (props) => {
  const { type, className, children } = props;

  const titleClassName = cn(
    className,
    { [css.Text]: type === "text" },
    { [css.TitleWhiteExtraBig]: type === "title-white-extra-big" }
  );

  return (
    <span className={titleClassName}>
      {children}
    </span>
  )
}

export default Text;
