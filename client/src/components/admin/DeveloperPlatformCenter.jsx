import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, KeyRound, RefreshCw, Send, Trash2, Webhook } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const supportedEvents = ["booking.created", "booking.updated", "payment.completed", "payment.failed", "invoice.created", "invoice.updated"];

export default function DeveloperPlatformCenter() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [hook, setHook] = useState({ name: "", url: "", events: "booking.created,payment.completed" });
  const [secret, setSecret] = useState("");

  const keys = useQuery({ queryKey: ["dev-keys"], queryFn: async () => unwrap(await api.get("/admin/developer/api-keys")) });
  const hooks = useQuery({ queryKey: ["dev-hooks"], queryFn: async () => unwrap(await api.get("/admin/developer/webhooks")) });

  const createKey = useMutation({
    mutationFn: () => api.post("/admin/developer/api-keys", { name }),
    onSuccess: (response) => { setSecret(response.data.data.secret); setName(""); qc.invalidateQueries({ queryKey: ["dev-keys"] }); toast.success("API key created."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to create API key."),
  });

  const revoke = useMutation({
    mutationFn: (id) => api.post(`/admin/developer/api-keys/${id}/revoke`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dev-keys"] }); toast.success("API key revoked."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to revoke API key."),
  });

  const createHook = useMutation({
    mutationFn: () => api.post("/admin/developer/webhooks", { ...hook, events: hook.events.split(",").map((x) => x.trim()).filter(Boolean) }),
    onSuccess: (response) => { setHook({ name: "", url: "", events: "booking.created,payment.completed" }); setSecret(response.data.data.secret || ""); qc.invalidateQueries({ queryKey: ["dev-hooks"] }); toast.success("Webhook registered."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to register webhook."),
  });

  const updateHook = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/admin/developer/webhooks/${id}`, { active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dev-hooks"] }); toast.success("Webhook status updated."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to update webhook."),
  });

  const testHook = useMutation({
    mutationFn: (id) => api.post(`/admin/developer/webhooks/${id}/test`),
    onSuccess: (response) => toast.success(response?.data?.message || "Webhook test queued."),
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to queue webhook test."),
  });

  const removeHook = useMutation({
    mutationFn: (id) => api.delete(`/admin/developer/webhooks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dev-hooks"] }); toast.success("Webhook deleted."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to delete webhook."),
  });

  const copySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard.");
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold"><KeyRound size={20} /> Developer API keys</h2><p className="mt-1 text-sm text-slate-500">Tenant-scoped credentials. Secrets are displayed only once at creation.</p></div><button onClick={() => keys.refetch()} className="rounded-lg border p-2" title="Refresh"><RefreshCw size={16} /></button></div>
        <div className="mt-4 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border p-2" placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} /><button disabled={!name.trim() || createKey.isPending} onClick={() => createKey.mutate()} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-40">{createKey.isPending ? "Creating..." : "Create"}</button></div>
        {secret && <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm"><b>Save this secret now:</b><div className="mt-1 break-all font-mono text-xs">{secret}</div><button onClick={copySecret} className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-800"><Copy size={14} /> Copy secret</button></div>}
        <div className="mt-4 space-y-2">{(keys.data || []).map((key) => <div key={key._id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><b>{key.name}</b><div className="text-xs text-slate-500">{key.prefix} · {key.revokedAt ? "Revoked" : "Active"}{key.expiresAt ? ` · Expires ${new Date(key.expiresAt).toLocaleDateString()}` : ""}</div></div>{!key.revokedAt && <button disabled={revoke.isPending} onClick={() => revoke.mutate(key._id)} className="text-sm font-semibold text-red-600">Revoke</button>}</div>)}</div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div><h2 className="flex items-center gap-2 text-xl font-bold"><Webhook size={20} /> Webhooks</h2><p className="mt-1 text-sm text-slate-500">HTTPS-only endpoints with encrypted secrets, signed delivery and durable retry processing.</p></div>
        <div className="mt-4 grid gap-2"><input className="rounded-lg border p-2" placeholder="Webhook name" value={hook.name} onChange={(e) => setHook({ ...hook, name: e.target.value })} /><input className="rounded-lg border p-2" placeholder="https://example.com/webhook" value={hook.url} onChange={(e) => setHook({ ...hook, url: e.target.value })} /><input className="rounded-lg border p-2" placeholder="booking.created,payment.completed" value={hook.events} onChange={(e) => setHook({ ...hook, events: e.target.value })} /><p className="text-xs text-slate-500">Supported: {supportedEvents.join(", ")}</p><button disabled={!hook.name.trim() || !hook.url.trim() || createHook.isPending} onClick={() => createHook.mutate()} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{createHook.isPending ? "Registering..." : "Add webhook"}</button></div>
        <div className="mt-4 space-y-3">{(hooks.data || []).map((item) => <div key={item._id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><b>{item.name}</b><div className="break-all text-xs text-slate-500">{item.url}</div><div className="mt-1 text-xs text-slate-500">{(item.events || []).join(", ")}</div></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.active ? "Active" : "Disabled"}</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><button disabled={testHook.isPending || !item.active} onClick={() => testHook.mutate(item._id)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-semibold disabled:opacity-40"><Send size={14} /> Send test</button><button disabled={updateHook.isPending} onClick={() => updateHook.mutate({ id: item._id, active: !item.active })} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-semibold"><CheckCircle2 size={14} /> {item.active ? "Disable" : "Enable"}</button><button disabled={removeHook.isPending} onClick={() => removeHook.mutate(item._id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-600"><Trash2 size={14} /> Delete</button></div><div className="mt-3 text-xs text-slate-500">Last delivery: {item.lastDeliveryAt ? new Date(item.lastDeliveryAt).toLocaleString() : "Never"} · HTTP {item.lastStatus || "—"} · Failures {item.failureCount || 0}</div></div>)}</div>
      </section>
    </div>
  );
}
