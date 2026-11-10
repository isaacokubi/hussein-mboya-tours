# Client API module: `client/src/admin/rolesApi.js`

**Source:** [client/src/admin/rolesApi.js](../../../../client/src/admin/rolesApi.js)

This module wraps role CRUD requests using the shared Axios client. `getRoles` sends `GET /admin/roles`; `createRole(payload)` sends `POST` with the role payload; `updateRole(id, payload)` sends `PUT /admin/roles/:id`; and `deleteRole(id)` sends `DELETE /admin/roles/:id`. Each awaits Axios and returns only `response.data`. Axios errors therefore reject to the caller. Backend authorization and validation are defined in the admin role route/controller, not here.

The import points to `client/src/api/axios.js`, which establishes the API base URL and applicable credentials/tenant headers. Role changes are security-sensitive: the backend must guard role management and validate permission assignments. Avoid assuming this wrapper itself grants access.

```js
import api from "../api/axios";
export const getRoles = async()=>{
    const { data } = await api.get("/admin/roles");
    return data;
};
export const createRole = async(payload)=>{
    const { data } = await api.post("/admin/roles", payload);
    return data;
};
export const updateRole = async(id,payload)=>{
    const { data } = await api.put(`/admin/roles/${id}`, payload);
    return data;
};
export const deleteRole = async(id)=>{
    const { data } = await api.delete(`/admin/roles/${id}`);
    return data;
};
```
