import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [totals, setTotals] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [risk, setRisk] = useState(null);
  const [topRisky, setTopRisky] = useState([]);
  const [topVolume, setTopVolume] = useState([]);
  const [corruptedDocs, setCorruptedDocs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const org = localStorage.getItem("org");
    const userId = localStorage.getItem("user_id");

    api.get(`/dashboard/org/totals?org_name=${org}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTotals(res.data));

    api.get(`/dashboard/org/status-breakdown?org_name=${org}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBreakdown(res.data.breakdown));

    api.get(`/dashboard/risk-score?user_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRisk(res.data));

    api.get("/dashboard/top-risky-users", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTopRisky(res.data));

    api.get("/dashboard/top-volume-users", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTopVolume(res.data));

    api.get("/dashboard/corrupted-docs", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCorruptedDocs(res.data));
  }, []);

  const exportCsv = async () => {
    const token = localStorage.getItem("accessToken");
    const org = localStorage.getItem("org");

    const res = await api.get(`/dashboard/org/export?org_name=${org}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${org}_dashboard.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const riskColor =
    risk?.risk_percent >= 50
      ? "text-red-600"
      : risk?.risk_percent >= 20
      ? "text-orange-500"
      : "text-green-600";

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">📊 Governance Dashboard</h2>
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Total Bought</p>
            <p className="text-2xl font-semibold">₹ {totals.total_bought}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Total Sold</p>
            <p className="text-2xl font-semibold">₹ {totals.total_sold}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-600">
            <p className="text-gray-500">Total Transaction Amount</p>
            <p className="text-2xl font-bold">₹ {totals.total_amount}</p>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {breakdown && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">📌 Transaction Status Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(breakdown).map(([status, count]) => (
              <span
                key={status}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk Score */}
      {risk && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">⚠️ Your Risk Score</h3>
          <p>Completed: {risk.completed}</p>
          <p>Disputed: {risk.disputed}</p>
          <p className={`text-lg font-bold ${riskColor}`}>
            Risk: {risk.risk_percent}%
          </p>
        </div>
      )}

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">🔴 Top 3 Risky Users</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th>User</th>
                <th>Org</th>
                <th>Risk %</th>
              </tr>
            </thead>
            <tbody>
              {topRisky.map(u => (
                <tr key={u.user_id} className="border-t">
                  <td>{u.name}</td>
                  <td>{u.org}</td>
                  <td className="text-red-600 font-semibold">{u.risk_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">🟢 Top 3 High Volume Users</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th>User</th>
                <th>Org</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {topVolume.map(u => (
                <tr key={u.user_id} className="border-t">
                  <td>{u.name}</td>
                  <td>{u.org}</td>
                  <td className="font-semibold">₹ {u.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corrupted Documents */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">🚨 Corrupted Documents</h3>
        {corruptedDocs.length === 0 ? (
          <p className="text-gray-500">No corrupted documents detected 🎉</p>
        ) : (
          <ul className="space-y-2">
            {corruptedDocs.map((d, i) => (
              <li key={i} className="p-3 bg-red-50 border-l-4 border-red-600 rounded">
                Doc ID: {d.doc_id} —{" "}
                {new Date(d.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
