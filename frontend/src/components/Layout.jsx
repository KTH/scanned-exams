import React from "react";
import { Container, GlobalStyle } from "./styled";

export default function Layout({ children }) {
  return (
    <Container>
      <GlobalStyle />
      {children}
    </Container>
  );
}
