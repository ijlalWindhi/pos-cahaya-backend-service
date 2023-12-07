import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

const prisma = new PrismaClient();
dotenv.config();

export const getUserDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { uid },
      include: {
        bu: true,
        roles: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Success get data", data: user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bu: true,
        roles: true,
      },
    });
    return res.status(200).json({ message: "Success get data", data: users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, buUid, roleUid, telephone } = req.body;

  if (!name || !email || !password || !buUid || !roleUid) {
    return res.status(400).json({
      message: `${
        !name
          ? "Name"
          : !email
          ? "Email"
          : !buUid
          ? "Business unit UID"
          : !roleUid
          ? "Role UID"
          : !telephone
          ? "Telephone"
          : "Password"
      } is required`,
    });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        telephone,
        buUid,
        roleUid,
        password: await bcrypt.hash(password, 10),
        uid: uuidv4(),
      },
    });

    return res.status(201).json({ message: "Success add user", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: `${!email ? "Email" : "Password"} is required` });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        bu: true,
        roles: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const secretKey = process.env.SECRET_KEY || 'default_secret_key';
    const token = jsonwebtoken.sign(
      { user: { uid : user.uid, email: user.email, name: user.name }, role: user.roles, businessUnit: user.bu },
      secretKey,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Success login",
      data: { ...user, password: undefined },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name, email, password, buUid, roleUid, telephone } = req.body;

  if (!name || !email || !password || !buUid || !roleUid) {
    return res.status(400).json({
      message: `${
        !name
          ? "Name"
          : !email
          ? "Email"
          : !buUid
          ? "Business unit UID"
          : !roleUid
          ? "Role UID"
          : !telephone
          ? "Telephone"
          : "Password"
      } is required`,
    });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { uid } });

    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { uid } },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    } else if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await prisma.user.update({
      where: { uid },
      data: {
        name,
        email,
        buUid,
        roleUid,
        password: await bcrypt.hash(password, 10),
      },
    });

    return res.status(200).json({ message: "Success update user", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
