export default function NoSearchFoundImage({ color, height, width }) {
  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox="0 0 87 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="33.5" cy="33.5" r="31.5" stroke={color} strokeWidth="4" />
        <circle cx="22" cy="25" r="4" fill={color} />
        <rect
          x="52"
          y="59.3258"
          width="9"
          height="40.2315"
          transform="rotate(-44.6572 52 59.3258)"
          fill={color}
        />
        <circle cx="46" cy="25" r="4" fill={color} />
        <path
          d="M23 45.5C28 39.5 39.5 39.5 44.5 45.5"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
