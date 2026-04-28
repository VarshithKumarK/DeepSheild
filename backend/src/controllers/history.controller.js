import Result from "../models/result.model.js";

export const getHistory = async (req, res) => {
  const data = await Result.find().sort({ createdAt: -1 });
  res.json(data);
};
