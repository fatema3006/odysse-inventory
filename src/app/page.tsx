import { Suspense } from "react";
import { getDashboardStats } from "@/lib/actions";

export const dynamic = "force-dynamic";
import { BottomNav } from "@/components/navigation";
import { StatsSkeleton } from "@/components/skeleton";
import {
  Plus,
  Package,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  Layers,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

async function StatsGrid() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/products?action=create"
        className="bg-gradient-to-br from-[#003027] to-[#004D3F] text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
      >
        <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-emerald-300" />
        </div>
        <span className="text-xs font-semibold tracking-wide">Add Product</span>
      </Link>

      <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center">
        <div className="w-9 h-9 bg-[#003027]/5 dark:bg-[#006854]/10 rounded-xl flex items-center justify-center mb-1.5">
          <Package className="w-4.5 h-4.5 text-[#003027] dark:text-[#006854]" />
        </div>
        <span className="text-2xl font-black text-[#003027] dark:text-[#006854] tabular-nums">
          {stats.totalStock}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-widest font-medium">
          Total Stock
        </span>
      </div>

      <Link
        href="/products?filter=low-stock"
        className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] dark:from-[#D97706]/10 dark:to-[#D97706]/5 p-5 rounded-2xl shadow-sm border border-[#D97706]/20 flex flex-col items-center justify-center hover:scale-[1.03] transition-all duration-200 active:scale-95"
      >
        <div className="w-9 h-9 bg-[#D97706]/15 rounded-xl flex items-center justify-center mb-1.5">
          <AlertTriangle className="w-4.5 h-4.5 text-[#D97706]" />
        </div>
        <span className="text-2xl font-black text-[#D97706] tabular-nums">{stats.lowStock}</span>
        <span className="text-[10px] text-[#D97706]/80 uppercase tracking-widest font-medium">Low Stock</span>
      </Link>

      <Link
        href="/products?filter=out-of-stock"
        className="bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] dark:from-[#DC2626]/10 dark:to-[#DC2626]/5 p-5 rounded-2xl shadow-sm border border-[#DC2626]/20 flex flex-col items-center justify-center hover:scale-[1.03] transition-all duration-200 active:scale-95"
      >
        <div className="w-9 h-9 bg-[#DC2626]/15 rounded-xl flex items-center justify-center mb-1.5">
          <XCircle className="w-4.5 h-4.5 text-[#DC2626]" />
        </div>
        <span className="text-2xl font-black text-[#DC2626] tabular-nums">{stats.outOfStock}</span>
        <span className="text-[10px] text-[#DC2626]/80 uppercase tracking-widest font-medium">Out of Stock</span>
      </Link>
    </div>
  );
}

function QuickAccess() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#003027]/5 dark:bg-[#006854]/10 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-[#003027] dark:text-[#006854]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#003027] dark:text-[#006854]">All Products</h2>
            <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Browse & manage</p>
          </div>
        </div>
        <Link
          href="/products"
          className="block w-full text-center bg-[#003027] dark:bg-[#004D3F] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#004D3F] dark:hover:bg-[#006854] transition-all active:scale-[0.98] mt-3"
        >
          View Products
        </Link>
      </div>

      <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#003027]/5 dark:bg-[#006854]/10 rounded-xl flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#003027] dark:text-[#006854]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#003027] dark:text-[#006854]">Variants</h2>
            <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Color & size stock</p>
          </div>
        </div>
        <Link
          href="/variants"
          className="block w-full text-center bg-[#003027] dark:bg-[#004D3F] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#004D3F] dark:hover:bg-[#006854] transition-all active:scale-[0.98] mt-3"
        >
          View Variants
        </Link>
      </div>
    </>
  );
}

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-background pb-24">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#003027] via-[#004D3F] to-[#00251E] text-white px-6 pt-10 pb-12 rounded-[2.5rem] shadow-lg mx-2 mt-2 mb-2">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300/10 rounded-full blur-3xl" />
        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[0.15em] uppercase">ODYSSE</h1>
              <p className="text-[10px] text-emerald-300/80 tracking-[0.3em] uppercase font-medium">Inventory Management</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-emerald-300/60 text-[10px] uppercase tracking-widest mb-0.5">Welcome back</p>
              <div className="text-lg font-bold tracking-tight">Hello, Manager</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl text-emerald-200 font-medium">
                {today}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsGrid />
        </Suspense>

        <div className="grid grid-cols-2 gap-4">
          <QuickAccess />
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <ReportsSummary />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}

async function ReportsSummary() {
  const stats = await getDashboardStats();

  return (
    <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#003027]/5 dark:bg-[#006854]/10 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#003027] dark:text-[#006854]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#003027] dark:text-[#006854]">Quick Report</h2>
          <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Overview</p>
        </div>
      </div>

      <div className="space-y-0">
        {[
          { label: "Total Products", value: stats.totalProducts },
          { label: "Total Variants", value: stats.totalVariants },
          { label: "Total Stock", value: stats.totalStock },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-black/5 last:border-0">
            <span className="text-xs text-gray-500 dark:text-muted-foreground">{item.label}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>

      <Link
        href="/reports"
        className="block w-full text-center text-xs text-[#003027] dark:text-[#006854] font-semibold mt-3 py-2 rounded-xl bg-[#003027]/5 dark:bg-[#006854]/10 hover:bg-[#003027]/10 dark:hover:bg-[#006854]/15 transition-all"
      >
        View Full Report
      </Link>
    </div>
  );
}
