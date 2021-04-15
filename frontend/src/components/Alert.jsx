import React from "react";
import { DangerAlert, SuccessAlert } from "./styled";

function Alert({ alert }) {
  if (alert.type === "danger") {
    return <DangerAlert>{alert.message}</DangerAlert>;
  }
  if (alert.type === "success") {
    return <SuccessAlert>{alert.message}</SuccessAlert>;
  }
  return null;
}

export default Alert;
