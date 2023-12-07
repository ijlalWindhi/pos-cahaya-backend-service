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
        roles: true,
      },
    });
    return res.status(200).json({ message: "Success get data", data: users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, roleUid, telephone } = req.body;

  if (!name || !email || !password || !roleUid) {
    return res.status(400).json({
      message: `${
        !name
          ? "Name"
          : !email
          ? "Email"
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
        roles: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (user.status === "INACTIVE") {
      return res.status(400).json({ message: "User is inactive" });
    }

    const isPasswordMatch = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const secretKey = process.env.SECRET_KEY || "default_secret_key";
    const token = jsonwebtoken.sign(
      {
        user: { uid: user.uid, email: user.email, name: user.name },
        role: user.roles,
      },
      secretKey,
      { expiresIn: "1d" }
    );

    // update table token
    const addToken = await prisma.token.create({
      data: {
        uid: uuidv4(),
        token,
        type: "Bearer",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        blacklisted: false,
      },
    });

    await prisma.user.update({
      where: { uid: user.uid },
      data: { lastLogin: new Date(), tokenUid: addToken.uid },
    });

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
  const { name, email, roleUid, telephone } = req.body;

  if (!name || !email || !roleUid || !telephone) {
    return res.status(400).json({
      message: `${
        !name ? "Name" : !email ? "Email" : !roleUid ? "Role UID" : "Telephone"
      } is required`,
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
        roleUid,
        telephone,
      },
    });

    return res.status(200).json({ message: "Success update user", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: `${!oldPassword ? "Old" : "New"} password is required`,
    });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { uid } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = existingUser.password
      ? await bcrypt.compare(oldPassword, existingUser.password)
      : false;
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const user = await prisma.user.update({
      where: { uid },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return res.status(200).json({
      message: "Success update password",
      data: { ...user, password: undefined },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// soft delete
export const softDelete = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingUser = await prisma.user.findUnique({ where: { uid } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { uid },
      data: { status: "INACTIVE" },
    });

    return res.status(200).json({ message: "Success delete user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingUser = await prisma.user.findUnique({ where: { uid } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({ where: { uid } });

    return res.status(200).json({ message: "Success delete user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
