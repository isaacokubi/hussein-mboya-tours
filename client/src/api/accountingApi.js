/**
 * Purpose: accounting Api client application module. Main declarations: unwrap, getAccounts, createAccount, getJournalEntries, createJournalEntry.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare unwrap for use by the surrounding module or function.
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

// Accounting routes are mounted under /admin/finance/accounting on the API.
// Keep this client module aligned with the Express router so the Finance Center
// does not fall through to the generic "Route not found" handler.
// Declare BASE for use by the surrounding module or function.
const BASE = "/admin/finance/accounting";

// Declare getAccounts for use by the surrounding module or function.
export const getAccounts = async () => unwrap(await api.get(`${BASE}/accounts`));
// Declare createAccount for use by the surrounding module or function.
export const createAccount = async (payload) => unwrap(await api.post(`${BASE}/accounts`, payload));
// Declare getJournalEntries for use by the surrounding module or function.
export const getJournalEntries = async (params = {}) => unwrap(await api.get(`${BASE}/journal`, { params }));
// Declare createJournalEntry for use by the surrounding module or function.
export const createJournalEntry = async (payload) => unwrap(await api.post(`${BASE}/journal`, payload));
// Declare postJournalEntry for use by the surrounding module or function.
export const postJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/post`));
// Declare voidJournalEntry for use by the surrounding module or function.
export const voidJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/void`));
// Declare getLedgerSummary for use by the surrounding module or function.
export const getLedgerSummary = async () => unwrap(await api.get(`${BASE}/summary`));
