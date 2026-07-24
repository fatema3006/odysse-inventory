"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export async function getDashboardStats() {
  const [totalProducts, totalVariants, stockAgg, lowStock, outOfStock, colorSummary] =
    await Promise.all([
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.productVariant.aggregate({ _sum: { stock: true } }),
      prisma.productVariant.count({ where: { stock: { gt: 0, lte: 5 } } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
      prisma.color.findMany({
        include: { _count: { select: { variants: true } } },
        take: 10,
      }),
    ]);

  const colorSummarySorted = [...colorSummary].sort(
    (a, b) => b._count.variants - a._count.variants
  );

  return {
    totalProducts,
    totalVariants,
    totalStock: stockAgg._sum.stock ?? 0,
    lowStock,
    outOfStock,
    colorSummary: colorSummarySorted,
  };
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      variants: {
        include: { color: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        include: { color: true },
        orderBy: [{ color: { name: "asc" } }, { size: "asc" }],
      },
    },
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  variants: {
    colorId: string;
    size?: string;
    stock: number;
    sku?: string;
  }[];
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        variants: {
          create: data.variants.map((v) => ({
            colorId: v.colorId,
            size: v.size ?? null,
            stock: v.stock,
            sku: v.sku ?? null,
          })) as unknown as Prisma.ProductVariantUncheckedCreateWithoutProductInput[],
        },
      },
      include: { variants: { include: { color: true } } },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/variants");
    return product;
  } catch (e) {
    throw e;
  }
}

export async function updateProductFull(
  id: string,
  data: {
    name: string;
    description?: string;
    variants: {
      colorId: string;
      size?: string;
      stock: number;
      sku?: string;
    }[];
  }
) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (data.variants.length > 0) {
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              colorId: v.colorId,
              size: v.size ?? null,
              stock: v.stock,
              sku: v.sku ?? null,
            } as unknown as Prisma.ProductVariantUncheckedCreateInput,
          });
        }
      }
    });

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { color: true } } },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/variants");
    return product;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("A product with this name already exists");
    }
    throw e;
  }
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/variants");
}

export async function updateVariantStock(
  variantId: string,
  delta: number
) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });
  if (!variant) throw new Error("Variant not found");

  const newStock = Math.max(0, variant.stock + delta);

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });
  revalidatePath("/");
  revalidatePath("/variants");
  return updated;
}

export async function getColors() {
  return prisma.color.findMany({
    include: { _count: { select: { variants: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createColor(data: { name: string; hexCode: string }) {
  try {
    const color = await prisma.color.create({ data });
    revalidatePath("/");
    revalidatePath("/colors");
    revalidatePath("/variants");
    return color;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("A color with this name already exists");
    }
    throw e;
  }
}

export async function updateColor(
  id: string,
  data: { name: string; hexCode: string }
) {
  try {
    const color = await prisma.color.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/colors");
    return color;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("A color with this name already exists");
    }
    throw e;
  }
}

export async function deleteColor(id: string) {
  await prisma.color.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/colors");
}

export async function addVariantToProduct(data: {
  productId: string;
  colorId: string;
  size?: string;
  stock: number;
  sku?: string;
}) {
  try {
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        colorId: data.colorId,
        size: data.size ?? null,
        stock: data.stock,
        sku: data.sku ?? null,
      } as unknown as Prisma.ProductVariantUncheckedCreateInput,
      include: { color: true },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/variants");
    return variant;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("This variant already exists");
    }
    throw e;
  }
}

export async function deleteVariant(variantId: string) {
  await prisma.productVariant.delete({ where: { id: variantId } });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/variants");
}

export async function getVariantsByProduct(productId: string) {
  return prisma.productVariant.findMany({
    where: { productId },
    include: { color: true, product: true },
    orderBy: [{ color: { name: "asc" } }, { size: "asc" }],
  });
}
