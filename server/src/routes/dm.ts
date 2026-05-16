import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

router.get("/:userId", requireAuth, async (req, res) => {
  const me = req.user!.id;
  const other = req.params.userId as string;
  const before = typeof req.query.before === "string" ? req.query.before : undefined;

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: other },
        { senderId: other, receiverId: me },
      ],
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(messages.reverse());
});

const sendSchema = z.object({ content: z.string().min(1).max(4000) });

router.post("/:userId", requireAuth, async (req, res) => {
  const me = req.user!.id;
  const other = req.params.userId as string;
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  const receiver = await prisma.user.findUnique({ where: { id: other } });
  if (!receiver) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const message = await prisma.directMessage.create({
    data: { senderId: me, receiverId: other, content: parsed.data.content },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  res.status(201).json(message);
});

export default router;
