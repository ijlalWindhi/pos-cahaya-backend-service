import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}
const prisma = new PrismaClient();

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
  }

  try {
    const decoded = jwt.verify(token, secretKey, { algorithms: ["HS256"] });
    if (typeof decoded === "object" && "user" in decoded) {
      const user = await prisma.user.findUnique({
        where: { uid: decoded?.user?.uid },
      });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      } else if (user.status === "INACTIVE") {
        return res.status(401).json({ message: "User is inactive" });
      } else {
        req.user = decoded as jwt.JwtPayload;
        next();
      }
    }
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};
