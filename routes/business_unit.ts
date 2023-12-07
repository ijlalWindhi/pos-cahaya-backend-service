import express from "express";
import * as businessUnitController from "../controller/business_unit";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, businessUnitController.getAllBusinessUnits);
router.get("/:uid", auth, businessUnitController.getBusinessUnitDetail);
router.post("/", auth, businessUnitController.createBusinessUnit);
router.patch("/:uid", auth, businessUnitController.updateBusinessUnit);
router.delete("/:uid", auth, businessUnitController.deleteBusinessUnit);

export default router;
