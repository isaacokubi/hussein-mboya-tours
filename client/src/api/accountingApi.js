import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

// Accounting routes are mounted under /admin/finance/accounting on the API.
// Keep this client module aligned with the Express router so the Finance Center
// does not fall through to the generic "Route not found" handler.
const BASE = "/admin/finance/accounting";

export const getAccounts = async () => unwrap(await api.get(`${BASE}/accounts`));
export const createAccount = async (payload) => unwrap(await api.post(`${BASE}/accounts`, payload));
export const getJournalEntries = async (params = {}) => unwrap(await api.get(`${BASE}/journal`, { params }));
export const createJournalEntry = async (payload) => unwrap(await api.post(`${BASE}/journal`, payload));
export const postJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/post`));
export const voidJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/void`));
export const getLedgerSummary = async () => unwrap(await api.get(`${BASE}/summary`));
