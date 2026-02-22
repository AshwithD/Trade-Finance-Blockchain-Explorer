import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function AuditorVerification() {
  const [docs, setDocs] = useState([]);
  const token = localStorage.getItem("accessToken");

  const fetchVerificationQueue = useCallback(async () => {
    try {
      const res = await api.get("/auditor/verification-queue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchVerificationQueue();
  }, [fetchVerificationQueue]);

  const verifyDoc = async (id) => {
    try {
      await api.post(
        "/audit/verify",
        {},
        {
          params: { po_id: id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ PO + LOC verified.");
      fetchVerificationQueue();
    } catch (e) {
      console.error(e);
      alert("❌ Verification failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h2 className="text-3xl font-bold mb-6">🕵️ Auditor Verification</h2>

      {docs.length === 0 ? (
        <p className="text-gray-600">No documents pending verification.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-xl shadow p-6 border relative"
            >
              {d.doc_type === "PO" && (
                <button
                  onClick={() => verifyDoc(d.id)}
                  className="absolute -top-3 -left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-indigo-700"
                >
                  Verify Transaction
                </button>
              )}

              <p className="font-semibold text-lg mb-2">
                {d.doc_type} (#{d.id})
              </p>

              <p className="text-sm text-gray-600">
                Owner: {d.owner_id}
              </p>

              <p className="text-sm text-gray-600">
                Status: {d.status}
              </p>

              <Link
                to={`/document/${d.id}`}
                className="inline-block mt-4 text-blue-600 text-sm hover:underline"
              >
                Open full document →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}