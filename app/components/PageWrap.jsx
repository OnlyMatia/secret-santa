export default function PageWrap({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-lg flex-1 px-4 pt-1 lg:max-w-7xl lg:px-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}