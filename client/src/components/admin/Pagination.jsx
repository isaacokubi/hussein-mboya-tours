export default function Pagination({ page = 1, pages = 1, total = 0, pageSize = 10, onPageChange }) {
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Number(pages) || 1);
  const totalItems = Math.max(0, Number(total) || 0);
  const size = Math.max(1, Number(pageSize) || 10);

  if (totalPages <= 1) return null;
  const start = totalItems ? ((currentPage - 1) * size) + 1 : 0;
  const end = Math.min(currentPage * size, totalItems);
  const items = [];
  const add = (value) => { if (!items.includes(value)) items.push(value); };
  add(1);
  if (currentPage > 3) add("ellipsis-left");
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) add(p);
  if (currentPage < totalPages - 2) add("ellipsis-right");
  add(totalPages);

  const handlePageChange = (nextPage) => {
    const target = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));
    if (target !== currentPage) onPageChange?.(target);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-500">Showing <span className="font-semibold text-slate-700">{start}–{end}</span> of <span className="font-semibold text-slate-700">{totalItems}</span></p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button type="button" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        {items.map((item) => {
          if (typeof item === "string" && item.startsWith("ellipsis")) {
            return <span key={item} className="px-2 text-slate-400" aria-hidden="true">…</span>;
          }
          return <button type="button" key={item} onClick={() => handlePageChange(item)} aria-current={item === currentPage ? "page" : undefined} className={`min-w-9 rounded-lg border px-3 py-2 font-semibold transition ${item === currentPage ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>{item}</button>;
        })}
        <button type="button" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </nav>
    </div>
  );
}
