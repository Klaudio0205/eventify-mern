import Category from "../models/Category.js";

export async function getCategories(req, res, next) {
  try {
    res.json(await Category.find().sort({ name: 1 }));
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error("Kategoria nuk u gjet.");
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      res.status(404);
      throw new Error("Kategoria nuk u gjet.");
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error("Kategoria nuk u gjet.");
    }
    res.json({ message: "Kategoria u fshi." });
  } catch (error) {
    next(error);
  }
}
