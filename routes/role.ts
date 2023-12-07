import express from "express";
import * as roleController from "../controller/role";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, roleController.getAllRoles);
router.get("/:uid", auth, roleController.getRoleDetail);
router.post("/", auth, roleController.createRole);
router.patch("/:uid", auth, roleController.updateRole);
router.delete("/:uid", auth, roleController.deleteRole);

export default router;
