export default function LoadingDots({ className = "" }) {
  return (
    <span className={`loading-dots inline-flex ${className}`} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}