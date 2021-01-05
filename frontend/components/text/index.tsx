import React, { FunctionComponent } from "react";
import cn from "classnames";
import { TextTypes } from "./types";
import css from "./index.module.css";

interface Props {
  type: TextTypes;
  className?: string;
}

const Text: FunctionComponent<Props> = (props) => {
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
