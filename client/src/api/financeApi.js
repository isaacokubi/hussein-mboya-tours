// client/src/services/financeService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| FINANCE DASHBOARD
|--------------------------------------------------------------------------
*/

export const getFinanceDashboard = async () => {
  const { data } = await api.get(
    "/finance"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ALL TRANSACTIONS
|--------------------------------------------------------------------------
*/

export const getTransactions = async (params = {}) => {
  const { data } = await api.get(
    "/finance/transactions",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| MPESA TRANSACTIONS
|--------------------------------------------------------------------------
|
| Supports:
| - status
| - search
| - receipt number
| - customer
|
|--------------------------------------------------------------------------
*/

export const getMpesaTransactions = async (params = {}) => {
  const { data } = await api.get(
    "/finance/transactions",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| FINANCE REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async (params = {}) => {
  const { data } = await api.get(
    "/finance/reports",
    {
      params,
    }
  );

  return data;
};