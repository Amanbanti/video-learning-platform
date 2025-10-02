import express from "express";
import { registerUser, loginUser, uploadReceipt ,verifyOtp,logoutUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser)
router.put("/:id/receipt", uploadReceipt);

export default router;
