import React from "react";
import "./FullPageError.scss";

const errorTitles: { [key: string]: string } = {
  permission_denied: "Apologies! Permission denied",
};

const errorMessage: { [key: string]: string } = {
  permission_denied:
    "If you believe you should have access, reloading the webpage could resolve this issue.",
};

export default function FullPageError({ error }: any) {
  const title = errorTitles[error.type] || "Oops! Trouble Encountered";
  const body = errorMessage[error.type] || error.message;

  return (
    <div className="FullPageError">
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        <p>{body}</p>
      </main>
    </div>
  );
}
