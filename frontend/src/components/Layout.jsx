import React, { useMemo } from "react";
import { Container, DangerAlert, GlobalStyle, SuccessAlert } from "./styled";

export default function Layout({ alert, children }) {
  const Alert = useMemo(() => {
    if (alert.type === "danger") {
      return <DangerAlert>{alert.message}</DangerAlert>;
    }
    if (alert.type === "success") {
      return <SuccessAlert>{alert.message}</SuccessAlert>;
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
