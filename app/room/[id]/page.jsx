import RoomClient from "./RoomClient";

export const instant = false;

export default async function RoomPage({ params }) {
  const { id } = await params;
  return <RoomClient roomId={id} />;
}