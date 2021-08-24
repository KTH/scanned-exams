/* eslint-disable react/jsx-props-no-spreading */
import React from "react";

export function P(props) {
  return <p className="mt-6" {...props} />;
}

export function H2(props) {
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h2 className="font-semibold mt-4 mb-8 text-2xl" {...props} />;
}

export function ButtonBar(props) {
  return <div className="mt-10" {...props} />;
}

export function PrimaryButton(props) {
  return (
    <button
      type="button"
      className="bg-blue-500 text-white rounded-md font-semibold py-2 px-6 mt-4 hover:bg-blue-700 transition-colors mr-4"
      {...props}
    />
  );
}

export function LinkButton(props) {
  return (
    <button
      type="button"
      className="text-blue-500 rounded-md font-semibold py-2 px-6 mt-4 mb-2 hover:text-blue-700 transition-colors ml-4"
      {...props}
    />
  );
}
