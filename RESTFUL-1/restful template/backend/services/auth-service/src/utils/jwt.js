import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.authUserId || user.id,
      profileId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);
