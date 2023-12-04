import express from "express";
import * as userController from "../controller/user";

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:uid", userController.getUserDetails);

export default router;
