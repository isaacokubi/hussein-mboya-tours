import api from "./axios";



/*
|--------------------------------------------------------------------------
| ADMIN CUSTOMERS
|--------------------------------------------------------------------------
|
| Admin CRM Dashboard
|
*/


// ============================================================
// GET ALL CUSTOMERS (ADMIN)
// GET /api/customers
// ============================================================

export const getAdminCustomers = async (params) => {

    const response = await api.get(
        "/customers",
        {
            params: params || {}
        }
    );

    return response.data;

};




// ============================================================
// GET CUSTOMER PROFILE (ADMIN)
// GET /api/customers/:id
// ============================================================

export const getCustomerProfile = async (id) => {

    const response = await api.get(
        `/customers/${id}`
    );

    return response.data;

};





/*
|--------------------------------------------------------------------------
| AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/


// ============================================================
// GET AGENT CUSTOMERS
// GET /api/agents/customers
// ============================================================

export const getAgentCustomers = async () => {

    const response = await api.get(
        "/agents/customers"
    );

    return response.data;

};





// ============================================================
// GET SINGLE AGENT CUSTOMER
// GET /api/agents/customers/:id
// ============================================================

export const getAgentCustomer = async (id) => {

    const response = await api.get(
        `/agents/customers/${id}`
    );

    return response.data;

};





// ============================================================
// CREATE CUSTOMER
// POST /api/agents/customers
// ============================================================

export const createCustomer = async (data) => {

    const response = await api.post(
        "/agents/customers",
        data
    );

    return response.data;

};





// ============================================================
// UPDATE CUSTOMER
// PUT /api/agents/customers/:id
// ============================================================

export const updateCustomer = async (
    id,
    data
) => {

    const response = await api.put(
        `/agents/customers/${id}`,
        data
    );

    return response.data;

};





// ============================================================
// DELETE CUSTOMER
// DELETE /api/agents/customers/:id
// ============================================================

export const deleteCustomer = async (id) => {

    const response = await api.delete(
        `/agents/customers/${id}`
    );

    return response.data;

};





/*
|--------------------------------------------------------------------------
| CUSTOMER STATISTICS
|--------------------------------------------------------------------------
*/


// ============================================================
// GET CUSTOMER STATISTICS
// GET /api/agents/customers/stats
// ============================================================

export const getCustomerStats = async () => {

    const response = await api.get(
        "/agents/customers/stats"
    );

    return response.data;

};