const FeedbackIcon = ({ width, height, color }) => {
  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 4.52941L11.8 4.52941M4.6 8.05882H9.1M15.4 2V11.5882H8.2L3.7 16V11.5882L1 11.5882V1H15.4V2.76471"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="5.5" cy="4.5" r="1.5" fill={color} />
      </svg>
    </div>
  );
};

export default FeedbackIcon;
