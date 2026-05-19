import * as profileService from "../services/profile.service.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Attached by protect middleware
    
    // Format joinedAt as just the year
    const joinedYear = new Date(user.joinedAt || user.createdAt).getFullYear().toString();
    
    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinedAt: joinedYear
      }
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await profileService.updateUserProfile(req.user._id, req.body);
    res.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Provide both current and new password" });
    }
    
    await profileService.changeUserPassword(req.user._id, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("changePassword error:", error);
    if (error.message === "Incorrect current password" || error.message === "User not found") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await profileService.getUserStats(req.user._id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await profileService.getScanHistory(req.user._id, skip, limit);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "deepsheild/avatars",
      public_id: req.user._id.toString(),
      overwrite: true,
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { returnDocument: 'after' }
    ).select("-password");

    res.json({
      success: true,
      data: user,
      message: "Avatar updated successfully"
    });
  } catch (error) {
    console.error("uploadAvatar error:", error);
    res.status(500).json({ success: false, message: "Avatar upload failed" });
  }
};
