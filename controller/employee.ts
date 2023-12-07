import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getEmployeeDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { uid },
      include: {
        businessUnit: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Success get data", data: employee });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        businessUnit: true,
      },
    });
    return res
      .status(200)
      .json({ message: "Success get data", data: employees });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEmployeesByBusinessUnit = async (
  req: Request,
  res: Response
) => {
  const { businessUnitUid } = req.params;

  try {
    const employees = await prisma.employee.findMany({
      where: { businessUnitUid },
      include: {
        businessUnit: true,
      },
    });
    return res
      .status(200)
      .json({ message: "Success get data", data: employees });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const { name, telephone, photo, address, businessUnitUid } = req.body;

  if (!name || !businessUnitUid) {
    return res.status(400).json({
      message: `${
        !name ? "Name" : !businessUnitUid ? "Business Unit" : "Telephone"
      } is required`,
    });
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        uid: uuidv4(),
        name,
        telephone,
        photo,
        address,
        businessUnitUid,
      },
    });

    res.status(201).json({
      message: "Success create employee",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name, telephone, photo, address, businessUnitUid } = req.body;

  if (!name || !businessUnitUid) {
    return res.status(400).json({
      message: `${
        !name ? "Name" : !businessUnitUid ? "Business Unit" : "Telephone"
      } is required`,
    });
  }

  try {
    const employee = await prisma.employee.update({
      where: { uid },
      data: {
        name,
        telephone,
        photo,
        address,
        businessUnitUid,
      },
    });

    res.status(200).json({
      message: "Success update employee",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const employee = await prisma.employee.delete({
      where: { uid },
    });

    res.status(200).json({
      message: "Success delete employee",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
