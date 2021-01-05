import React, { FunctionComponent } from "react";
import Button from "../../../../components/button";
import css from "./index.module.css";

const Controls: FunctionComponent = () => {
  return (
    <div className={css.Container}>
      <Button type="blue">Start</Button>
    </div>
  )
}

export default Controls;
