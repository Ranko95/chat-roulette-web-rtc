import React from "react";
import Text from "../../text";
import css from "./index.module.css"; 

const Header = () => {
  return (
    <div className={css.Container}>
      <Text type="title-white-extra-big">Chat Roulette</Text>
    </div>
  )
}

export default Header;
