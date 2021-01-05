import React, { FunctionComponent } from "react";
import cn from "classnames";
import css from "./index.module.css";

interface Props {
  type: "local" | "remote";
}

const Video: FunctionComponent<Props> = (props) => {
  const { type } = props;

  return (
    <div className={cn(css.Container, { [css.ContainerLocal]: type === "local", [css.ContainerRemote]: type === "remote" })}>
      
    </div>
  )
}

export default Video;
