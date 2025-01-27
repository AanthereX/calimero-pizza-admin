const TextArea = ({
  className,
  error,
  errorText,
  value,
  typehere,
  onChange,
  disabled,
  maxLength,
  length,
  ...props
}) => {
  return (
    <>
      <div className="relative mt-1">
        <textarea
          rows="4"
          disabled={disabled}
          onChange={onChange}
          className={`w-full resize-none ${className} ${
            error && "border-red-700 border"
          }`}
          placeholder={typehere}
          value={value}
          maxLength={maxLength}
        ></textarea>
      </div>
      {error && (
        <span className="text-red-500 text-sm block ml-4">{errorText}</span>
      )}
    </>
  );
};

export default TextArea;
