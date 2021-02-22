import React, { FunctionComponent } from "react";
import { Provider as RouletteProvider } from "../context/roulette";
import Layout from "../components/layout";
import Chat from "../features/chat";

const HomePage: FunctionComponent = () => {
  return (
    <Layout withHeader>
      <RouletteProvider>
        <Chat />
      </RouletteProvider>
    </Layout>
  )
}

export default HomePage;
