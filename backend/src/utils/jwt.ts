import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface JwtPayload {
  userId: string;
  role: string;
  tokenType?: "access" | "refresh";
}

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string = "7d"
): string => {
  return jwt.sign(
    {
      ...payload,
      tokenType: payload.tokenType || "access",
    },
    JWT_SECRET,
    {
      expiresIn: expiresIn as any,
    } as any
  );
};

export const generateAccessToken = (payload: Omit<JwtPayload, "tokenType">): string => {
  return generateToken({ ...payload, tokenType: "access" }, "15m");
};

export const generateRefreshToken = (payload: Omit<JwtPayload, "tokenType">): string => {
  return generateToken({ ...payload, tokenType: "refresh" }, "30d");
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const payload = verifyToken(token);

  if (payload.tokenType !== "access") {
    throw new Error("Invalid token type");
  }

  return payload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const payload = verifyToken(token);

  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid token type");
  }

  return payload;
};