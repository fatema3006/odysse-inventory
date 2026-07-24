"use client";

import { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  XCircle,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/navigation";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateVariantStock,
  addVariantToProduct,
  getProducts,
  getColors,
} from "@/lib/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SIZES = ["36", "37", "38", "39", "40", "41"];

interface VariantData {
  id: string;
  size: string;
  stock: number;
  color: { id: string; name: string; hexCode: string };
}

interface ProductData {
  id: string;
  name: string;
  variants: VariantData[];
}

interface ColorGroup {
  colorId: string;
  colorName: string;
  hexCode: string;
  variants: VariantData[];
}

export default function VariantsPage() {
  return (
    <Suspense>
      <VariantsContent />
    </Suspense>
  );
}

function VariantsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string; hexCode: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [expandedColors, setExpandedColors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [addSizeOpen, setAddSizeOpen] = useState(false);
  const [addSizeColorId, setAddSizeColorId] = useState("");
  const [addSizeColorName, setAddSizeColorName] = useState("");
  const [addSizeColorHex, setAddSizeColorHex] = useState("");
  const [addSizeValue, setAddSizeValue] = useState("36");
  const [addSizeStock, setAddSizeStock] = useState(0);
  const [addSizeSaving, setAddSizeSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prods, cols] = await Promise.all([getProducts(), getColors()]);
      const mapped = (prods as unknown as ProductData[]).map((p) => ({
        id: p.id,
        name: p.name,
        variants: p.variants,
      }));
      setProducts(mapped);
      setColors(cols as unknown as { id: string; name: string; hexCode: string }[]);
      if (mapped.length > 0 && !selectedProductId) {
        const preselected = searchParams.get("product");
        setSelectedProductId(
          preselected && mapped.find((p) => p.id === preselected)
            ? preselected
            : mapped[0].id
        );
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedProductId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const colorGroups: ColorGroup[] = [];
  if (selectedProduct) {
    const groupMap = new Map<string, ColorGroup>();
    for (const v of selectedProduct.variants) {
      const key = v.color.id;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          colorId: v.color.id,
          colorName: v.color.name,
          hexCode: v.color.hexCode,
          variants: [],
        });
      }
      groupMap.get(key)!.variants.push(v);
    }
    colorGroups.push(...groupMap.values());
  }

  const toggleColor = (colorId: string) => {
    setExpandedColors((prev) => ({
      ...prev,
      [colorId]: !prev[colorId],
    }));
  };

  const handleStockUpdate = (variantId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProductId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id !== variantId) return v;
            return { ...v, stock: Math.max(0, v.stock + delta) };
          }),
        };
      })
    );

    startTransition(async () => {
      try {
        await updateVariantStock(variantId, delta);
      } catch {
        toast.error("Failed to update stock");
        fetchData();
      }
    });
  };

  const openAddSizeDialog = (colorId: string, colorName: string, colorHex: string, existingSizes: string[]) => {
    const available = SIZES.filter((s) => !existingSizes.includes(s));
    setAddSizeColorId(colorId);
    setAddSizeColorName(colorName);
    setAddSizeColorHex(colorHex);
    setAddSizeValue(available[0] || SIZES[0]);
    setAddSizeStock(0);
    setAddSizeOpen(true);
  };

  const handleAddSize = async () => {
    if (!selectedProductId) return;
    setAddSizeSaving(true);
    try {
      await addVariantToProduct({
        productId: selectedProductId,
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

  const getProductStock = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.variants.reduce((sum, v) => sum + v.stock, 0);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-background pb-24">
      <header className="bg-[#003027] text-white px-6 py-6 rounded-b-3xl shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-300" />
            <h1 className="text-lg font-bold">Variants</h1>
          </div>
          <p className="text-xs text-emerald-200 mt-0.5">
            Manage stock by color and size
          </p>
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
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Create a product first to manage its variants"
            icon={<Layers className="w-8 h-8 text-muted-foreground" />}
          />
        ) : (
          <>
            <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-black/5 mb-4">
              <label className="text-xs text-gray-500 dark:text-muted-foreground font-medium block mb-1.5">
                Select Product
              </label>
              <Select value={selectedProductId} onValueChange={(v) => { if (v) setSelectedProductId(v); }}>
                <SelectTrigger className="rounded-xl">
                  {selectedProductId ? (
                    <span className="text-sm">{products.find((p) => p.id === selectedProductId)?.name || "Choose a product"}</span>
                  ) : (
                    <SelectValue placeholder="Choose a product" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProduct && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">Total Stock</span>
                  <span className="text-sm font-bold text-[#003027] dark:text-[#006854]">{getProductStock()}</span>
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="space-y-3">
                {colorGroups.map((group) => {
                  const isOpen = expandedColors[group.colorId] !== undefined
                    ? expandedColors[group.colorId]
                    : true;
                  const existingSizes = group.variants.map((v) => v.size);
                  const availableSizes = SIZES.filter((s) => !existingSizes.includes(s));

                  return (
                    <div key={group.colorId} className="bg-white dark:bg-card rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                      <button
                        onClick={() => toggleColor(group.colorId)}
                        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: group.hexCode }} />
                          <span className="text-sm font-semibold text-foreground">{group.colorName}</span>
                          <span className="text-[10px] text-gray-400 dark:text-muted-foreground">{group.variants.length} sizes</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {availableSizes.length > 0 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddSizeDialog(group.colorId, group.colorName, group.hexCode, existingSizes);
                              }}
                              className="text-[10px] font-semibold text-[#003027] dark:text-[#006854] bg-[#D1FAE5]/50 px-2 py-0.5 rounded-full hover:bg-[#D1FAE5] transition-colors"
                            >
                              + Add
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                              {group.variants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className={`relative bg-gray-50/50 dark:bg-secondary/50 border rounded-xl p-3 flex flex-col justify-between group ${
                                    variant.stock === 0
                                      ? "border-[#DC2626]/20"
                                      : variant.stock <= 5
                                      ? "border-[#D97706]/15"
                                      : "border-gray-100 dark:border-border"
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                                      {variant.stock === 0 && <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />}
                                      Size {variant.size}
                                    </span>
                                    <span className={`text-[11px] font-semibold ${
                                      variant.stock === 0
                                        ? "text-[#DC2626]"
                                        : variant.stock <= 5
                                        ? "text-[#D97706]"
                                        : "text-[#059669]"
                                    }`}>
                                      {variant.stock}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-1">
                                    <button
                                      onClick={() => handleStockUpdate(variant.id, -1)}
                                      disabled={variant.stock <= 0}
                                      className="p-1.5 hover:bg-[#FEE2E2] hover:text-[#DC2626] rounded-md text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-xs font-bold text-foreground min-w-[20px] text-center">
                                      {variant.stock}
                                    </span>
                                    <button
                                      onClick={() => handleStockUpdate(variant.id, 1)}
                                      className="p-1.5 hover:bg-[#D1FAE5] hover:text-[#059669] rounded-md text-gray-500 transition-all"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {colorGroups.length === 0 && (
                  <EmptyState
                    title="No variants"
                    description="This product has no variants yet"
                    icon={<Layers className="w-8 h-8 text-muted-foreground" />}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />

      <Dialog open={addSizeOpen} onOpenChange={(open) => { if (!open) setAddSizeOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#003027] dark:text-[#006854] text-base">Add Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-secondary/50 rounded-xl px-3 py-2.5">
              <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: addSizeColorHex }} />
              <span className="text-sm font-semibold text-foreground">{addSizeColorName}</span>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 dark:text-muted-foreground">Size *</Label>
              <Select value={addSizeValue} onValueChange={(v) => { if (v) setAddSizeValue(v); }}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
