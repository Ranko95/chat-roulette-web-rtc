import Head from "next/head";
import "./styles.css";
//@ts-ignore
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
