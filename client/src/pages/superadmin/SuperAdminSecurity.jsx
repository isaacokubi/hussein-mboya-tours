import React, { useEffect, useState } from "react";
import { getSecurityStatus } from "../../api/superAdminApi";

export default function SuperAdminSecurity() {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSecurity = async () => {
      try {
        const response = await getSecurityStatus();

        if (mounted) {
          setSecurity(response.data);
        }
      } catch (error) {
        console.error("Security load failed", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSecurity();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading security infrastructure...
      </div>
    );
  }

  const data = security || {};

  const authentication =
    typeof data.authentication === "object"
      ? data.authentication?.status || "Active"
      : data.authentication || "Unknown";

  const authorization =
    typeof data.authorization === "object"
      ? data.authorization?.status ||
        `Roles: ${data.authorization?.roles || 0} | Permissions: ${
          data.authorization?.permissions || 0
        } | Admins: ${data.authorization?.admins || 0}`
      : data.authorization || "Unknown";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Security Center</h1>
        <p className="text-gray-500">
          Platform authentication, authorization and threat monitoring
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card
          title="Security Score"
          value={`${data.securityScore || 0}/100`}
        />

        <Card
          title="Threat Level"
          value={data.threatLevel || "Low"}
        />

        <Card
          title="Authentication"
          value={authentication}
        />

        <Card
          title="Authorization"
          value={authorization}
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-5">
          Security Controls
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {Array.isArray(data.controls) && data.controls.length > 0 ? (
            data.controls.map((control, index) => (
              <div
                key={control._id || control.id || index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold">
                    {control.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Security module protection
                  </p>
                </div>

                <span
                  className={
                    control.status === "active"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {control.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500">
              No security controls available
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-5">
          System Protection Status
        </h2>

        <table className="w-full">
          <tbody>
            <Row
              name="Authentication Service"
              status={authentication}
            />

            <Row
              name="Authorization Service"
              status={authorization}
            />

            <Row
              name="Database"
              status={data.database}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Row({ name, status }) {
  return (
    <tr className="border-b">
      <td className="py-3 font-medium">
        {name}
      </td>

      <td className="py-3 text-right">
        <span className="px-3 py-1 rounded bg-gray-100">
          {typeof status === "object"
            ? JSON.stringify(status)
            : status || "Unknown"}
        </span>
      </td>
    </tr>
  );
}
