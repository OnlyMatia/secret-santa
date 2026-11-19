import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { normalizeName } from "@/lib/secret-santa";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const nameKey = normalizeName(String(body.name || ""));
    const wishes = String(body.wishes || "").trim();

    if (!nameKey) {
      return NextResponse.json({ error: "Upiši ime" }, { status: 400 });
    }

    const db = await getDb();
    const room = await db.collection("rooms").findOne({ roomId: id });

    if (!room) {
      return NextResponse.json({ error: "Grupa nije pronađena" }, { status: 404 });
    }

    const idx = room.participants.findIndex((p) => p.nameKey === nameKey);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Nisi na popisu ove grupe" },
        { status: 403 },
      );
    }

    await db.collection("rooms").updateOne(
      { roomId: id, "participants.id": room.participants[idx].id },
      { $set: { "participants.$.wishes": wishes } },
    );

    return NextResponse.json({ ok: true, wishes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Spremanje nije uspjelo" }, { status: 500 });
  }
}