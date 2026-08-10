import prisma from "../config/database.js";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";
import {
  UpdateProfileInput,
  ChangePasswordInput,
} from "../validators/user.validator.js";

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
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
};

export const changePassword = async (
  userId: string,
  data: ChangePasswordInput
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await verifyPassword(
    user.password,
    data.currentPassword
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};

export const deleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};