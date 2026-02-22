import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function AuditorVerification() {
  const [docs, setDocs] = useState([]);
  const [ledger, setLedger] = useState([]);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchVerificationQueue();
    fetchLedger();
  }, []);

  const fetchVerificationQueue = async () => {
    try {
      const res = await api.get("/auditor/verification-queue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await api.get("/ledger/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLedger(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

      alert("✅ PO + LOC verified. Transaction unlocked.");
      fetchVerificationQueue();
    } catch (e) {
      console.error(e);
      alert("❌ Verify failed. Ensure PO + LOC exist.");
    }
  };

  const getLedgerForDoc = (docId) =>
    ledger.filter((l) => l.document_id === docId);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h2 className="text-3xl font-bold mb-6">🕵️ Auditor Verification</h2>

      {docs.length === 0 ? (
        <p className="text-gray-600">
          🎉 No documents pending verification.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow p-6 border relative">

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
                Number: {d.doc_number}
              </p>

              <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                Pending Verification
              </span>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Ledger</h4>
                {getLedgerForDoc(d.id).map((l, i) => (
                  <div key={i} className="text-sm border-t py-2">
                    <p><b>{l.action}</b> by User {l.actor_id}</p>
                  </div>
                ))}
              </div>

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