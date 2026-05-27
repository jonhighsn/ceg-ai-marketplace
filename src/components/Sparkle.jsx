export const Sparkle = ({size=28, style={}}) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <path d="M14 2C14 2 15.2 9.2 18.8 11.2C22.4 13.2 26 14 26 14C26 14 22.4 14.8 18.8 16.8C15.2 18.8 14 26 14 26C14 26 12.8 18.8 9.2 16.8C5.6 14.8 2 14 2 14C2 14 5.6 13.2 9.2 11.2C12.8 9.2 14 2 14 2Z"
      fill="url(#sg)" />
    <defs>
      <linearGradient id="sg" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#63DF4E"/>
        <stop offset="100%" stopColor="#0EA5E9"/>
      </linearGradient>
    </defs>
  </svg>
);
