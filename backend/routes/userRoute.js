import express from "express";
import {
    registerUser, 
    loginUser, 
    uploadReceipt,
    verifyOtp,
    logoutUser,
    getAllUsers,
    updateUserSubscription,
    updateTrialVideosWatched,
    getUserById,
    uploadPaymentReceipt,
    sendOtpController,
    verifyOtpController,
    resetPassword,
    updateUserProfile,
    updatePasswordController
 } from "../controllers/userController.js";

const router = express.Router();

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

router.get("/",authMiddleware,adminMiddleware, getAllUsers);
router.get("/:id",authMiddleware, getUserById);

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser)
router.post("/send-otp", sendOtpController);
router.post("/verify-otp-reset", verifyOtpController);
router.post("/reset-password", resetPassword);
router.put("/:id/receipt",authMiddleware, uploadReceipt);
router.put("/:userId/subscription",authMiddleware,adminMiddleware, updateUserSubscription);
router.patch("/:userId/trial-video",authMiddleware, updateTrialVideosWatched);
router.put("/:id/payment-receipt",authMiddleware, upload.single("paymentReceipt"), uploadPaymentReceipt)
router.put("/:userId/profile",authMiddleware, updateUserProfile);
router.put("/:userId/password",authMiddleware, updatePasswordController);

export default router;
