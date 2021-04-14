import React, { useMemo } from "react";
import { Container, DangerAlert, GlobalStyle } from "./styled";

export default function Layout({ alert, children }) {
  const Alert = useMemo(() => {
    if (alert.type === "danger") {
      return <DangerAlert>{alert.message}</DangerAlert>;
    }
    return null;
  }, [alert]);
  return (
    <Container>
      <GlobalStyle />
      {Alert}
      {children}
    </Container>
  );
}
