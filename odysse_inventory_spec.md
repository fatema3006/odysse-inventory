# Odysse Inventory Management Web App — Requirement & Blueprint Specification

This document serves as the complete technical and design specification for the **Odysse** Inventory Management Web Application (Mobile-first layout with desktop optimization). Designed for high-end luxury feel inspired by modern iOS app design, high dynamic reactivity, and full deployment readiness on Vercel.

---

## 1. Project Overview & Brand Identity

* **Brand Name:** Odysse
* **Niche:** Premium Women's Footwear & Luxury Goods
* **Design Philosophy:** Apple-like minimalism, smooth transitions, soft glassmorphism, elevated rounded cards, tactile interactions, refined typography, and intuitive inventory controls.
* **Primary Brand Color Code:** `#003027` (Deep Emerald / Forest Green)
* **Target Platform:** Web App optimized for Mobile UX (responsive on Tablet/Desktop)
* **Deployment Target:** Vercel (Next.js App Router)

---

## 2. Design System & Styling Guide

### Color Palette
* **Primary Brand:** `#003027` (Dark Emerald)
* **Primary Accent / Active:** `#004D3F` / `#006854`
* **Background Light:** `#F6F8F7` (Soft neutral Off-White/Mint tint)
* **Card Background:** `#FFFFFF` (Pure white with subtle `rgba(0,0,0,0.04)` shadows)
* **Text Primary:** `#1A201C` (Dark Charcoal)
* **Text Secondary:** `#6B7280` (Muted Grey)
* **Status Badges / Metrics:**
  * **Low Stock Warning:** Yellow/Amber `#D97706` (Bg: `#FEF3C7`)
  * **Out of Stock Alert:** Soft Red `#DC2626` (Bg: `#FEE2E2`)
  * **Success / Stock Available:** Emerald `#059669` (Bg: `#D1FAE5`)

### Typography & Structure
* **Font Family:** System Font Stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Segoe UI, Roboto, sans-serif`)
* **Border Radius:** `16px` (`rounded-2xl`) for cards, `12px` (`rounded-xl`) for buttons and input fields.
* **Transitions:** Smooth CSS transitions (`all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`) for accordion expansions, state changes, and stock increments.

---

## 3. Application Architecture & Pages Structure

### Next.js Tech Stack
* **Framework:** Next.js (App Router, React 18+)
* **Styling:** Tailwind CSS + Lucide Icons (`lucide-react`)
* **State Management:** React `useState` / `useReducer` or Zustand for local persistent store (`localStorage`).

---

## 4. UI Layout Breakdown

### 4.1 Header / Hero Section
* **Title:** **Odysse**
* **Subtitle / Tagline:** Inventory & Stock Manager
* **Design:** Sleek top navigation bar with brand icon, dark emerald header element or clean modern header with subtle border.

---

### 4.2 Top Metric Cards Grid (4 Cards Row)
1. **Add Product Trigger Card:** Interactive card / button that opens the dynamic Add Product Modal/Form.
2. **Total Stock Card:** Dynamic calculation summing stock across all colors and sizes.
3. **Low Stock Card:** Total number of size variants with stock level $> 0$ and $\le 5$.
4. **Out of Stock Card:** Total number of size variants with stock level $= 0$.

---

### 4.3 Main Section Cards Grid (2 Cards Container)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ODYSSE DASHBOARD                         │
├────────────────────────────────┬────────────────────────────────┤
│      CARD 1: ALL PRODUCTS      │       CARD 2: VARIANTS         │
│  (Chronological Product List)  │   (Interactive Variant Tree)   │
└────────────────────────────────┴────────────────────────────────┘
```

---

## 5. Detailed Feature Workflow & Functional Specifications

### Section 5.1: Card 1 — Add Product & All Products List

#### Dynamic Add Product Flow
* **Fields Required:**
  1. **Product Name** (e.g., `Luxury Loafer`, `Soft Slipper`)
  2. **Color** (Select existing or type custom color, e.g., `Black`, `Blue`, `Yellow`, `White`)
  3. **Size** (Select or enter size, e.g., `36`, `37`, `38`, ... `41`)
  4. **Initial Stock Quantity** (Numeric input)
* **Action Buttons:**
  * **"Create More" Button:** Saves current color/size variant to memory without closing modal; keeps Product Name active so additional colors/sizes can be added iteratively.
  * **"Finish & Save" Button:** Finalizes product entry and closes modal.

#### All Products Display
* **Sorting Rule:** Chronological (Last created / updated product displays at the top of the list).
* **Card Details:** Shows product thumbnail badge, product name, total variant count, aggregated stock count, and timestamp.

---

### Section 5.2: Card 2 — Interactive Variants Accordion View

#### Product Dropdown Selector
* Select product to view details (e.g., `Ladies Running Shoe`, `Luxury Loafer`).

