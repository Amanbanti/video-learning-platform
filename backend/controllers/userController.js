import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emailService.js";
import axios from "axios";


export const registerUser = async (req, res) => {
  const { name, email, password, freshOrRemedial, naturalOrSocial } = req.body;

  if (!name || !email || !password || !freshOrRemedial || !naturalOrSocial) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit code
    const otpExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      freshOrRemedial,
      naturalOrSocial,
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpires: otpExpiry,
    });

    if (!user) {
      return res.status(500).json({ message: "User creation failed" });
    }

    // Set auth cookie
    generateToken(req, res, user);

    console.log("Brevo API Key:", process.env.BREVO_API_KEY);

    // Send verification email via Brevo
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: process.env.EMAIL_SENDER_NAME || "Your App Name",
            email: process.env.EMAIL_SENDER,
          },
          to: [{ email, name }],
          subject: "Your Verification Code",
          htmlContent: `<p>Your verification code is: <b>${otp}</b></p><p>It expires in 60 minutes.</p>`,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (emailError) {
      console.error("Brevo email failed:", emailError.response?.data || emailError.message);
    }

    res.status(201).json({ message: "OTP sent to email", email: user.email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "User verified successfully", user });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // make sure password is included
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // User exists, generate token
    generateToken(req, res, user);

    res.status(200).json({ user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
  });
  res.json({ message: 'Logged out successfully' });
};

// @desc    Upload payment receipt
// @route   PUT /api/users/:id/receipt
// @access  Private
export const uploadReceipt = async (req, res) => {
  const userId = req.params.id;
  const { receiptUrl } = req.body; // frontend sends uploaded file URL

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.paymentReceipt = receiptUrl;
    user.subscriptionStatus = "pending"; // waiting for admin approval
    await user.save();

    res.json({ message: "Receipt uploaded, pending approval", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all users with pagination + optional search
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.userPage) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.searchQuery?.trim() || "";

    const skip = (page - 1) * limit;

    // 🔍 Build search filter
    const filter = {
      isAdmin: { $ne: true }, // exclude admins
    };

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Fetch users (excluding sensitive data)
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .select("-password -verificationCode -verificationCodeExpires");

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserSubscription = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!["Trial", "Active"].includes(status)) {
    return res.status(400).json({ message: "Invalid subscription status" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscriptionStatus = status;
    await user.save();

    // Return updated user (excluding sensitive fields)
    const { password, verificationCode, verificationCodeExpires, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /users/trial-video
export const updateTrialVideosWatched = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.subscriptionStatus === "Active") {
      return res.json(user); // Premium users can watch unlimited
    }

    if (user.subscriptionStatus === "Pending") {
      if ((user.trialVideosWatched || 0) >= 3) {
        return res.status(403).json({ message: "Your subscription is pending. Wait admin to approve!" });
      }
    }

    if (user.subscriptionStatus === "Trial") {
      if ((user.trialVideosWatched || 0) >= 3) {
        return res.status(403).json({ message: "Trial limit reached. Upgrade to Premium to continue watching." });
      }
    }

    user.trialVideosWatched = (user.trialVideosWatched || 0) + 1;
    await user.save();

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Upload payment receipt & update user info
export const uploadPaymentReceipt = async (req, res) => {
  const { paymentMethod, paymentAmount, payerPhoneNumber } = req.body;
  const userId = req.params.id;

  // ✅ Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Get uploaded image path
  const receiptPath = req.file ? req.file.path.replace(/\\/g, "/") : null;
  if (!receiptPath) {
    res.status(400);
    throw new Error("Payment receipt image is required");
  }

  // ✅ Update payment info
  user.paymentReceipt = receiptPath;
  user.paymentMethod = paymentMethod;
  user.paymentAmount = paymentAmount;
  user.payerPhoneNumber = payerPhoneNumber;
  user.paymentDate = new Date();
  user.subscriptionStatus = "Pending";

  await user.save();

  res.status(200).json({
    message: "Payment receipt uploaded successfully",
    user,
  });
};




// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📩 SEND OTP CONTROLLER
export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP and set expiry (5 minutes)
    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP via Brevo
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: process.env.EMAIL_SENDER_NAME || "Your App Name",
            email: process.env.EMAIL_SENDER,
          },
          to: [{ email, name: user.name || "" }],
          subject: "Your Password Reset Verification Code",
          htmlContent: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border-radius:10px;border:1px solid #ddd;">
              <h2 style="text-align:center;color:#333;">Password Reset Verification</h2>
              <p style="font-size:16px;">Your verification code is:</p>
              <div style="font-size:24px;font-weight:bold;text-align:center;margin:20px 0;color:#007bff;">
                ${otp}
              </div>
              <p style="font-size:14px;color:#555;">This code will expire in 5 minutes.</p>
            </div>
          `,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (emailError) {
      console.error("Brevo email failed:", emailError.response?.data || emailError.message);
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ VERIFY OTP CONTROLLER
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.verificationCode ||
      user.verificationCode !== otp ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Clear OTP fields
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear verification fields
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error while resetting password." });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the name
    user.name = name;
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        // add any other fields you want to return
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Change password for logged-in user
// @route   PUT /api/users/update-password
// @access  Private
export const updatePasswordController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

export const fetchPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ subscriptionStatus: "Pending" }).select(
      "-password -verificationCode -verificationCodeExpires"
    );
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const updateUserPaymentSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionStatus } = req.body;

    // Validate the subscription status
    const validStatuses = ["Trial", "Pending", "Active"];
    if (!validStatuses.includes(subscriptionStatus)) {
      return res.status(400).json({ message: "Invalid subscription status." });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the subscription status
    user.subscriptionStatus = subscriptionStatus;
    await user.save();

    // Send email if user is moved to "Trial"
    if (subscriptionStatus === "Trial") {
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: {
              name: process.env.EMAIL_SENDER_NAME || "Your App Name",
              email: process.env.EMAIL_SENDER,
            },
            to: [{ email: user.email, name: user.name || "" }],
            subject: "Payment Receipt Update",
            htmlContent: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border-radius:10px;border:1px solid #ddd;">
                <h2 style="text-align:center;color:#333;">Payment Receipt Update</h2>
                <p style="font-size:16px;">Dear ${user.name},</p>
                <p style="font-size:16px;">
                  Your recent payment receipt has been <strong>moved to trial mode</strong> due to an invalid or fake receipt.
                </p>
                <p style="font-size:16px;">
                  Please try submitting your payment again or contact our support team for assistance.
                </p>
                <p style="font-size:14px;color:#555;">Thank you,<br/>Support Team</p>
              </div>
            `,
          },
          {
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (emailError) {
        console.error("Brevo email failed for trial notification:", emailError.response?.data || emailError.message);
      }
    }

    res.status(200).json({
      message: `User subscription updated to ${subscriptionStatus}.`,
      user,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Server error while updating subscription." });
  }
};


export const getUserPaymentStats = async (req, res) => {
  try {
   // Total regular users (excluding admins)
const totalUsers = await User.countDocuments({ isAdmin: false });

// Pending payments for regular users
const pendingPayments = await User.countDocuments({ subscriptionStatus: "Pending", isAdmin: false });

// Total revenue from approved payments (only regular users)
const usersWithApprovedPayments = await User.find({ subscriptionStatus: "Active", isAdmin: false });
const totalRevenue = usersWithApprovedPayments.reduce((sum, user) => sum + (user.paymentAmount || 0), 0);


    res.status(200).json({
      totalUsers,
      pendingPayments,
      totalRevenue,
    });
  } catch (err) {
    console.error("Error fetching user/payment stats:", err);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};