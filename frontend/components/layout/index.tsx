import React, { FunctionComponent } from "react";
import Header from "./header";
import css from "./index.module.css";

interface Props {
  withHeader?: boolean;
}

const Layout: FunctionComponent<Props> = (props) => {
  const { withHeader, children } = props;

  return (
    <div className={css.Container}>
      {withHeader ? <Header /> : undefined}
      <main className={css.Content}>{children}</main>
    </div>
  )
}

export default Layout;
