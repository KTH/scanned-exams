/* eslint-disable react/jsx-props-no-spreading */
import React from "react";

export function P(props) {
  return <p className="mt-6" {...props} />;
}

export function H2(props) {
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h2 className="font-semibold mt-4 mb-8 text-2xl" {...props} />;
}

export function BaseButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={`${className} flex w-full sm:inline-flex justify-center items-center rounded-md font-semibold py-2 text-base px-6 transition-colors`}
      {...props}
    />
  );
}

export const PrimaryButton = ({ className, disabled, ...props }) => (
  <BaseButton
    className={[
      className,
      disabled && "opacity-75",
      !disabled && "hover:bg-blue-700",
      "border border-transparent text-white bg-blue-500  mr-8",
    ].join(" ")}
    disabled={disabled}
    {...props}
  />
);

export const SecondaryButton = ({ className, ...props }) => (
  <BaseButton
    className={`${className} mt-2 sm:mt-0 text-black border border-black hover:bg-gray-200`}
    {...props}
  />
);
