// routes/authRoutes.js

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
// import User from "../models/userModel.js";

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(400).json({ message: "No user found" });
    }

    res.status(201).json({ message: "User created successfully", users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, username });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, code: 401, error: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, code: 401, error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, "secretKey");
    res.status(200).json({
      success: true,
      code: 200,
      data: { token, user },
      message: "User login successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, code: 500, error: "Internal Server Error" });
  }
});

export const userRouter = router;
