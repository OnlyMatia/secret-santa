import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isRoomOrganizer } from "@/lib/room-organizer";
import { normalizeName } from "@/lib/secret-santa";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const room = await db.collection("rooms").findOne({ roomId: id });

    if (!room) {
      return NextResponse.json({ error: "Grupa nije pronađena" }, { status: 404 });
    }

    const names = room.participants
      .map((p) => p.name)
      .sort((a, b) => a.localeCompare(b, "hr"));

    return NextResponse.json({
      roomId: room.roomId,
      maxPrice: room.maxPrice,
      participantCount: room.participants.length,
      names,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri učitavanju" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
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
        { error: "Samo organizator može obrisati grupu" },
        { status: 403 },
      );
    }

    await db.collection("rooms").deleteOne({ roomId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Brisanje nije uspjelo" }, { status: 500 });
  }
}