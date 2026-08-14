import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AdminCoupons(
) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await api.get("/admin/coupons")).data,
  });
  const coupons = data?.coupons || data?.data || [];

  if (isLoading) return <div className="p-6">Loading coupons...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load coupons.</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Coupons</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100"><tr>
            <th className="p-3 text-left">Code</th><th className="p-3 text-left">Discount</th>
            <th className="p-3 text-left">Uses</th><th className="p-3 text-left">Status</th>
          </tr></thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-t">
                <td className="p-3 font-semibold">{coupon.code}</td>
                <td className="p-3">{coupon.discountType === "percentage" ? `${coupon.amount}%` : `settings.currency || "KES" ${coupon.amount}`}</td>
                <td className="p-3">{coupon.usedCount || 0} / {coupon.usageLimit || 0}</td>
                <td className="p-3">{coupon.active && new Date(coupon.expiresAt) > new Date() ? "Active" : "Inactive"}</td>
              </tr>
            ))}
            {!coupons.length && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No coupons found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
