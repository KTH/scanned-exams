import React from "react";

const errorTitles = {
  permission_denied: "Apologies! Permission denied",
};

export default function FullPageError({ error }) {
  const title = errorTitles[error.type] || "Oops! Trouble Encountered";
  return (
    <div className="flex flex-row items-center justify-center">
      <div role="alert" className="bg-red-100 p-12 m-12 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="my-6 text-lg">{error.message}</p>
      </div>
    </div>
  );
}
