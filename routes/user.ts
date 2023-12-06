import express from "express";
import * as userController from "../controller/user";

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:uid", userController.getUserDetail);
router.post("/", userController.createUser);
router.patch("/:uid", userController.updateUser);

export default router;
