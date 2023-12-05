import express from "express";
import * as businessUnitController from "../controller/business_unit";

const router = express.Router();

router.get("/", businessUnitController.getAllBusinessUnits);
router.get("/:uid", businessUnitController.getBusinessUnitDetail);
router.post("/", businessUnitController.createBusinessUnit);
router.patch("/:uid", businessUnitController.updateBusinessUnit);
router.delete("/:uid", businessUnitController.deleteBusinessUnit);

export default router;
