import express from "express";
import * as roleController from "../controller/role";

const router = express.Router();

router.get("/", roleController.getAllRoles);
router.get("/:uid", roleController.getRoleDetail);
router.post("/", roleController.createRole);
router.patch("/:uid", roleController.updateRole);
router.delete("/:uid", roleController.deleteRole);

export default router;
