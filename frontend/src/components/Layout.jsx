import React from "react";
import Alert from "./Alert";
import { Container, GlobalStyle } from "./styled";

export default function Layout({ alert, children }) {
  return (
    <Container>
      <GlobalStyle />
      <Alert alert={alert} />
      {children}
    </Container>
  );
}
