export function Skeleton({ className="", ...props }) {
  return <div className={`skeleton ${className}`} {...props} />;
}
export function CardSkeleton() {
  return <div className="card p-6 space-y-4"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div></div><Skeleton className="h-24 w-full rounded-xl" /></div>;
}
export function MetricSkeleton() {
  return <div className="card p-5 space-y-3"><div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="w-8 h-8 rounded-lg" /></div><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-32" /></div>;
}
export function ListSkeleton({ rows=4 }) {
  return <div className="space-y-3">{Array.from({length:rows}).map((_,i) => <div key={i} className="card p-4 flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full flex-shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-2/3" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>;
}
