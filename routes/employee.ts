import express from "express";
import * as employeeController from "../controller/employee";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, employeeController.getAllEmployees);
router.get("/:uid", auth, employeeController.getEmployeeDetail);
router.get(
  "/getByBusinessUnit/:businessUnitUid",
  auth,
  employeeController.getAllEmployeesByBusinessUnit
);
router.post("/", auth, employeeController.createEmployee);
router.patch("/:uid", auth, employeeController.updateEmployee);
router.delete("/:uid", auth, employeeController.deleteEmployee);

export default router;
