import { getDashboardStats } from "@/lib/actions";
import { BottomNav } from "@/components/navigation";
import {
  BarChart3,
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Palette,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-background pb-24">
      <header className="bg-[#003027] text-white px-6 py-6 rounded-b-3xl shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-300" />
            <h1 className="text-lg font-bold">Reports</h1>
          </div>
          <p className="text-xs text-emerald-200 mt-0.5">Inventory analytics and insights</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Package className="w-5 h-5" />} label="Total Products" value={stats.totalProducts} color="brand" />
          <StatCard icon={<Layers className="w-5 h-5" />} label="Total Variants" value={stats.totalVariants} color="brand" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Low Stock" value={stats.lowStock} color="warning" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Out of Stock" value={stats.outOfStock} color="danger" />
        </div>

        <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-[#003027] dark:text-[#006854]" />
            <h2 className="text-sm font-bold text-foreground">Most Used Colors</h2>
          </div>

          {stats.colorSummary.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-muted-foreground text-center py-4">No colors yet</p>
          ) : (
            <div className="space-y-2">
              {(stats.colorSummary as unknown as { id: string; name: string; hexCode: string; _count: { variants: number } }[]).map((color) => (
                <div key={color.id} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: color.hexCode }} />
                    <span className="text-xs text-foreground font-medium">{color.name}</span>
                  </span>
                  <span className="text-xs font-bold text-[#003027] dark:text-[#006854] bg-[#D1FAE5]/50 dark:bg-[#059669]/10 px-2 py-0.5 rounded-full">
                    {color._count.variants} variants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#003027] dark:text-[#006854]" />
            <h2 className="text-sm font-bold text-foreground">Stock Health</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 dark:bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#059669] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalVariants > 0 ? ((stats.totalVariants - stats.lowStock - stats.outOfStock) / stats.totalVariants) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-[#059669] min-w-[32px] text-right">
                {stats.totalVariants > 0 ? Math.round(((stats.totalVariants - stats.lowStock - stats.outOfStock) / stats.totalVariants) * 100) : 0}%
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-muted-foreground">of variants are well-stocked (&gt;5 units)</p>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <div className="text-lg font-bold text-[#059669]">{stats.totalVariants - stats.lowStock - stats.outOfStock}</div>
                <div className="text-[9px] text-gray-500 dark:text-muted-foreground uppercase">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#D97706]">{stats.lowStock}</div>
                <div className="text-[9px] text-gray-500 dark:text-muted-foreground uppercase">Low</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#DC2626]">{stats.outOfStock}</div>
                <div className="text-[9px] text-gray-500 dark:text-muted-foreground uppercase">Empty</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: "brand" | "warning" | "danger" }) {
  const colorMap = {
    brand: "bg-white dark:bg-card border-black/5",
    warning: "bg-[#FEF3C7] dark:bg-[#D97706]/10 border-[#D97706]/20",
    danger: "bg-[#FEE2E2] dark:bg-[#DC2626]/10 border-[#DC2626]/20",
  };
  const textColor = {
    brand: "text-[#003027] dark:text-[#006854]",
    warning: "text-[#D97706]",
    danger: "text-[#DC2626]",
  };

  return (
    <div className={`p-4 rounded-2xl shadow-sm border ${colorMap[color]}`}>
      <div className={`${textColor[color]} mb-1`}>{icon}</div>
      <div className={`text-xl font-bold ${textColor[color]}`}>{value}</div>
      <div className="text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
