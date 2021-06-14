import React from "react";
import Text, { TextOptions } from "../../text";
import css from "./index.module.css"; 

const Header = () => {
  return (
    <div className={css.Container}>
      <Text type={TextOptions.TITLE_WHITE_EXTRA_BIG}>Chat Roulette</Text>
    </div>
  )
}

export default Header;
