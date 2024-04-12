import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: [true, "username is required"],
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: [true, "avatar image is required"],
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// pre-hook before saving the data in db
// it is kind of a middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // only encrypt the password when it is modified or saved first time
  this.password = await bcrypt.hash(this.password);
  return next();
});

// compares the password send by user and the encrypted pass stored in db
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
