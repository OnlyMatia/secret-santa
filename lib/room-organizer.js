import { normalizeName } from "@/lib/secret-santa";

export function isRoomOrganizer(room, nameKey) {
  return room?.organizerNameKey === nameKey;
}

export function drawStatusFromRoom(room) {
  const participants = room.participants.map((p) => ({
    id: p.id,
    name: p.name,
    assignmentRevealed: Boolean(p.assignmentRevealed),
  }));
  const revealedCount = participants.filter((p) => p.assignmentRevealed).length;
  return {
    participants,
    revealedCount,
    totalCount: participants.length,
  };
}

export function applyParticipantRenames(room, updates) {
  const byId = new Map(
    updates.map((u) => [u.id, normalizeName(String(u.name || ""))]),
  );

  const next = room.participants.map((p) => {
    if (!byId.has(p.id)) return p;
    const newKey = byId.get(p.id);
    if (!newKey) {
      throw new Error("Ime ne smije biti prazno");
    }
    return { ...p, name: newKey, nameKey: newKey };
  });

  const keys = next.map((p) => p.nameKey);
  if (new Set(keys).size !== keys.length) {
    throw new Error("Imena se ne smiju ponavljati");
  }

  const orgBefore = room.participants.find(
    (p) => p.nameKey === room.organizerNameKey,
  );
  let organizerName = room.organizerName;
  let organizerNameKey = room.organizerNameKey;

  if (orgBefore) {
    const orgAfter = next.find((p) => p.id === orgBefore.id);
    if (orgAfter) {
      organizerName = orgAfter.name;
      organizerNameKey = orgAfter.nameKey;
    }
  }

  return { participants: next, organizerName, organizerNameKey };
}