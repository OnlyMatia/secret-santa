import LoadingDots from "./LoadingDots";

export default function DrawRitual() {
  return (
    <div className="draw-overlay glass mt-8 rounded-[2rem] p-8 text-center">
      <div className="flip-ritual" />
      <p className="text-sm font-medium text-slate-300">Miješam imena</p>
      <div className="mt-4 flex justify-center">
        <LoadingDots />
      </div>
    </div>
  );
}