"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Package,
  Trash2,
  Pencil,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BottomNav } from "@/components/navigation";
import { EmptyState } from "@/components/empty-state";
import {
  createProduct,
  updateProductFull,
  deleteProduct,
  deleteVariant,
  addVariantToProduct,
  getProducts,
  getColors,
} from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface ProductWithRelations {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants: {
    id: string;
    size: string;
    stock: number;
    sku: string | null;
    color: { id: string; name: string; hexCode: string };
  }[];
}

const SIZES = ["36", "37", "38", "39", "40", "41"];

interface VariantEntry {
  tempId: string;
  colorId: string;
  size: string;
  stock: number;
  sku: string;
  noSize: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") as "low-stock" | "out-of-stock" | null;
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string; hexCode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [variants, setVariants] = useState<VariantEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const [addSizeOpen, setAddSizeOpen] = useState(false);
  const [addSizeProductId, setAddSizeProductId] = useState("");
  const [addSizeColorId, setAddSizeColorId] = useState("");
  const [addSizeColorName, setAddSizeColorName] = useState("");
  const [addSizeColorHex, setAddSizeColorHex] = useState("");
  const [addSizeValue, setAddSizeValue] = useState("36");
  const [addSizeStock, setAddSizeStock] = useState(0);
  const [addSizeSaving, setAddSizeSaving] = useState(false);
  const [addSizeExistingSizes, setAddSizeExistingSizes] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [prods, cols] = await Promise.all([getProducts(), getColors()]);
      setProducts(prods as unknown as ProductWithRelations[]);
      setColors(cols as unknown as { id: string; name: string; hexCode: string }[]);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateDialog();
      router.replace("/products");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setVariants([{ tempId: uid(), colorId: "", size: "36", stock: 0, sku: "", noSize: false }]);
    setDialogOpen(true);
  };

  const openEditDialog = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || "");
    setVariants(
      product.variants.map((v) => ({
        tempId: v.id,
        colorId: v.color.id,
        size: v.size || "36",
        stock: v.stock,
        sku: v.sku || "",
        noSize: !v.size,
      }))
    );
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setVariants([]);
  };

  const addVariant = () => {
    setVariants([...variants, { tempId: uid(), colorId: "", size: "36", stock: 0, sku: "", noSize: false }]);
  };

  const removeVariant = (tempId: string) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((v) => v.tempId !== tempId));
  };

  const updateVariant = (tempId: string, field: keyof VariantEntry, value: string | number | boolean) => {
    setVariants(variants.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)));
  };

  const handleSave = async () => {
    if (!prodName.trim()) {
      toast.error("Product name is required");
      return;
    }
    const validVariants = variants.filter((v) => v.colorId);
    if (validVariants.length === 0) {
      toast.error("Add at least one variant with a color");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProductFull(editingProduct.id, {
          name: prodName.trim(),
          description: prodDesc.trim() || undefined,
          variants: validVariants.map((v) => ({
            colorId: v.colorId,
            size: v.noSize ? undefined : v.size,
            stock: v.stock,
            sku: v.sku || undefined,
          })),
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct({
          name: prodName.trim(),
          description: prodDesc.trim() || undefined,
          variants: validVariants.map((v) => ({
            colorId: v.colorId,
            size: v.noSize ? undefined : v.size,
            stock: v.stock,
            sku: v.sku || undefined,
          })),
        });
        toast.success("Product created successfully");
      }
      closeDialog();
      fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setDeleteConfirm(null);
      fetchData();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const openAddSizeDialog = (productId: string, colorId: string, colorName: string, colorHex: string, existingSizes: string[]) => {
    setAddSizeProductId(productId);
    setAddSizeColorId(colorId);
    setAddSizeColorName(colorName);
    setAddSizeColorHex(colorHex);
    setAddSizeExistingSizes(existingSizes);
    const available = SIZES.filter((s) => !existingSizes.includes(s));
    setAddSizeValue(available[0] || SIZES[0]);
    setAddSizeStock(0);
    setAddSizeOpen(true);
  };

  const handleAddSize = async () => {
    setAddSizeSaving(true);
    try {
      await addVariantToProduct({
        productId: addSizeProductId,
        colorId: addSizeColorId,
        size: addSizeValue,
        stock: addSizeStock,
      });
      toast.success(`Size ${addSizeValue} added`);
      setAddSizeOpen(false);
      fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add size";
      toast.error(msg);
    } finally {
      setAddSizeSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant(variantId);
      toast.success("Size removed");
      fetchData();
    } catch {
      toast.error("Failed to remove size");
    }
  };

  const getProductStock = (product: ProductWithRelations) =>
    product.variants.reduce((sum, v) => sum + v.stock, 0);

  const getProductColors = (product: ProductWithRelations) =>
    [...new Set(product.variants.map((v) => v.color.name))].length;

  const getColorName = (colorId: string) => colors.find((c) => c.id === colorId)?.name || "";

  const filteredProducts = products.filter((p) => {
    if (!filter) return true;
    if (filter === "low-stock") return p.variants.some((v) => v.stock > 0 && v.stock <= 5);
    if (filter === "out-of-stock") return p.variants.some((v) => v.stock === 0);
    return true;
  });

  const filterTitle = filter === "low-stock" ? "Low Stock" : filter === "out-of-stock" ? "Out of Stock" : null;

  const isEditing = !!editingProduct;

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-background pb-24">
      <header className="bg-[#003027] text-white px-6 py-6 rounded-b-3xl shadow-md">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Products</h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              {filterTitle ? (
                <><Link href="/products" className="underline">{filterTitle}</Link> — {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</>
              ) : (
                <>{products.length} product{products.length !== 1 ? "s" : ""} total</>
              )}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
            <DialogTrigger onClick={openCreateDialog} className="bg-[#004D3F] hover:bg-[#006854] transition-all p-2.5 rounded-xl active:scale-95">
              <Plus className="w-5 h-5" />
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#003027] dark:text-[#006854]">
                  {isEditing ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Product Name *</Label>
                  <Input placeholder="e.g. Luxury Loafer" value={prodName} onChange={(e) => setProdName(e.target.value)} className="mt-1 rounded-xl" />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Description</Label>
                  <Input placeholder="Optional description" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="mt-1 rounded-xl" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">
                      Variants ({variants.length})
                    </Label>
                    <button type="button" onClick={addVariant} className="text-[10px] text-[#003027] dark:text-[#006854] font-semibold flex items-center gap-0.5 hover:underline">
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>

                  <AnimatePresence>
                    {variants.map((variant, idx) => (
                      <motion.div
                        key={variant.tempId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-gray-100 dark:border-border rounded-xl p-3 mb-2 bg-gray-50/50 dark:bg-secondary/50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-gray-400">
                            Variant {idx + 1}
                            {variant.colorId && (
                              <span className="ml-1 text-gray-500 font-normal">
                                - {getColorName(variant.colorId)}{variant.noSize ? "" : ` / Size ${variant.size}`}
                              </span>
                            )}
                          </span>
                          {variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(variant.tempId)} className="text-gray-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-gray-500">Color *</Label>
                            <Select value={variant.colorId} onValueChange={(v) => updateVariant(variant.tempId, "colorId", v ?? "")}>
                              <SelectTrigger className="mt-0.5 h-8 text-xs rounded-lg">
                                {variant.colorId ? (
                                  (() => { const c = colors.find((x) => x.id === variant.colorId); return c ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                                      {c.name}
                                    </span>
                                  ) : <SelectValue placeholder="Color" />; })()
                                ) : (
                                  <SelectValue placeholder="Color" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {colors.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    <span className="flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                                      {c.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-[10px] text-gray-500">Size</Label>
                            {variant.noSize ? (
                              <button
                                type="button"
                                onClick={() => updateVariant(variant.tempId, "noSize", false)}
                                className="mt-0.5 h-8 text-xs rounded-lg border border-dashed border-gray-300 dark:border-border w-full text-gray-400 hover:border-[#003027] dark:hover:border-[#006854] transition-colors"
                              >
                                + Add size
                              </button>
                            ) : (
                              <div className="flex gap-1 mt-0.5">
                                <Select value={variant.size} onValueChange={(v) => updateVariant(variant.tempId, "size", v ?? "36")}>
                                  <SelectTrigger className="flex-1 h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {SIZES.map((s) => (
                                      <SelectItem key={s} value={s}>Size {s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <button
                                  type="button"
                                  onClick={() => updateVariant(variant.tempId, "noSize", true)}
                                  className="h-8 px-2 text-[10px] text-gray-400 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent transition-colors"
                                >
                                  None
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-[10px] text-gray-500">Stock</Label>
                            <Input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => updateVariant(variant.tempId, "stock", Math.max(0, parseInt(e.target.value) || 0))}
                              className="mt-0.5 h-8 text-xs rounded-lg"
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] text-gray-500">SKU</Label>
                            <Input placeholder="Optional" value={variant.sku} onChange={(e) => updateVariant(variant.tempId, "sku", e.target.value)} className="mt-0.5 h-8 text-xs rounded-lg" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full bg-[#003027] hover:bg-[#004D3F] text-white rounded-xl">
                  {saving ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-card rounded-2xl p-4 border border-black/5 animate-pulse">
                <div className="h-4 bg-gray-100 dark:bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title={filter ? `No ${filterTitle?.toLowerCase()} products` : "No products yet"}
            description={filter ? "All products have sufficient stock" : "Create your first product to start managing inventory"}
            icon={<Package className="w-8 h-8 text-muted-foreground" />}
            action={
              filter ? (
                <Link href="/products" className="text-xs text-[#003027] dark:text-[#006854] font-semibold hover:underline">
                  ← View all products
                </Link>
              ) : (
                <Button onClick={openCreateDialog} className="bg-[#003027] hover:bg-[#004D3F] text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-1" /> Add Product
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product, idx) => {
              const stock = getProductStock(product);
              const colorCount = getProductColors(product);
              const variantCount = product.variants.length;

              const variantsByColor = product.variants.reduce((acc, v) => {
                const key = v.color.id;
                if (!acc[key]) acc[key] = { color: v.color, variants: [] };
                acc[key].variants.push(v);
                return acc;
              }, {} as Record<string, { color: { id: string; hexCode: string; name: string }; variants: typeof product.variants }>);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground tracking-tight">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-gray-500 dark:text-muted-foreground">
                          {colorCount} color{colorCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-muted-foreground">
                          {variantCount} variant{variantCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={`text-sm font-bold px-3 py-1 rounded-xl ${
                        stock === 0
                          ? "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]"
                          : stock <= 5
                          ? "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7]"
                          : "bg-[#D1FAE5] text-[#059669] hover:bg-[#D1FAE5]"
                      }`}
                    >
                      Total: {stock}
                    </Badge>
                  </div>

                  {Object.keys(variantsByColor).length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {Object.entries(variantsByColor).map(([colorId, { color, variants: colorVariants }]) => {
                        const existingSizes = colorVariants.filter((v) => v.size).map((v) => v.size!);
                        const hasNoSize = colorVariants.some((v) => !v.size);

                        return (
                          <div key={colorId}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: color.hexCode }} />
                                <span className="text-[11px] font-semibold text-gray-600 dark:text-muted-foreground">{color.name}</span>
                              </div>
                              {!hasNoSize && (
                                <button
                                  onClick={() => openAddSizeDialog(product.id, colorId, color.name, color.hexCode, existingSizes)}
                                  className="text-[10px] font-semibold text-[#003027] dark:text-[#006854] flex items-center gap-0.5 hover:underline"
                                >
                                  <Plus className="w-3 h-3" /> Add size
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {colorVariants.map((v) => (
                                <span
                                  key={v.id}
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-lg px-2.5 py-1 group ${
                                    v.stock === 0
                                      ? "bg-[#FEE2E2]/60 text-[#DC2626] border border-[#DC2626]/20"
                                      : v.stock <= 5
                                      ? "bg-[#FEF3C7]/60 text-[#D97706] border border-[#D97706]/15"
                                      : "bg-[#D1FAE5]/60 text-[#059669] border border-[#059669]/15"
                                  }`}
                                >
                                  {v.stock === 0 && <XCircle className="w-3 h-3" />}
                                  {v.size ? v.size : `Stock: ${v.stock}`}
                                  <button
                                    onClick={() => handleDeleteVariant(v.id)}
                                    className="ml-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end items-center mt-4 pt-3 border-t border-black/5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(product.id)} className="text-[10px] bg-[#DC2626] text-white px-2 py-1 rounded-lg">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] bg-gray-100 dark:bg-accent px-2 py-1 rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-[#DC2626]/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-[#DC2626]" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      <Dialog open={addSizeOpen} onOpenChange={(open) => { if (!open) setAddSizeOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#003027] dark:text-[#006854] text-base">
              Add Size
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-secondary/50 rounded-xl px-3 py-2.5">
              <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: addSizeColorHex }} />
              <span className="text-sm font-semibold text-foreground">{addSizeColorName}</span>
            </div>

            {SIZES.filter((s) => !addSizeExistingSizes.includes(s)).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-2">
                All sizes already added for this color
              </p>
            ) : (
              <>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Size *</Label>
                  <Select value={addSizeValue} onValueChange={(v) => { if (v) setAddSizeValue(v); }}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SIZES.filter((s) => !addSizeExistingSizes.includes(s)).map((s) => (
                        <SelectItem key={s} value={s}>Size {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Initial Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={addSizeStock}
                    onChange={(e) => setAddSizeStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="mt-1 rounded-xl"
                  />
                </div>

                <Button onClick={handleAddSize} disabled={addSizeSaving} className="w-full bg-[#003027] hover:bg-[#004D3F] text-white rounded-xl">
                  {addSizeSaving ? "Adding..." : "Add Size"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
