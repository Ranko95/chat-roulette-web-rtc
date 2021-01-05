import React, { FunctionComponent } from "react";
import Layout from "../components/layout";
import Chat from "../features/chat";

const HomePage: FunctionComponent = () => {
  return (
    <Layout withHeader>
      <Chat />
    </Layout>
  )
}

export default HomePage;
