import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { drawStatusFromRoom, isRoomOrganizer } from "@/lib/room-organizer";
import { normalizeName } from "@/lib/secret-santa";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nameKey = normalizeName(String(body.name || ""));

    if (!nameKey) {
      return NextResponse.json({ error: "Upiši ime" }, { status: 400 });
    }

    const db = await getDb();
    const room = await db.collection("rooms").findOne({ roomId: id });

    if (!room) {
      return NextResponse.json({ error: "Grupa nije pronađena" }, { status: 404 });
    }

    const self = room.participants.find((p) => p.nameKey === nameKey);

    const status = drawStatusFromRoom(room);

    return NextResponse.json({
      inGroup: Boolean(self),
      nameKey,
      storedName: self?.name ?? null,
      wishes: self?.wishes ?? "",
      maxPrice: room.maxPrice,
      participantCount: room.participants.length,
      assignmentRevealed: self?.assignmentRevealed ?? false,
      isOrganizer: isRoomOrganizer(room, nameKey),
      drawStatus: status.participants,
      revealedCount: status.revealedCount,
      totalCount: status.totalCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}