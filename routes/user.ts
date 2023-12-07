import express from "express";
import * as userController from "../controller/user";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, userController.getAllUsers);
router.get("/:uid", auth, userController.getUserDetail);
router.post("/signup", userController.createUser);
router.post("/signin", userController.loginUser);
router.patch("/:uid", auth, userController.updateUser);
router.delete("/:uid", auth, userController.deleteUser);
router.patch("/change-password/:uid", auth, userController.changePassword);
router.patch("/soft-delete/:uid", auth, userController.softDelete);

export default router;
