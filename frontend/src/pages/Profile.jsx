import { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");

    api.get("/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setUser(res.data))
      .catch(() => alert("Unauthorized"));

    api.get(`/dashboard/risk-score?user_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRisk(res.data));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("org");
    window.location.href = "/";
  };

  const canUpload = user.role === "buyer" || user.role === "seller";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">

        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          👤 Profile
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Your account details & activity overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded bg-gray-50">
            <p className="text-xs text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div className="p-3 rounded bg-gray-50">
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium break-all">{user.email}</p>
          </div>

          <div className="p-3 rounded bg-gray-50">
            <p className="text-xs text-gray-500">Organization</p>
            <p className="font-medium">{user.org}</p>
          </div>

          <div className="p-3 rounded bg-gray-50">
            <p className="text-xs text-gray-500">Role</p>
            <p className="font-medium text-blue-600 capitalize">{user.role}</p>
          </div>
        </div>

        {risk && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 ${
              risk.risk_percent > 30
                ? "border-red-500 bg-red-50"
                : risk.risk_percent > 10
                ? "border-yellow-500 bg-yellow-50"
                : "border-green-500 bg-green-50"
            }`}
          >
            <h3 className="font-semibold mb-2">📊 Risk Score</h3>
            <div className="flex justify-between text-sm">
              <span>Completed: {risk.completed}</span>
              <span>Disputed: {risk.disputed}</span>
            </div>
            <p className="mt-2 font-medium">
              Risk: <span className="text-lg font-bold">{risk.risk_percent}%</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <a href="/documents">
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              📄 Documents
            </button>
          </a>

          {canUpload && (
            <a href="/upload">
              <button className="w-full px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
                ⬆️ Upload
              </button>
            </a>
          )}

          <a href="/transactions">
            <button className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              🔁 Transactions
            </button>
          </a>

          <a href="/dashboard" className="col-span-2 sm:col-span-1">
            <button className="w-full px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
              📊 Dashboard
            </button>
          </a>

          <button
            onClick={logout}
            className="col-span-2 sm:col-span-3 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
