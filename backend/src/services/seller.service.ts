import prisma from "../config/database.js";

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

  return await prisma.user.update({
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

  return await prisma.user.update({
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
