import Link from "next/link";

export default function BackLink({
  href = "/",
  children = "Natrag",
  className = "",
  fullWidth = false,
  iconOnly = false,
}) {
  return (
    <Link
      href={href}
      aria-label={iconOnly ? String(children) : undefined}
      title={iconOnly ? String(children) : undefined}
      className={`back-link ${fullWidth ? "back-link-block" : ""} ${iconOnly ? "back-link-icon-only" : ""} ${className}`.trim()}
    >
      <span className="back-link-icon" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M14.5 6.5L9 12l5.5 5.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!iconOnly && <span className="back-link-text">{children}</span>}
    </Link>
  );
}