import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import nodemailer from "nodemailer";
import crypto from "crypto";


// @desc    Register user and send OTP
// @route   POST /api/users/register
// @access  Public
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
    const otpExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month

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
    
    generateToken(res, user);


    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${otp}. It expires in 60 minutes.`,
    });

    res.status(201).json({ message: "OTP sent to email", email: user.email});
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

    res.status(200).json({ message: "User verified successfully",user });
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
    generateToken(res, user);

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
}




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
  const { userId } = req.params
  const { status } = req.body

  if (!["Trial", "Active"].includes(status)) {
    return res.status(400).json({ message: "Invalid subscription status" })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.subscriptionStatus = status
    await user.save()

    // Return updated user (excluding sensitive fields)
    const { password, verificationCode, verificationCodeExpires, ...userData } = user.toObject()
    res.json(userData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}


// PATCH /users/trial-video
export const updateTrialVideosWatched =  async (req, res) => {
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