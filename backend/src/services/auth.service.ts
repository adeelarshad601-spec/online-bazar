import prisma from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (data: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: "CUSTOMER",
            sellerStatus: data.role === "SELLER" ? "PENDING" : undefined,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            avatar: true,
            createdAt: true,
        },
    });

    return user;
};

// Login

export const loginUser = async (data: LoginInput) => {
     const user = await prisma.user.findUnique({
         where: {
             email: data.email,
         },
     });

     if (!user) {
         throw new Error("Invalid email or password");
     }

     if (user.role === "ADMIN") {
       throw new Error("Admin accounts must use the admin login");
     }

     const isPasswordValid = await verifyPassword(user.password, data.password);

     if (!isPasswordValid) {
         throw new Error("Invalid email or password");
     }

     const token = generateToken({
    userId: user.id,
    role: user.role,
  });

     return {
         token,
         user: {
         id: user.id,
         name: user.name,
         email: user.email,
         role: user.role,
         isVerified: user.isVerified,
         avatar: user.avatar,
         createdAt: user.createdAt,
         },
     };
 };

 export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Admin Login
export const adminLogin = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.role !== "ADMIN") {
    throw new Error("This account does not have admin access");
  }

  const isPasswordValid = await verifyPassword(user.password, data.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  };
};