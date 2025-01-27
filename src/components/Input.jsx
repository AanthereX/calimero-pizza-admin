/**
 * eslint-disable react-refresh/only-export-components
 *
 * @format
 */

import React, { forwardRef, memo } from "react";

const Input = forwardRef(
  (
    { className, error, onChange, defaultChecked, value, errorText, ...props },
    ref,
  ) => {
    return (
      <React.Fragment>
        <input
          className={`${className} ${error && "border-red-500 border"}`}
          onChange={onChange}
          value={value}
          defaultChecked={defaultChecked}
          ref={ref}
          {...props}
        />
        {error && (
          <span className='text-red-500 text-sm block mt-1'>{errorText}</span>
        )}
      </React.Fragment>
    );
  },
);
Input.displayName = "Input";
export default memo(Input);
