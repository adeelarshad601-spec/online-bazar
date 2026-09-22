import "dotenv/config";
import prisma from "../config/database.js";

async function run() {
  try {
    const product = await prisma.product.findUnique({
      where: { id: "b8ce5f1c-5256-4848-89d1-f0f0e415ce1f" },
      include: { variants: true },
    });

    console.log("Current Product:", {
      id: product?.id,
      title: product?.title,
      price: product?.price,
      variants: product?.variants.map((v) => ({ id: v.id, name: v.name, price: v.price })),
    });

    // Reset variant prices to null so they inherit the base product price ($60)
    const result = await prisma.productVariant.updateMany({
      where: { productId: "b8ce5f1c-5256-4848-89d1-f0f0e415ce1f" },
      data: { price: null },
    });

    console.log("Variant price reset result:", result);
  } catch (err) {
    console.error("Error updating variant prices:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
