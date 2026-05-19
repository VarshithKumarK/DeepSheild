import mongoose from "mongoose";
import User from "../models/User.js";
import ScanHistory from "../models/ScanHistory.js";
import bcrypt from "bcryptjs";

export const getUserStats = async (userId) => {
  const stats = await ScanHistory.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        fakeDetections: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$label" }, "fake"] }, 1, 0] },
        },
        realDetections: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$label" }, "real"] }, 1, 0] },
        },
        reportsGenerated: {
          $sum: { $cond: [{ $ne: ["$pdfPath", ""] }, 1, 0] },
        },
      },
    },
  ]);

  if (stats.length > 0) {
    return {
      totalScans: stats[0].totalScans,
      fakeDetections: stats[0].fakeDetections,
      realDetections: stats[0].realDetections,
      reportsGenerated: stats[0].reportsGenerated,
    };
  }

  return {
    totalScans: 0,
    fakeDetections: 0,
    realDetections: 0,
    reportsGenerated: 0,
  };
};

export const getScanHistory = async (userId, skip = 0, limit = 50) => {
  return await ScanHistory.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const updateUserProfile = async (userId, data) => {
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    returnDocument: 'after',
  }).select("-password");
  return user;
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Incorrect current password");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
};
