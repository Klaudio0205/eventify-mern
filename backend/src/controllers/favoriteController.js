import Favorite from "../models/Favorite.js";

export async function getFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({ path: "event", populate: { path: "venue" } })
      .sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    next(error);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user._id, event: req.body.event },
      { user: req.user._id, event: req.body.event },
      { new: true, upsert: true, runValidators: true }
    ).populate({ path: "event", populate: { path: "venue" } });
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
}

export async function deleteFavorite(req, res, next) {
  try {
    const favorite = await Favorite.findOneAndDelete({ user: req.user._id, event: req.params.eventId });
    if (!favorite) {
      res.status(404);
      throw new Error("Favorite nuk u gjet.");
    }
    res.json({ message: "Eventi u hoq nga favorites." });
  } catch (error) {
    next(error);
  }
}
