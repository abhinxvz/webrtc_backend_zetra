import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "idToken is required" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      res.status(400).json({ error: "Email not provided by Google" });
      return;
    }

    // Search user
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = new User({
        username: name || email.split("@")[0],
        email,
        googleId,
        avatar: picture,
      });

      await user.save();
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
};
