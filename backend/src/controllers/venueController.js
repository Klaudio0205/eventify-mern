import Venue from "../models/Venue.js";

export async function getVenues(req, res, next) {
  try {
    res.json(await Venue.find().sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}

export async function createVenue(req, res, next) {
  try {
    res.status(201).json(await Venue.create(req.body));
  } catch (error) {
    next(error);
  }
}

export async function updateVenue(req, res, next) {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) {
      res.status(404);
      throw new Error("Venue nuk u gjet.");
    }
    res.json(venue);
  } catch (error) {
    next(error);
  }
}

export async function deleteVenue(req, res, next) {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) {
      res.status(404);
      throw new Error("Venue nuk u gjet.");
    }
    res.json({ message: "Venue u fshi." });
  } catch (error) {
    next(error);
  }
}
