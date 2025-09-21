import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log("Missing required fields");
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(res,user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};


// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      demoTrialUsed: user.demoTrialUsed,
      token: generateToken(user),
    });
  } catch (err) {
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
