import React from "react";

const errorTitles = {
  permission_denied: "Apologies! Permission denied",
};

const errorMessage = {
  permission_denied:
    "If you believe you should have access, reloading the webpage could resolve this issue.",
};

export default function FullPageError({ error }) {
  const title = errorTitles[error.type] || "Oops! Trouble Encountered";
  const body = errorMessage[error.type] || error.message;

  return (
    <div className="flex flex-row items-center justify-center">
      <div role="alert" className="bg-red-100 p-12 m-12 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="my-6 text-lg">{body}</p>
      </div>
    </div>
  );
}
