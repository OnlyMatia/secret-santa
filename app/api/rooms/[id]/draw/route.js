import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { normalizeName } from "@/lib/secret-santa";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nameKey = normalizeName(String(body.name || ""));

    if (!nameKey) {
      return NextResponse.json({ error: "Upiši svoje ime" }, { status: 400 });
    }

    const db = await getDb();
    const room = await db.collection("rooms").findOne({ roomId: id });

    if (!room) {
      return NextResponse.json({ error: "Grupa nije pronađena" }, { status: 404 });
    }

    const giver = room.participants.find((p) => p.nameKey === nameKey);
    if (!giver) {
      return NextResponse.json(
        {
          error:
            "To ime nije na popisu grupe. Provjeri pravopis ili pitaj organizatora.",
        },
        { status: 404 },
      );
    }

    const receiver = room.participants.find((p) => p.id === giver.assignmentTo);
    if (!receiver) {
      return NextResponse.json({ error: "Dodjela nije pronađena" }, { status: 500 });
    }

    if (!giver.assignmentRevealed) {
      await db.collection("rooms").updateOne(
        { roomId: id, "participants.id": giver.id },
        { $set: { "participants.$.assignmentRevealed": true } },
      );
    }

    return NextResponse.json({
      alreadyRevealed: giver.assignmentRevealed,
      receiver: {
        name: receiver.name,
        wishes: receiver.wishes,
      },
      maxPrice: room.maxPrice,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška pri izvlačenju" }, { status: 500 });
  }
}