import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
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
    req.user = decoded as jwt.JwtPayload;
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(400).json({ message: "Invalid token" });
  }
};
