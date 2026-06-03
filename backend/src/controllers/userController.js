import User from "../models/User.js";

const publicFields = "-password";

export async function getUsers(req, res, next) {
  try {
    res.json(await User.find().select(publicFields).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(publicFields);
    if (!user) {
      res.status(404);
      throw new Error("Perdoruesi nuk u gjet.");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      res.status(400);
      throw new Error("Ky email ekziston.");
    }
    const user = await User.create(req.body);
    res.status(201).json(await User.findById(user._id).select(publicFields));
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("Perdoruesi nuk u gjet.");
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.role = req.body.role ?? user.role;
    user.isActive = req.body.isActive ?? user.isActive;
    if (req.body.password) user.password = req.body.password;

    await user.save();
    res.json(await User.findById(user._id).select(publicFields));
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("Perdoruesi nuk u gjet.");
    }
    res.json({ message: "Perdoruesi u fshi." });
  } catch (error) {
    next(error);
  }
}
