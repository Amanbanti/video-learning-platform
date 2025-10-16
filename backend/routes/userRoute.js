import express from "express";
import { registerUser, loginUser, uploadReceipt ,verifyOtp,logoutUser,getAllUsers,updateUserSubscription } from "../controllers/userController.js";

const router = express.Router();

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

router.get("/",authMiddleware,adminMiddleware, getAllUsers);

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser)
router.put("/:id/receipt",authMiddleware, uploadReceipt);
router.put("/:userId/subscription",authMiddleware,adminMiddleware, updateUserSubscription);

export default router;
