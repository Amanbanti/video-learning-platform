import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ✅ Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date, // expiry timestamp
    },

    // ✅ Education level
    freshOrRemedial: {
      type: String,
      enum: ["Fresh Man", "Remedial"],
      required: true,
    },
    naturalOrSocial: {
      type: String,
      enum: ["Natural", "Social"],
      required: true,
    },

    // ✅ Subscription
    subscriptionStatus: {
      type: String,
      enum: ["none", "trial", "pending", "active"],
      default: "trial",
    },
    trialVideosWatched: {
      type: Number,
      default: 0,
    },
    maxTrialVideos: {
      type: Number,
      default: 3,
    },
    paymentReceipt: {
      type: String, // URL or file path
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword =async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}


const User = mongoose.model("User", userSchema);
export default User;
