import React from "react";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {getAdminUsers,updateUserStatus,deleteUser} from "../../api/adminUserApi";
import { createCompanyAccount } from "../../api/adminUserApi.js";




const COMPANY_ACCOUNT_ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Tour Manager" },
  { value: "tour_guide", label: "Tour Guide" },
  { value: "driver", label: "Driver" },
  { value: "agent", label: "Travel Agent" },
  { value: "customer", label: "Customer" },
];

const CompanyAccountForm = ({ onCreated, onCancel }) => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await createCompanyAccount(form);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      });

      if (onCreated) {
        await onCreated();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create company account."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Create Company Account
          </h2>

          <p className="text-sm text-gray-500">
            Create an account for this company. Super Admin accounts
            cannot be created here.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Full Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-lg border px-3 py-2"
            placeholder="Operations Manager"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="rounded-lg border px-3 py-2"
            placeholder="operations@example.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Phone Number</span>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            maxLength={10}
            inputMode="numeric"
            className="rounded-lg border px-3 py-2"
            placeholder="0712345679"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="rounded-lg border px-3 py-2"
            placeholder="AsecurePassword1"
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium">Account Type</span>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-lg border px-3 py-2"
          >
            {COMPANY_ACCOUNT_ROLES.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-3 md:col-span-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function SuperAdminUsers(){

const [search,setSearch]=useState("");
const [showCreateAccount,setShowCreateAccount]=useState(false);

const {data,isLoading,refetch}=useQuery({
queryKey:["superadmin-users",search],
queryFn:()=>getAdminUsers({search})
});


const users=data?.users || data?.data || data || [];


const status=async(id,value)=>{
await updateUserStatus({id,status:value});
refetch();
};


const remove=async(id)=>{
if(confirm("Delete this user permanently?")){
await deleteUser(id);
refetch();
}
};


return <div className="p-8 space-y-6">

<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div>
    <h1 className="text-3xl font-bold">
      SuperAdmin User Management
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      Manage users and create accounts for the current company tenant.
    </p>
  </div>

  <button
    type="button"
    onClick={()=>setShowCreateAccount(true)}
    className="rounded-xl bg-black px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
  >
    + Create Company Account
  </button>
</div>

{showCreateAccount && (
  <CompanyAccountForm
    onCancel={()=>setShowCreateAccount(false)}
    onCreated={async()=>{
      await refetch();
      setShowCreateAccount(false);
    }}
  />
)}

<div className="grid md:grid-cols-4 gap-4">

<Card title="Total Users" value={users.length}/>
<Card title="Active" value={users.filter(u=>u.status==="active").length}/>
<Card title="Admins" value={users.filter(u=>String(u.role).includes("admin")).length}/>
<Card title="Customers" value={users.filter(u=>u.role==="customer").length}/>

</div>


<input
className="border rounded-xl p-3 w-full"
placeholder="Search users..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<div className="bg-white rounded-xl shadow overflow-auto">

<table className="w-full">

<thead className="bg-gray-100">
<tr>
<th className="p-4">Name</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>


<tbody>

{isLoading?
<tr><td className="p-5">Loading...</td></tr>
:
users.map(u=>

<tr className="border-t" key={u._id}>

<td className="p-4">{u.name}</td>

<td>{u.email}</td>

<td>
<span className="px-3 py-1 rounded-full bg-blue-100">
{u.role || "customer"}
</span>
</td>

<td>{u.status || "active"}</td>


<td className="space-x-2">

<button
className="border px-3 py-1 rounded"
onClick={()=>status(u._id,"active")}
>
Activate
</button>


<button
className="border px-3 py-1 rounded"
onClick={()=>status(u._id,"suspended")}
>
Suspend
</button>


<button
className="bg-red-500 text-white px-3 py-1 rounded"
onClick={()=>remove(u._id)}
>
Delete
</button>


</td>

</tr>

)}

</tbody>

</table>

</div>

</div>

}


function Card({title,value}){

return <div className="bg-white border rounded-xl p-5">

<p className="text-gray-500">{title}</p>

<h2 className="text-3xl font-bold">{value}</h2>

</div>

}
