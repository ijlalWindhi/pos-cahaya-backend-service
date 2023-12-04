import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getRoleDetails = async (req: Request, res: Response) => {
  const roleUid = req.params.uid;

  try {
    const role = await prisma.role.findUnique({
      where: {
        uid: String(roleUid),
      },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const role = await prisma.role.create({
        data: {
            name,
            users: {
                connect: {uid: uuidv4()}
            }
        },
    })

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};