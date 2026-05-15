import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";
import { createToken } from "../lib/livekit.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

const tokenSchema = z.object({
  slug: z.string().min(1),
  displayName: z.string().min(1).max(50),
});

router.post("/", async (req, res) => {
  const parsed = tokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { slug, displayName } = parsed.data;

  const room = await prisma.room.findUnique({ where: { slug } });
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  let participantId: string;
  let participantName: string;
  let userId: string | undefined;

  if (session) {
    participantId = session.user.id;
    participantName = session.user.name || displayName;
    userId = session.user.id;
  } else {
    participantId = `guest_${nanoid(8)}`;
    participantName = displayName;
  }

  // Find or create active meeting
  let meeting = await prisma.meeting.findFirst({
    where: { roomId: room.id, endedAt: null },
  });

  if (!meeting) {
    meeting = await prisma.meeting.create({
      data: { roomId: room.id },
    });
  }

  // Record participant join
  await prisma.participant.create({
    data: {
      meetingId: meeting.id,
      userId: userId ?? null,
      guestName: userId ? null : participantName,
    },
  });

  try {
    const metadata = JSON.stringify({ isGuest: !session });
    const token = await createToken(room.slug, participantName, participantId, metadata);
    const livekitUrl = process.env.LIVEKIT_URL ?? "";
    res.json({ token, livekitUrl, roomName: room.name, slug: room.slug });
  } catch (err) {
    console.error("Token generation failed:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;
