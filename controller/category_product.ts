import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getCategoryProductDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const categoryProduct = await prisma.category.findUnique({
      where: { uid },
    });

    if (!categoryProduct) {
      return res.status(404).json({ message: "Category Product not found" });
    }

    res
      .status(200)
      .json({ message: "Success get data", data: categoryProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCategoryProducts = async (req: Request, res: Response) => {
  try {
    const categoryProducts = await prisma.category.findMany();

    res
      .status(200)
      .json({ message: "Success get data", data: categoryProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCategoryProductsByBusinessUnit = async (
  req: Request,
  res: Response
) => {
  const { uid } = req.params;

  try {
    const categoryProducts = await prisma.category.findMany({
      where: { businessUnitUid: uid },
    });

    res
      .status(200)
      .json({ message: "Success get data", data: categoryProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createCategoryProduct = async (req: Request, res: Response) => {
  const { name, businessUnitUid } = req.body;

  if (!name || !businessUnitUid) {
    return res
      .status(400)
      .json({ message: `${!name ? "Name" : "Business Unit"} is required` });
  }

  try {
    const categoryProduct = await prisma.category.create({
      data: {
        uid: uuidv4(),
        name,
        businessUnitUid,
      },
    });

    res.status(201).json({
      message: "Success create category product",
      data: categoryProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCategoryProduct = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const categoryProduct = await prisma.category.update({
      where: { uid },
      data: {
        name,
      },
    });

    res.status(200).json({
      message: "Success update category product",
      data: categoryProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategoryProduct = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { uid },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category product not found" });
    }

    const categoryProduct = await prisma.category.delete({
      where: { uid },
    });

    res.status(200).json({
      message: "Success delete category product",
      data: categoryProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
