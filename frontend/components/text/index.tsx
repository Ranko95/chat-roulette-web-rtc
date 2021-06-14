import React, { FunctionComponent } from "react";
import cn from "classnames";
import css from "./index.module.css";

interface IProps {
  type: TextOptions;
  className?: string;
}

export enum TextOptions {
  TEXT = "text",
  TEXT_GREEN = "text-green",
  TEXT_BLUE = "text-blue",
  TITLE_WHITE_EXTRA_BIG = "text-white-extra-big",
}

const Text: FunctionComponent<IProps> = (props) => {
  const { type, className, children } = props;

  const titleClassName = cn(
    className,
    { [css.Text]: type === TextOptions.TEXT },
    { [css.TextGreen]: type === TextOptions.TEXT_GREEN  },
    { [css.TextBlue]: type === TextOptions.TEXT_BLUE },
    { [css.TitleWhiteExtraBig]: type === TextOptions.TITLE_WHITE_EXTRA_BIG },
  );

  return (
    <span className={titleClassName}>
      {children}
    </span>
  )
}

export default Text;
