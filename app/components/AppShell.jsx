import Snowfall from "./Snowfall";

export default function AppShell({ children }) {
  return (
    <>
      <div className="app-bg" aria-hidden />
      <Snowfall />
      <div className="animate-page-in relative z-10">{children}</div>
    </>
  );
}