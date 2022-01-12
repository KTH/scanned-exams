import React from "react";

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
    <div className="flex flex-row items-center justify-center">
      <div role="alert" className="bg-red-50 border-2 border-red-200 rounded p-12 m-12 max-w-3xl">
        <h2 className="text-xl text-red-500 font-semibold tracking-tight">{title}</h2>
        <p className="mt-6  text-lg text-black">{body}</p>
      </div>
    </div>
  );
}

"bg-red-50 border-l-4 border-red-600 text-red-800 p-4 mt-6"