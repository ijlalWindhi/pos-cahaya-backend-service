import express from "express";
import * as roleCategoryController from "../controller/category_product";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, roleCategoryController.getAllCategoryProducts);
router.get("/:uid", auth, roleCategoryController.getCategoryProductDetail);
router.post("/", auth, roleCategoryController.createCategoryProduct);
router.patch("/:uid", auth, roleCategoryController.updateCategoryProduct);
router.delete("/:uid", auth, roleCategoryController.deleteCategoryProduct);

export default router;
