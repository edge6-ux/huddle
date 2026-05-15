import { Router } from "express";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function generateSlug(): string {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "lowerCase",
  });
  return `${name}-${Math.floor(Math.random() * 90) + 10}`;
}

// POST /api/instant-room — create a one-off room not tied to any team
router.post("/", requireAuth, async (req, res) => {
  let slug = generateSlug();
  let attempts = 0;
  while ((await prisma.room.findUnique({ where: { slug } })) && attempts < 10) {
    slug = generateSlug();
    attempts++;
  }

  const room = await prisma.room.create({
    data: { slug, name: "Instant call", ownerId: req.user!.id },
  });

  res.status(201).json({ slug: room.slug, name: room.name });
});

export default router;
