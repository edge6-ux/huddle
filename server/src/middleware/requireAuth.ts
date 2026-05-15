import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.session = session.session;
  req.user = session.user;
  next();
}

declare global {
  namespace Express {
    interface Request {
      session?: typeof auth.$Infer.Session.session;
      user?: typeof auth.$Infer.Session.user;
    }
  }
}