#### Color Accordion & Stock Grid Layout
* Grouped by Color (e.g., `■ Black`, `■ Pink`, `■ White`).
* Clicking color opens collapsible grid showing size boxes:

```text
product name: Ladies Running Shoe
color: 
▼ Expand

■ Black
┌──────────────┐   ┌──────────────┐
│ Size 36      │   │ Size 37      │
│ Stock : 8    │   │ Stock : 5    │
│  ➖  8  ➕  │   │  ➖  5  ➕  │
└──────────────┘   └──────────────┘

┌──────────────┐   ┌──────────────┐
│ Size 38      │   │ Size 39      │
│ Stock : 2    │   │ Stock : 1    │
│  ➖  2  ➕  │   │  ➖  1  ➕  │
└──────────────┘   └──────────────┘
```

#### Real-time Stock Adjustment
* Instant `+` and `-` buttons on every size card.
* Updating stock dynamically recalculates top-level total stock, low stock, and out-of-stock count instantly across the UI.

---

## 6. Data Model & State Schema (TypeScript Reference)

```typescript
export interface StockVariant {
  id: string;
  size: string; // e.g., "36", "37"
  stock: number;
}

export interface ColorGroup {
  colorName: string;
  hexCode?: string;
  variants: StockVariant[];
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  colors: ColorGroup[];
  createdAt: string; // ISO String for accurate chronological ordering
}
```

---

## 7. Next.js Implementation Blueprint Code (Single File Copy-Paste Ready)

Create `app/page.tsx` with the following implementation:

