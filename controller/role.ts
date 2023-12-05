import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getRoleDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const role = await prisma.role.findUnique({
      where: { uid },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.status(200).json({ message: "Success get data", data: role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    return res.status(200).json({ message: "Success get data", data: roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { name, access } = req.body;

  if (!name || !access) {
    return res
      .status(400)
      .json({ message: `${!name ? "Name" : "Access"} is required` });
  }

  try {
    const existingRole = await prisma.role.findUnique({ where: { name } });

    if (existingRole) {
      return res.status(400).json({ message: "Name already exists" });
    }

    const role = await prisma.role.create({
      data: {
        name,
        uid: uuidv4(),
        access: [...access],
      },
    });

    return res.status(201).json({ message: "Success add role", data: role });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        message: error.message,
        code: error.code,
        details: error.meta,
      });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name, access } = req.body;

  if (!name || !access) {
    return res
      .status(400)
      .json({ message: `${!name ? "Name" : "Access"} is required` });
  }

  try {
    const existingRole = await prisma.role.findUnique({ where: { uid } });

    const existingName = await prisma.role.findFirst({
      where: { name, NOT: { uid } },
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    } else if (existingName) {
      return res.status(400).json({ message: "Name already exists" });
    }

    const role = await prisma.role.update({
      where: { uid },
      data: {
        name,
        access: [...access],
      },
    });

    return res.status(200).json({ message: "Success update role", data: role });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        message: error.message,
        code: error.code,
        details: error.meta,
      });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingRole = await prisma.role.findUnique({ where: { uid } });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    await prisma.role.delete({ where: { uid } });

    return res.status(200).json({ message: "Success delete role" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An unknown error occurred" });
  }
};
