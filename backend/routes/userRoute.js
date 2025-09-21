import express from "express";
import { registerUser, loginUser, uploadReceipt } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/:id/receipt", uploadReceipt);

export default router;
