import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function response(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user) };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Ploteso te gjitha fushat.");
    }
    if (await User.findOne({ email })) {
      res.status(400);
      throw new Error("Ky email ekziston.");
    }
    const user = await User.create({ name, email, password });
    res.status(201).json(response(user));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password))) {
      res.status(401);
      throw new Error("Email ose password i gabuar.");
    }
    if (user.isActive === false) {
      res.status(403);
      throw new Error("Llogaria eshte e caktivizuar.");
    }
    res.json(response(user));
  } catch (error) {
    next(error);
  }
}
