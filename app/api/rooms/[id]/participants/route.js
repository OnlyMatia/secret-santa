import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { applyParticipantRenames, isRoomOrganizer } from "@/lib/room-organizer";
import { normalizeName } from "@/lib/secret-santa";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nameKey = normalizeName(String(body.name || ""));
    const updates = Array.isArray(body.participants) ? body.participants : [];

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
        { error: "Samo organizator može mijenjati imena" },
        { status: 403 },
      );
    }

    const ids = new Set(room.participants.map((p) => p.id));
    for (const u of updates) {
      if (!ids.has(u.id)) {
        return NextResponse.json({ error: "Nepoznat sudionik" }, { status: 400 });
      }
    }

    let patched;
    try {
      patched = applyParticipantRenames(room, updates);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    await db.collection("rooms").updateOne(
      { roomId: id },
      {
        $set: {
          participants: patched.participants,
          organizerName: patched.organizerName,
          organizerNameKey: patched.organizerNameKey,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Spremanje nije uspjelo" }, { status: 500 });
  }
}