/** @format */

import React from "react";
import Select from "react-select";

const CustomSelect = ({
  className,
  error,
  onChange,
  errorText,
  value,
  placeholder,
  options,
  defaultValue,
  selected,
  isDisabled,
  ...props
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      background: "#FFFFFF",
      borderColor: error ? "#F10" : "#E2E2E2",
      minHeight: "49px",
      height: "49px",
      borderRadius: "0.75rem",
      borderWidth: "0.8px",
      cursor: "pointer",
      "&:active": {
        outline: "none",
        border: "none",
      },
      "&:hover": {
        borderColor: "#E2E2E2",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#181818",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? "#ED3237" : "#FFFFFF",
        color: isFocused ? "#FFFFFF" : "#000000",
        "&:hover": {
          cursor: "pointer",
        },
        "&:active": {
          outline: "none",
        },
        input: (styles) => ({ ...styles, color: "#FFFFFF" }),
      };
    },

    valueContainer: (provided, state) => ({
      ...provided,
      height: "49px",
      padding: "0 6px",
    }),

    input: (provided, state) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: (state) => ({
      display: "none",
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: "49px",
    }),
  };

  return (
    <div className='flex flex-col items-start justify-start text-start'>
      <Select
        className={`${className}`}
        styles={customStyles}
        isDisabled={isDisabled}
        options={options}
        placeholder={placeholder}
        selected={selected}
        isSearchable={false}
        onChange={onChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
      {error && (
        <span className='text-red-500 text-sm block mt-1'>{errorText}</span>
      )}
    </div>
  );
};

export default CustomSelect;
