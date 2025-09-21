import mongoose from "mongoose";

const userSchema = mongoose.Schema(
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
    subscriptionStatus: {
      type: String,
      enum: ["none","trial", "pending", "active"],
      default: "none",
    },
    trialVideosWatched: {
      type: Number,
      default: 0,
    },
    maxTrialVideos: {
      type: Number, // limit of free trial videos
      default: 3,
    },
    paymentReceipt: {
      type: String, // store URL or file path of uploaded receipt
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
