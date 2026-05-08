export const ProductSkeleton = () => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-100 rounded w-1/3 mb-6"></div>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 bg-slate-50 rounded-lg"></div>
      ))}
    </div>
  </div>
);

