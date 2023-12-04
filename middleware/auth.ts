import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = (req: any, res: any, next: any) => {
  const token = req.header.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
  }

  try {
    const decoded = jwt.verify(token, secretKey, { algorithms: ["HS256"] });
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Invalid token" });
  }
};
