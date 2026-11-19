import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isRoomOrganizer } from "@/lib/room-organizer";
import { buildDerangement, normalizeName } from "@/lib/secret-santa";

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

    if (!isRoomOrganizer(room, nameKey)) {
      return NextResponse.json(
        { error: "Samo organizator može resetirati izvlačenje" },
        { status: 403 },
      );
    }

    const ids = room.participants.map((p) => p.id);
    const assignmentMap = buildDerangement(ids);
    const participants = room.participants.map((p) => ({
      ...p,
      assignmentTo: assignmentMap[p.id],
      assignmentRevealed: false,
    }));

    await db.collection("rooms").updateOne(
      { roomId: id },
      {
        $set: {
          participants,
          redrawnAt: new Date(),
        },
      },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Reset nije uspio" },
      { status: 500 },
    );
  }
}