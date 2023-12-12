import express from "express";
import * as productController from "../controller/product";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, productController.getAllProducts);
router.get("/search", auth, productController.searchProducts);
router.get("/:uid", auth, productController.getProductDetail);
router.get(
  "/getByBusinessUnit/:uid",
  auth,
  productController.getAllProductsByBusinessUnit
);
router.post("/", auth, productController.createProduct);
router.patch("/addStock/:uid", auth, productController.addStockProduct);
router.patch("/:uid", auth, productController.updateProduct);
router.delete("/:uid", auth, productController.deleteProduct);

export default router;
