/**
 * Purpose: Pagination reusable UI component. Main declarations: Pagination, add, handlePageChange.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function Pagination({ page = 1, pages = 1, total = 0, pageSize = 10, onPageChange }) {
  // Declare currentPage for use by the surrounding module or function.
  const currentPage = Math.max(1, Number(page) || 1);
  // Declare totalPages for use by the surrounding module or function.
  const totalPages = Math.max(1, Number(pages) || 1);
  // Declare totalItems for use by the surrounding module or function.
  const totalItems = Math.max(0, Number(total) || 0);
  // Declare size for use by the surrounding module or function.
  const size = Math.max(1, Number(pageSize) || 10);

  // Check the condition (totalPages <= 1) and run the matching branch.
  if (totalPages <= 1) return null;
  // Declare start for use by the surrounding module or function.
  const start = totalItems ? ((currentPage - 1) * size) + 1 : 0;
  // Declare end for use by the surrounding module or function.
  const end = Math.min(currentPage * size, totalItems);
  // Declare items for use by the surrounding module or function.
  const items = [];
  // Declare add for use by the surrounding module or function.
  const add = (value) => { if (!items.includes(value)) items.push(value); };
  // Perform the side effect or state update expressed on the following line.
  add(1);
  // Check the condition (currentPage > 3) and run the matching branch.
  if (currentPage > 3) add("ellipsis-left");
  // Repeat the enclosed work for each required iteration.
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) add(p);
  // Check the condition (currentPage < totalPages - 2) and run the matching branch.
  if (currentPage < totalPages - 2) add("ellipsis-right");
  // Perform the side effect or state update expressed on the following line.
  add(totalPages);

  // Declare handlePageChange for use by the surrounding module or function.
  const handlePageChange = (nextPage) => {
    // Declare target for use by the surrounding module or function.
    const target = Math.min(totalPages, Math.max(1, Number(nextPage) || 1));
    // Check the condition (target !== currentPage) and run the matching branch.
    if (target !== currentPage) onPageChange?.(target);
  };

  // Return the expression shown below to the caller.
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
