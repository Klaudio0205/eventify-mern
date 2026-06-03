import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Token mungon."));
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      return next(new Error("User nuk ekziston."));
    }
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Token i pavlefshem."));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Nuk ke akses per kete veprim."));
    }
    next();
  };
}
