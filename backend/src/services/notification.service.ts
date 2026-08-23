import prisma from "../config/database.js";

type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
};

export const createNotification = async (input: CreateNotificationInput) => {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type as any,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
    },
  });
};

const ensurePendingProductNotifications = async (userId: string) => {
  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN") return;

  const pendingProducts = await prisma.product.findMany({
    where: { status: "PENDING" },
    select: { id: true, title: true, shop: { select: { name: true } } },
  });

  for (const product of pendingProducts) {
    const message = `${product.title} from ${product.shop.name} is waiting for moderation.`;
    const exists = await prisma.notification.findFirst({
      where: {
        userId,
        type: "PRODUCT",
        title: "New product submitted for approval",
        message,
      },
    });

    if (!exists) {
      await createNotification({
        userId,
        type: "PRODUCT",
        title: "New product submitted for approval",
        message,
          actionUrl: `/seller/products/${product.id}/edit`,
      });
    }
  }
};

export const getNotifications = async (userId: string, page = 1, limit = 10) => {
  await ensurePendingProductNotifications(userId);
  const skip = (page - 1) * limit;
  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadCount = async (userId: string) => {
  await ensurePendingProductNotifications(userId);
  const count = await prisma.notification.count({ where: { userId, isRead: false } });
  return { unreadCount: count };
};

export const markAsRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Access denied");

  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
};

export const deleteNotification = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Access denied");

  return prisma.notification.delete({ where: { id } });
};

export default createNotification;
