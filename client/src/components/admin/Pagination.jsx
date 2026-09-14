export default function Pagination({ page = 1, pages = 1, total = 0, pageSize = 10, onPageChange }) {
  if (pages <= 1) return null;
  const start = total ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, total);
  const items = [];
  const add = (value) => { if (!items.includes(value)) items.push(value); };
  add(1);
  if (page > 3) add("ellipsis-left");
  for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p += 1) add(p);
  if (page < pages - 2) add("ellipsis-right");
  if (pages > 1) add(pages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-500">Showing <span className="font-semibold text-slate-700">{start}–{end}</span> of <span className="font-semibold text-slate-700">{total}</span></p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        {items.map((item) => item.startsWith("ellipsis") ? <span key={item} className="px-2 text-slate-400">…</span> : <button type="button" key={item} onClick={() => onPageChange(item)} aria-current={item === page ? "page" : undefined} className={`min-w-9 rounded-lg border px-3 py-2 font-semibold transition ${item === page ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>{item}</button>)}
        <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </nav>
    </div>
  );
}
