import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { normalizeName } from "@/lib/secret-santa";

export async function POST(request) {
  try {
    const body = await request.json();
    const nameKey = normalizeName(String(body.name || ""));

    if (!nameKey) {
      return NextResponse.json({ error: "Upiši ime" }, { status: 400 });
    }

    const db = await getDb();
    const rooms = await db
      .collection("rooms")
      .find({
        $or: [
          { "participants.nameKey": nameKey },
          { organizerNameKey: nameKey },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .project({
        roomId: 1,
        maxPrice: 1,
        createdAt: 1,
        organizerName: 1,
        participants: 1,
      })
      .toArray();

    const groups = rooms.map((room) => ({
      roomId: room.roomId,
      maxPrice: room.maxPrice,
      createdAt: room.createdAt,
      organizerName: room.organizerName,
      participantCount: room.participants?.length ?? 0,
    }));

    return NextResponse.json({ groups, nameKey });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri učitavanju grupa" }, { status: 500 });
  }
}