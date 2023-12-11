import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const getProductDetail = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { uid },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Success get data", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { businessUnitUid: req?.user?.business },
    });

    res.status(200).json({ message: "Success get data", data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProductsByBusinessUnit = async (
  req: Request,
  res: Response
) => {
  const { uid } = req.params;

  try {
    const products = await prisma.product.findMany({
      where: { businessUnitUid: uid },
    });

    res.status(200).json({ message: "Success get data", data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    quantity,
    description,
    priceBuy,
    priceSell,
    code,
    photo,
    categoryUid,
    businessUnitUid,
  } = req.body;

  if (
    !name ||
    !quantity ||
    !priceBuy ||
    !priceSell ||
    !categoryUid ||
    !businessUnitUid
  ) {
    return res.status(400).json({
      message: `${
        !name
          ? "Name"
          : !quantity
          ? "Quantity"
          : !priceBuy
          ? "Price Buy"
          : !priceSell
          ? "Price Sell"
          : !categoryUid
          ? "Category"
          : "Business Unit"
      } is required`,
    });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Code already exists" });
    }

    const product = await prisma.product.create({
      data: {
        uid: uuidv4(),
        name,
        quantity,
        description,
        priceBuy,
        priceSell,
        code,
        photo,
        categoryUid,
        businessUnitUid,
      },
    });

    res.status(201).json({ message: "Success create data", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addStockProduct = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { quantity, priceBuy, photo, dateIn, description, employeeUid } =
    req.body;

  if (!quantity || !priceBuy || !photo || !dateIn || !employeeUid) {
    return res.status(400).json({
      message: `${
        !quantity
          ? "Quantity"
          : !priceBuy
          ? "Price Buy"
          : !photo
          ? "Photo"
          : !dateIn
          ? "Date in"
          : "Employee"
      } is required`,
    });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { uid },
    });
    const dateInParsed = Date.parse(dateIn);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    } else if (isNaN(dateInParsed)) {
      return res.status(400).json({ message: "Invalid dateIn" });
    }

    const product = await prisma.product.update({
      where: { uid },
      data: {
        quantity: existingProduct.quantity + quantity,
      },
    });

    const history = await prisma.historyProduct.create({
      data: {
        uid: uuidv4(),
        productUid: uid,
        quantity,
        priceBuy,
        businessUnitUid: product.businessUnitUid,
        photo,
        dateIn: new Date(dateInParsed),
        description,
        employeeUid,
      },
    });

    res.status(200).json({
      message: "Success add stock",
      data: {
        ...history,
        quantity: product.quantity,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const {
    name,
    description,
    priceBuy,
    priceSell,
    code,
    photo,
    categoryUid,
    businessUnitUid,
  } = req.body;

  if (!name || !priceBuy || !priceSell || !categoryUid || !businessUnitUid) {
    return res.status(400).json({
      message: `${
        !name
          ? "Name"
          : !priceBuy
          ? "Price Buy"
          : !priceSell
          ? "Price Sell"
          : !categoryUid
          ? "Category"
          : "Business Unit"
      } is required`,
    });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { uid },
    });
    const existingCode = await prisma.product.findFirst({
      where: { code, NOT: { uid } },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    } else if (existingCode) {
      return res.status(400).json({ message: "Code already exist" });
    }

    const product = await prisma.product.update({
      where: { uid },
      data: {
        name,
        description,
        priceBuy,
        priceSell,
        code,
        photo,
        categoryUid,
        businessUnitUid,
      },
    });

    res.status(200).json({ message: "Success update data", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const existingCategory = await prisma.product.findUnique({
      where: { uid },
    });

    if (!existingCategory) {
      return res.status(404).send({ message: "Category not found" });
    }

    await prisma.product.delete({ where: { uid } });

    return res.status(200).json({ message: "Success delete category" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
};
