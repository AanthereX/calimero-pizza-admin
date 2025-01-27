export default function ForwardIcon({ width, height, color, onClick }) {
  return (
    <button onClick={onClick}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 9 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 1L7.5 7.5L1 14" stroke={color} strokeLinecap="round" />
      </svg>
    </button>
  );
}
