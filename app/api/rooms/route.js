import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  buildDerangement,
  makeId,
  normalizeName,
} from "@/lib/secret-santa";

function addParticipant(seen, list, rawName, wishes = "") {
  const key = normalizeName(rawName);
  if (!key || seen.has(key)) return null;

  seen.add(key);
  list.push({
    id: makeId(8),
    name: key,
    nameKey: key,
    wishes: String(wishes || "").trim(),
    assignmentTo: null,
    assignmentRevealed: false,
  });
  return key;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const maxPrice =
      body.maxPrice === "" || body.maxPrice == null
        ? null
        : Number(body.maxPrice);
    const rawParticipants = Array.isArray(body.participants)
      ? body.participants
      : [];
    const organizerKey = normalizeName(String(body.organizerName || ""));

    if (!organizerKey) {
      return NextResponse.json(
        { error: "Organizator mora upisati svoje ime" },
        { status: 400 },
      );
    }

    const seen = new Set();
    const participants = [];

    addParticipant(seen, participants, organizerKey, "");

    for (const p of rawParticipants) {
      const rawName = String(p.name || "").trim();
      if (!rawName) continue;
      if (seen.has(normalizeName(rawName))) {
        return NextResponse.json(
          { error: `Ime je duplo uneseno` },
          { status: 400 },
        );
      }
      addParticipant(seen, participants, rawName, p.wishes);
    }

    if (participants.length < 2) {
      return NextResponse.json(
        { error: "Potrebna su barem 2 osobe (ti + još jedna)" },
        { status: 400 },
      );
    }

    if (maxPrice != null && (Number.isNaN(maxPrice) || maxPrice < 0)) {
      return NextResponse.json(
        { error: "Maksimalna cijena nije valjana" },
        { status: 400 },
      );
    }

    const assignmentMap = buildDerangement(participants.map((p) => p.id));
    for (const p of participants) {
      p.assignmentTo = assignmentMap[p.id];
    }

    const roomId = makeId(4);
    const room = {
      roomId,
      organizerName: organizerKey,
      organizerNameKey: organizerKey,
      maxPrice,
      participants,
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection("rooms").insertOne(room);

    return NextResponse.json({
      roomId,
      linkPath: `/room/${roomId}`,
    });
  } catch (err) {
    console.error(err);
    const message =
      err.message === "MongoDB nije konfiguriran"
        ? "Baza nije konfigurirana (provjeri .env.local)"
        : "Nešto nije u redu pri stvaranju grupe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}