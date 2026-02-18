import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function AuditorVerification() {
  const [docs, setDocs] = useState([]);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    api.get("/alerts/compromised-documents")
      .then(res => setDocs(res.data))
      .catch(console.error);

    api.get("/ledger/all")
      .then(res => setLedger(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left: Documents to Verify */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-2xl font-bold">🕵️ Auditor Verification</h2>

        {docs.map((d) => (
          <Link to={`/document/${d.id}`} key={d.id}>
            <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg border-l-4 border-red-500 transition">
              <p className="font-semibold">TYPE: {d.doc_type} (#{d.id})</p>
              <p className="text-sm text-gray-600">Created: {new Date(d.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Owner: {d.owner_id}</p>
              <p className="text-xs mt-2 break-all text-gray-500">Hash: {d.file_hash}</p>

              <span className="inline-block mt-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                Integrity Failed
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Right: Ledger Timeline */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">🧾 Immutable Ledger</h3>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {ledger.map((l, i) => (
            <div
              key={i}
              className="relative pl-6 border-l-4 border-blue-500 bg-slate-50 p-4 rounded"
            >
              <span className="absolute -left-2 top-5 w-4 h-4 bg-blue-500 rounded-full" />

              <div className="grid grid-cols-4 gap-2 text-sm">
                <p className="font-medium">Actor: {l.actor_id}</p>
                <p>Action: {l.action}</p>
                <p>Doc: #{l.document_id}</p>
                <p className="text-gray-500">{new Date(l.created_at).toLocaleString()}</p>
              </div>

              {l.extra_data && (
                <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-x-auto">
                  {JSON.stringify(l.extra_data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
