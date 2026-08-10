import prisma from "../config/database.js";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validators/category.validator.js";

export const createCategory = async (
  data: CreateCategoryInput
) => {
  const existingName = await prisma.category.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingName) {
    throw new Error("Category name already exists");
  }

  const existingSlug = await prisma.category.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    throw new Error("Category slug already exists");
  }

  return await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      image: data.image,
    },
  });
};

export const getCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getCategoryById = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryInput
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (data.name && data.name !== category.name) {
    const existingName = await prisma.category.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingName) {
      throw new Error("Category name already exists");
    }
  }

  if (data.slug && data.slug !== category.slug) {
    const existingSlug = await prisma.category.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      throw new Error("Category slug already exists");
    }
  }

  return await prisma.category.update({
    where: {
      id: categoryId,
    },
    data,
  });
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const relatedProducts = await prisma.product.count({
    where: {
      categoryId,
    },
  });

  if (relatedProducts > 0) {
    throw new Error("Category has associated products");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};
