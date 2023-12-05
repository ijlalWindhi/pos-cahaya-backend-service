import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getBusinessUnitDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const business_unit = await prisma.businessUnit.findUnique({
      where: { uid },
      include: {
        users: true,
      },
    });

    if (!business_unit) {
      return res.status(404).json({ message: "Business Unit not found" });
    }

    return res
      .status(200)
      .json({ message: "Success get data", data: business_unit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllBusinessUnits = async (req: Request, res: Response) => {
  try {
    const business_units = await prisma.businessUnit.findMany({
      include: {
        users: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return res
      .status(200)
      .json({ message: "Success get data", data: business_units });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBusinessUnit = async (req: Request, res: Response) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res
      .status(400)
      .json({ message: `${!name ? "Name" : "Location"} is required` });
  }

  try {
    const existingBusinessUnit = await prisma.businessUnit.findUnique({
      where: { name },
    });

    if (existingBusinessUnit) {
      return res.status(400).json({ message: "Name already exists" });
    }

    const business_unit = await prisma.businessUnit.create({
      data: {
        name,
        location,
        uid: uuidv4(),
      },
    });

    return res
      .status(201)
      .json({ message: "Success add business unit", data: business_unit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateBusinessUnit = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name, location } = req.body;

  if (!name || !location) {
    return res
      .status(400)
      .json({ message: `${!name ? "Name" : "Location"} is required` });
  }

  try {
    const existingBusinessUnit = await prisma.businessUnit.findUnique({
      where: { uid },
    });

    const existingName = await prisma.businessUnit.findFirst({
      where: { name, NOT: { uid } },
    });

    if (!existingBusinessUnit) {
      return res.status(404).json({ message: "Business Unit not found" });
    } else if (existingName) {
      return res.status(400).json({ message: "Name already exists" });
    }

    const business_unit = await prisma.businessUnit.update({
      where: { uid },
      data: {
        name,
        location,
      },
    });

    return res
      .status(200)
      .json({ message: "Success update business unit", data: business_unit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteBusinessUnit = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingBusinessUnit = await prisma.businessUnit.findUnique({
      where: { uid },
    });

    if (!existingBusinessUnit) {
      return res.status(404).json({ message: "Business Unit not found" });
    }

    const business_unit = await prisma.businessUnit.delete({
      where: { uid },
    });

    return res.status(200).json({ message: "Success delete business unit" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
