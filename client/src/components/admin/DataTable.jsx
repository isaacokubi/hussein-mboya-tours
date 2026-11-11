/**
 * Purpose: Data Table reusable UI component. Main declarations: DataTable, safeValue.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useState } from "react";
// Load ./Pagination so this module can use its exported dependencies.
import Pagination from "./Pagination";

// Declare DEFAULT_PAGE_SIZE for use by the surrounding module or function.
const DEFAULT_PAGE_SIZE = 10;

// Define DataTable; its parameters and body implement this operation.
export default function DataTable({ columns = [], data = [], pageSize = DEFAULT_PAGE_SIZE, paginate = true }) {
    // Declare [page, setPage] for use by the surrounding module or function.
    const [page, setPage] = useState(1);
    // Declare safePageSize for use by the surrounding module or function.
    const safePageSize = Math.min(15, Math.max(10, Number(pageSize) || DEFAULT_PAGE_SIZE));
    // Declare safeValue for use by the surrounding module or function.
    const safeValue = (value) => {
        // Check the condition (value === null || value === undefined) and run the matching branch.
        if (value === null || value === undefined) return "-";
        // Check the condition (typeof value === "object") and run the matching branch.
        if (typeof value === "object") return JSON.stringify(value);
        // Return the value of value to the caller.
        return value;
    };
    // Declare pages for use by the surrounding module or function.
    const pages = paginate ? Math.max(1, Math.ceil(data.length / safePageSize)) : 1;
    // Perform the side effect or state update expressed on the following line.
    useEffect(() => { setPage((current) => Math.min(current, pages)); }, [pages]);
    // Perform the side effect or state update expressed on the following line.
    useEffect(() => { setPage(1); }, [data.length, safePageSize]);
    // Declare visibleRows for use by the surrounding module or function.
    const visibleRows = useMemo(() => paginate ? data.slice((page - 1) * safePageSize, page * safePageSize) : data, [data, page, safePageSize, paginate]);

    // Return the expression shown below to the caller.
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
