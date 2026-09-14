import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

const DEFAULT_PAGE_SIZE = 10;

export default function DataTable({ columns = [], data = [], pageSize = DEFAULT_PAGE_SIZE, paginate = true }) {
    const [page, setPage] = useState(1);
    const safePageSize = Math.min(15, Math.max(10, Number(pageSize) || DEFAULT_PAGE_SIZE));
    const safeValue = (value) => {
        if (value === null || value === undefined) return "-";
        if (typeof value === "object") return JSON.stringify(value);
        return value;
    };
    const pages = paginate ? Math.max(1, Math.ceil(data.length / safePageSize)) : 1;
    useEffect(() => { setPage((current) => Math.min(current, pages)); }, [pages]);
    useEffect(() => { setPage(1); }, [data.length, safePageSize]);
    const visibleRows = useMemo(() => paginate ? data.slice((page - 1) * safePageSize, page * safePageSize) : data, [data, page, safePageSize, paginate]);

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-100">
                        <tr>{columns.map((col) => <th key={col.key} className="p-4 text-left whitespace-nowrap align-middle">{col.label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {visibleRows.length === 0 ? <tr><td colSpan={columns.length} className="p-6 text-center text-gray-500 whitespace-nowrap">No data available</td></tr> : visibleRows.map((row, index) => <tr key={row._id || `${page}-${index}`} className="border-b">{columns.map((col) => <td key={col.key} className="p-4 whitespace-nowrap align-middle">{col.render ? col.render(row) : safeValue(row[col.key])}</td>)}</tr>)}
                    </tbody>
                </table>
            </div>
            {paginate && <Pagination page={page} pages={pages} total={data.length} pageSize={safePageSize} onPageChange={setPage} />}
        </div>
    );
}
