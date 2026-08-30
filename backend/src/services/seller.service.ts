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

  const appliedSeller = await prisma.user.update({
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

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  await Promise.all(
    admins.map(async (admin) => {
      const message = `${appliedSeller.name} (${appliedSeller.email}) submitted a new seller application.`;
      const existing = await prisma.notification.findFirst({
        where: {
          userId: admin.id,
          type: "SELLER",
          title: "New seller application received",
          message,
        },
      });

      if (!existing) {
        await createNotification({
          userId: admin.id,
          type: "SELLER",
          title: "New seller application received",
          message,
          actionUrl: "/admin/sellers?status=PENDING",
        });
      }
    })
  );

  await createNotification({
    userId: appliedSeller.id,
    type: "SELLER",
    title: "Seller application submitted",
    message: "Your seller application has been submitted and is pending admin review.",
    actionUrl: "/seller/status",
  });

  return appliedSeller;
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
        actionUrl: "/admin/sellers?status=SUSPENDED",
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

  const rejectedSeller = await prisma.user.update({
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

  await createNotification({
    userId: rejectedSeller.id,
    type: "SELLER",
    title: "Seller application rejected",
    message: "Your seller application was rejected by the admin team.",
    actionUrl: "/seller/status",
  });

  return rejectedSeller;
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

  const suspendedSeller = await prisma.user.update({
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

  await createNotification({
    userId: suspendedSeller.id,
    type: "SELLER",
    title: "Seller account suspended",
    message: "Your seller account has been suspended by the admin team.",
    actionUrl: "/seller/status",
  });

  return suspendedSeller;
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

  const reactivatedSeller = await prisma.user.update({
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

  await createNotification({
    userId: reactivatedSeller.id,
    type: "SELLER",
    title: "Seller account reactivated",
    message: "Your seller account has been reactivated and is active again.",
    actionUrl: "/seller/dashboard",
  });

  return reactivatedSeller;
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
