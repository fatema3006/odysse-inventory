"use client";

import { useState, useEffect } from "react";
import { Palette, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/navigation";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "@/lib/actions";
import type { Color } from "@/generated/prisma/client";

const PRESET_COLORS = [
  { name: "Black", hexCode: "#000000" },
  { name: "White", hexCode: "#FFFFFF" },
  { name: "Red", hexCode: "#DC2626" },
  { name: "Blue", hexCode: "#2563EB" },
  { name: "Green", hexCode: "#059669" },
  { name: "Yellow", hexCode: "#EAB308" },
  { name: "Pink", hexCode: "#EC4899" },
  { name: "Brown", hexCode: "#92400E" },
  { name: "Nude", hexCode: "#D4A574" },
  { name: "Gold", hexCode: "#D4AF37" },
];

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#000000");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchColors = async () => {
    try {
      const data = await getColors();
      setColors(data as unknown as Color[]);
    } catch {
      toast.error("Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Color name is required");
      return;
    }
    setSaving(true);
    try {
      await createColor({ name: newName.trim(), hexCode: newHex });
      setNewName("");
      setNewHex("#000000");
      toast.success("Color created");
      fetchColors();
    } catch {
      toast.error("Failed to create color");
    } finally {
      setSaving(false);
    }
  };

  const handlePreset = async (preset: { name: string; hexCode: string }) => {
    setSaving(true);
    try {
      await createColor(preset);
      toast.success(`${preset.name} color added`);
      fetchColors();
    } catch {
      toast.error("Color already exists or failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateColor(id, { name: editName.trim(), hexCode: editHex });
      setEditingId(null);
      toast.success("Color updated");
      fetchColors();
    } catch {
      toast.error("Failed to update color");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteColor(id);
      setDeleteConfirm(null);
      toast.success("Color deleted");
      fetchColors();
    } catch {
      toast.error("Failed to delete color");
    }
  };

  const existingNames = colors.map((c) => c.name.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-background pb-24">
      {/* Header */}
      <header className="bg-[#003027] text-white px-6 py-6 rounded-b-3xl shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-300" />
            <h1 className="text-lg font-bold">Colors</h1>
          </div>
          <p className="text-xs text-emerald-200 mt-0.5">
            {colors.length} color{colors.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        {/* Quick Add Presets */}
        <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-3">
            Quick Add
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.filter(
              (p) => !existingNames.includes(p.name.toLowerCase())
            ).map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                disabled={saving}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-all text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: preset.hexCode }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Form */}
        <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-3">
            Custom Color
          </h3>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-[10px] text-gray-500">Name</Label>
              <Input
                placeholder="e.g. Rose Gold"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="mt-0.5 rounded-xl text-sm"
              />
            </div>
            <div className="w-16">
              <Label className="text-[10px] text-gray-500">Hex</Label>
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="color"
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer"
                />
                <Input
                  value={newHex}
                  onChange={(e) => setNewHex(e.target.value)}
                  className="rounded-xl text-xs h-8 font-mono"
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="bg-[#003027] hover:bg-[#004D3F] text-white rounded-xl px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Colors List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-card rounded-2xl p-4 border border-black/5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 dark:bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : colors.length === 0 ? (
          <EmptyState
            title="No colors"
            description="Add colors to use when creating product variants"
            icon={<Palette className="w-8 h-8 text-muted-foreground" />}
          />
        ) : (
          <div className="space-y-2">
            {colors.map((color, idx) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-black/5"
              >
                {editingId === color.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editHex}
                      onChange={(e) => setEditHex(e.target.value)}
                      className="w-8 h-8 rounded-lg border cursor-pointer"
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(color.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="rounded-xl text-sm flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(color.id)}
                      className="p-2 rounded-lg bg-[#D1FAE5] text-[#059669] hover:bg-[#059669]/20"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-accent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-xl border shadow-sm"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {color.name}
                        </h3>
                        <p className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground">
                          {color.hexCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 dark:text-muted-foreground mr-2">
                        {(color as unknown as { _count: { variants: number } })._count.variants} used
                      </span>
                      <button
                        onClick={() => {
                          setEditingId(color.id);
                          setEditName(color.name);
                          setEditHex(color.hexCode);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      {deleteConfirm === color.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(color.id)}
                            className="text-[10px] bg-[#DC2626] text-white px-2 py-1 rounded-lg"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-[10px] bg-gray-100 dark:bg-accent px-2 py-1 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(color.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#DC2626]/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-[#DC2626]" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
