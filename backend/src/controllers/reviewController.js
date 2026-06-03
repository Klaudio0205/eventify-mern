import Event from "../models/Event.js";
import Review from "../models/Review.js";

async function updateEventRating(eventId) {
  const [summary] = await Review.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: "$event", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
  ]);
  await Event.findByIdAndUpdate(eventId, {
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    reviewCount: summary?.reviewCount || 0
  });
}

export async function getReviews(req, res, next) {
  try {
    const filter = req.query.event ? { event: req.query.event } : {};
    const reviews = await Review.find(filter)
      .populate("user", "name")
      .populate("event", "title")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    await updateEventRating(review.event);
    res.status(201).json(await Review.findById(review._id).populate("user", "name").populate("event", "title"));
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const review = await Review.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!review) {
      res.status(404);
      throw new Error("Review nuk u gjet.");
    }
    await updateEventRating(review.event);
    res.json(await Review.findById(review._id).populate("user", "name").populate("event", "title"));
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const review = await Review.findOneAndDelete(filter);
    if (!review) {
      res.status(404);
      throw new Error("Review nuk u gjet.");
    }
    await updateEventRating(review.event);
    res.json({ message: "Review u fshi." });
  } catch (error) {
    next(error);
  }
}
