import prisma from "../config/database.js";
import { createNotification } from "./notification.service.js";

export const applyForSeller = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      sellerStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "CUSTOMER") {
    throw new Error("Only customers can apply to become a seller");
  }

  if (user.sellerStatus === "PENDING") {
    throw new Error("Seller application is already pending");
  }

  if (user.sellerStatus === "APPROVED") {
    throw new Error("Seller is already approved");
  }

  if (user.sellerStatus === "SUSPENDED") {
    throw new Error("Suspended sellers cannot reapply");
  }

  const approvedSeller = await prisma.user.update({
    where: { id: userId },
    data: {
      sellerStatus: "PENDING",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  await createNotification({
    userId: approvedSeller.id,
    type: "SELLER",
    title: "Seller application approved",
    message: "Your seller application has been approved. Your seller portal is now active.",
    actionUrl: "/seller/dashboard",
  });

  return approvedSeller;
};

export const getMySellerStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const requestSellerReactivation = async (userId: string) => {
  const seller = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, sellerStatus: true },
  });

  if (!seller || seller.role !== "SELLER") {
    throw new Error("Seller not found");
  }

  if (seller.sellerStatus !== "SUSPENDED") {
    throw new Error("Only suspended sellers can request reactivation");
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const existingRequest = await prisma.notification.findFirst({
    where: {
      userId: { in: admins.map((admin) => admin.id) },
      type: "SELLER",
      title: "Seller reactivation requested",
      message: { contains: seller.email },
      isRead: false,
    },
  });

  if (existingRequest) {
    return { requested: false };
  }

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "SELLER",
        title: "Seller reactivation requested",
        message: `${seller.name} (${seller.email}) has requested reactivation of their suspended seller account.`,
      })
    )
  );

  return { requested: true };
};

export const getSellerApplications = async (
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
) => {
  const where = status
    ? { sellerStatus: status }
    : { sellerStatus: { not: null } };

  return await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getSellerById = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: sellerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.sellerStatus === null) {
    throw new Error("Seller not found");
  }

  return user;
};

export const approveSeller = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true,
      sellerStatus: true,
    },
  });

  if (!user || user.sellerStatus === null) {
    throw new Error("Seller not found");
  }

  if (user.sellerStatus === "APPROVED") {
    throw new Error("Seller is already approved");
  }

  if (user.sellerStatus !== "PENDING") {
    throw new Error("Only pending sellers can be approved");
  }

  const rejectedSeller = await prisma.user.update({
    where: { id: sellerId },
    data: {
      sellerStatus: "APPROVED",
      role: "SELLER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  await createNotification({
    userId: rejectedSeller.id,
    type: "SELLER",
    title: "Seller application rejected",
    message: "Your seller application was rejected by the admin team.",
    actionUrl: "/seller/status",
  });

  return rejectedSeller;
};

export const rejectSeller = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      sellerStatus: true,
    },
  });

  if (!user || user.sellerStatus === null) {
    throw new Error("Seller not found");
  }

  if (user.sellerStatus !== "PENDING") {
    throw new Error("Only pending sellers can be rejected");
  }

  return await prisma.user.update({
    where: { id: sellerId },
    data: {
      sellerStatus: "REJECTED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const suspendSeller = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true,
      sellerStatus: true,
    },
  });

  if (!user || user.sellerStatus === null) {
    throw new Error("Seller not found");
  }

  if (user.sellerStatus !== "APPROVED") {
    throw new Error("Only approved sellers can be suspended");
  }

  return await prisma.user.update({
    where: { id: sellerId },
    data: {
      sellerStatus: "SUSPENDED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const reactivateSeller = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true,
      sellerStatus: true,
    },
  });

  if (!user || user.sellerStatus === null) {
    throw new Error("Seller not found");
  }

  if (user.sellerStatus !== "SUSPENDED") {
    throw new Error("Only suspended sellers can be reactivated");
  }

  return await prisma.user.update({
    where: { id: sellerId },
    data: {
      sellerStatus: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const verifyActiveSeller = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      sellerStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "SELLER") {
    throw new Error("User is not a seller");
  }

  if (user.sellerStatus !== "APPROVED") {
    throw new Error("Seller is not active");
  }
};
