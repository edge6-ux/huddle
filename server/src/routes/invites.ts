import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Mounted at /api/teams/:teamId — handles POST /invite
export const teamInviteRouter = Router({ mergeParams: true });

teamInviteRouter.post("/invite", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const parsed = z
    .object({
      expiresInDays: z.number().int().min(1).max(30).optional(),
      maxUses: z.number().int().min(1).max(1000).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = parsed.data?.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const invite = await prisma.teamInviteLink.create({
    data: {
      teamId,
      token,
      createdBy: req.user!.id,
      expiresAt,
      maxUses: parsed.data?.maxUses ?? null,
    },
  });

  res.status(201).json({ token: invite.token, expiresAt: invite.expiresAt });
});

// Mounted at /api/invite — handles GET /:token and POST /:token/accept
export const inviteRouter = Router();

inviteRouter.get("/:token", async (req, res) => {
  const token = String(req.params.token);
  const invite = await prisma.teamInviteLink.findUnique({
    where: { token },
    include: {
      team: { include: { workspace: { select: { name: true, slug: true } } } },
    },
  });

  if (!invite) {
    res.status(404).json({ error: "Invite not found" });
    return;
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    res.status(410).json({ error: "Invite has expired" });
    return;
  }
  if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
    res.status(410).json({ error: "Invite link has reached its maximum uses" });
    return;
  }

  res.json({
    teamId: invite.teamId,
    teamName: invite.team.name,
    workspaceName: invite.team.workspace.name,
    workspaceSlug: invite.team.workspace.slug,
  });
});

inviteRouter.post("/:token/accept", requireAuth, async (req, res) => {
  const token = String(req.params.token);
  const invite = await prisma.teamInviteLink.findUnique({
    where: { token },
    include: { team: { include: { workspace: true } } },
  });

  if (!invite) {
    res.status(404).json({ error: "Invite not found" });
    return;
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    res.status(410).json({ error: "Invite has expired" });
    return;
  }
  if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
    res.status(410).json({ error: "Invite link has reached its maximum uses" });
    return;
  }

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: invite.teamId, userId: req.user!.id } },
  });
  if (existing) {
    res.json({ teamId: invite.teamId, workspaceSlug: invite.team.workspace.slug });
    return;
  }

  // Add to workspace if not already a member
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: invite.team.workspaceId, userId: req.user!.id },
    },
    create: { workspaceId: invite.team.workspaceId, userId: req.user!.id, role: "MEMBER" },
    update: {},
  });

  await prisma.teamMember.create({
    data: { teamId: invite.teamId, userId: req.user!.id, role: "MEMBER" },
  });

  await prisma.teamInviteLink.update({
    where: { id: invite.id },
    data: { useCount: { increment: 1 } },
  });

  res.json({ teamId: invite.teamId, workspaceSlug: invite.team.workspace.slug });
});