```tsx
"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Layers, 
  ShoppingBag,
  Sparkles
} from "lucide-react";

// Initial Mock Data
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Ladies Running Shoe",
    createdAt: new Date().toISOString(),
    colors: [
      {
        colorName: "Black",
        variants: [
          { id: "v1", size: "36", stock: 8 },
          { id: "v2", size: "37", stock: 5 },
          { id: "v3", size: "38", stock: 2 },
          { id: "v4", size: "39", stock: 1 },
          { id: "v5", size: "40", stock: 3 },
          { id: "v6", size: "41", stock: 1 },
        ],
      },
      {
        colorName: "White",
        variants: [
          { id: "v7", size: "36", stock: 4 },
          { id: "v8", size: "37", stock: 0 },
        ],
      },
    ],
  },
];

export default function OdysseDashboard() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRODUCTS[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedColors, setExpandedColors] = useState<Record<string, boolean>>({ Black: true });

  // Add Product Form State
  const [prodName, setProdName] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("36");
  const [stockInput, setStockInput] = useState("5");

  // Calculations for 4 Header Metrics Cards
  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => 
      acc + p.colors.reduce((cAcc, c) => 
        cAcc + c.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    let count = 0;
    products.forEach((p) =>
      p.colors.forEach((c) =>
        c.variants.forEach((v) => {
          if (v.stock > 0 && v.stock <= 3) count++;
        })
      )
    );
    return count;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    let count = 0;
    products.forEach((p) =>
      p.colors.forEach((c) =>
        c.variants.forEach((v) => {
          if (v.stock === 0) count++;
        })
      )
    );
    return count;
  }, [products]);

  // Handle Dynamic Product Creation
  const handleCreateMore = (closeAfter = false) => {
    if (!prodName || !colorInput) return;

    setProducts((prev) => {
      const existingProdIndex = prev.findIndex((p) => p.name.toLowerCase() === prodName.trim().toLowerCase());

      if (existingProdIndex > -1) {
        const updated = [...prev];
        const prod = { ...updated[existingProdIndex] };
        const colorIndex = prod.colors.findIndex((c) => c.colorName.toLowerCase() === colorInput.trim().toLowerCase());

        if (colorIndex > -1) {
          const colorObj = { ...prod.colors[colorIndex] };
          colorObj.variants.push({
            id: `var-${Date.now()}`,
            size: sizeInput,
            stock: Number(stockInput) || 0,
          });
          prod.colors[colorIndex] = colorObj;
        } else {
          prod.colors.push({
            colorName: colorInput.trim(),
            variants: [{ id: `var-${Date.now()}`, size: sizeInput, stock: Number(stockInput) || 0 }],
          });
        }
        updated[existingProdIndex] = prod;
        return updated;
      } else {
        const newProduct = {
          id: `prod-${Date.now()}`,
          name: prodName.trim(),
          createdAt: new Date().toISOString(),
          colors: [
            {
              colorName: colorInput.trim(),
              variants: [{ id: `var-${Date.now()}`, size: sizeInput, stock: Number(stockInput) || 0 }],
            },
          ],
        };
        return [newProduct, ...prev];
      }
    });

    if (closeAfter) {
      setIsModalOpen(false);
      setProdName("");
      setColorInput("");
    }
  };

  // Stock Adjustment Handlers
  const updateStock = (productId: string, colorName: string, variantId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          colors: p.colors.map((c) => {
            if (c.colorName !== colorName) return c;
            return {
              ...c,
              variants: c.variants.map((v) => {
                if (v.id !== variantId) return v;
                return { ...v, stock: Math.max(0, v.stock + delta) };
              }),
            };
          }),
        };
      })
    );
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#1A201C] pb-12 font-sans">
      {/* Header / Hero Section */}
      <header className="bg-[#003027] text-white px-6 py-8 shadow-md rounded-b-3xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <h1 className="text-2xl font-bold tracking-wider uppercase">Odysse</h1>
            </div>
            <p className="text-xs text-emerald-200 mt-1">Luxury Footwear Inventory Management</p>
          </div>
          <span className="text-xs bg-[#004D3F] border border-emerald-500/30 px-3 py-1 rounded-full">
            Mobile App View
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Top 4 Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003027] text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-[#004D3F] transition-all"
          >
            <Plus className="w-6 h-6 text-emerald-300" />
            <span className="text-xs font-semibold">Add Product</span>
          </button>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-900/5 flex flex-col items-center justify-center">
            <Package className="w-5 h-5 text-emerald-700 mb-1" />
            <span className="text-xl font-bold text-[#003027]">{totalStock}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Stock</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl shadow-sm border border-amber-200/50 flex flex-col items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-xl font-bold text-amber-700">{lowStockCount}</span>
            <span className="text-[10px] text-amber-600 uppercase tracking-wider">Low Stock</span>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-2xl shadow-sm border border-rose-200/50 flex flex-col items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-600 mb-1" />
            <span className="text-xl font-bold text-rose-700">{outOfStockCount}</span>
            <span className="text-[10px] text-rose-600 uppercase tracking-wider">Out of Stock</span>
          </div>
        </div>

        {/* 2 Main Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: All Products */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-[#003027] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                All Products
              </h2>
              <span className="text-xs bg-emerald-50 text-[#003027] px-2 py-0.5 rounded-full font-medium">
                {products.length} Items
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {products.map((p) => {
                const prodStock = p.colors.reduce((a, c) => a + c.variants.reduce((va, v) => va + v.stock, 0), 0);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedProductId === p.id 
                        ? "border-[#003027] bg-emerald-50/30 shadow-sm" 
                        : "border-gray-100 bg-gray-50/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.colors.length} Colors • {p.colors.reduce((a, c) => a + c.variants.length, 0)} Sizes
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#003027] bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                        {prodStock} in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Variants Management */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-[#003027]">Variants View</h2>
            </div>

            {/* Select Product Dropdown */}
            {selectedProduct && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium block mb-1">Select Product</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-sm font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003027]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Accordion List by Color */}
            {selectedProduct ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedProduct.colors.map((colorObj) => {
                  const isOpen = expandedColors[colorObj.colorName] ?? true;
                  return (
                    <div key={colorObj.colorName} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedColors((prev) => ({ ...prev, [colorObj.colorName]: !isOpen }))
                        }
                        className="w-full flex justify-between items-center p-3 bg-gray-50 text-left hover:bg-emerald-50/20 transition-all"
                      >
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#003027] inline-block" />
                          {colorObj.colorName}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>

                      {isOpen && (
                        <div className="p-3 bg-white grid grid-cols-2 gap-2">
                          {colorObj.variants.map((v) => (
                            <div key={v.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/30 flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-gray-700">Size {v.size}</span>
                                <span className="text-[11px] font-semibold text-emerald-800">Stock: {v.stock}</span>
                              </div>

                              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1">
                                <button
                                  onClick={() => updateStock(selectedProduct.id, colorObj.colorName, v.id, -1)}
                                  className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-gray-600 transition-all"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold">{v.stock}</span>
                                <button
                                  onClick={() => updateStock(selectedProduct.id, colorObj.colorName, v.id, 1)}
                                  className="p-1 hover:bg-emerald-50 hover:text-emerald-700 rounded text-gray-600 transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No products selected.</p>
            )}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4 border border-gray-100">
            <h3 className="text-lg font-bold text-[#003027]">Add New Inventory Item</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Loafer"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003027]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Black, Blue, Yellow"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003027]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Size</label>
                  <input
                    type="text"
                    placeholder="36"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003027]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003027]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCreateMore(false)}
                className="flex-1 bg-emerald-50 text-[#003027] border border-emerald-200 font-semibold py-2.5 rounded-xl text-xs hover:bg-emerald-100 transition-all"
              >
                + Create More
              </button>
              <button
                onClick={() => handleCreateMore(true)}
                className="flex-1 bg-[#003027] text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-[#004D3F] transition-all"
              >
                Save & Close
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Summary Checklist for Agent Deployment
1. Initialize Next.js project with Tailwind CSS (`npx create-next-app@latest`).
2. Install `lucide-react` icons (`npm install lucide-react`).
3. Replace `app/page.tsx` with the code provided above.
4. Deploy seamlessly on Vercel using `git push` or `vercel --prod`.
