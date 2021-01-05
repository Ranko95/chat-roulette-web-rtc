import React from "react";
import { NextPage, NextPageContext } from "next";
import Error from "next/error";

interface Props {
  statusCode?: number;
}

const ErrorPage: NextPage<Props> = ({ statusCode }) => {
  switch (statusCode) {
    case 404:
    case 403:
    case 500:
    case 502:
      return <Error statusCode={statusCode} />
    default:
      return <div>"Unexpected error"</div>;
  }
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404

  return { statusCode }
}

export default ErrorPage;
