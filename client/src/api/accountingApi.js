import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getAccounts = async () => unwrap(await api.get("/finance/accounting/accounts"));
export const createAccount = async (payload) => unwrap(await api.post("/finance/accounting/accounts", payload));
export const getJournalEntries = async (params = {}) => unwrap(await api.get("/finance/accounting/journal", { params }));
export const createJournalEntry = async (payload) => unwrap(await api.post("/finance/accounting/journal", payload));
export const postJournalEntry = async (id) => unwrap(await api.post(`/finance/accounting/journal/${id}/post`));
export const voidJournalEntry = async (id) => unwrap(await api.post(`/finance/accounting/journal/${id}/void`));
export const getLedgerSummary = async () => unwrap(await api.get("/finance/accounting/summary"));
