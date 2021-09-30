/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, useContext } from "react";

const RadioContext = createContext({
  name: undefined,
  value: undefined,
  onChange: () => {},
});

/**
 * Container for `RadioInput` components
 *
 * - When passing `value` to `RadioGroup`, the `RadioInput` that has the
 *   same `value` will be "checked"
 * - When selecting some `RadioInput`, the `onChange` from `RadioGroup` will
 *   be invoked
 */
export function RadioGroup({ value, name, onChange, ...props }) {
  return <RadioContext.Provider value={{ name, value, onChange }} {...props} />;
}

/**
 * A normal HTML radio button but with its value controlled by a parent
 * `RadioGroup` component.
 *
 * - When passing `value` to `RadioGroup`, the `RadioInput` that has the
 *   same `value` will be "checked"
 * - When selecting some `RadioInput`, the `onChange` from `RadioGroup` will
 *   be invoked
 */
export function RadioInput({ value, ...props }) {
  const ctx = useContext(RadioContext);

  return (
    <input
      type="radio"
      name={ctx.name}
      checked={ctx.value === value}
      onChange={(e) => {
        if (e.target.value === "on") {
          ctx.onChange(value);
        }
      }}
      {...props}
    />
  );
}
