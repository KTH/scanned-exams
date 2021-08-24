/* eslint-disable react/jsx-props-no-spreading */
import React from "react";

export function P(props) {
  return <p className="mt-6" {...props} />;
}

export function H2(props) {
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h2 className="font-semibold mt-4 mb-8 text-2xl" {...props} />;
}

const baseButtonClass =
  "block w-full sm:inline-block sm:w-auto rounded-md font-semibold py-2 px-6 transition colors";

export function PrimaryButton(props) {
  return (
    <button
      type="button"
      className={`${baseButtonClass} text-white bg-blue-500 hover:bg-blue-700 mr-8`}
      {...props}
    />
  );
}

export function SecondaryButton(props) {
  return (
    <button
      type="button"
      className={`${baseButtonClass} mt-2 sm:mt-0 text-black border border-black hover:bg-gray-200`}
      {...props}
    />
  );
}
