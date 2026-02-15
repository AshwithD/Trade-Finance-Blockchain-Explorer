import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [hashResult, setHashResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    api
      .get(`/document?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoc(res.data))
      .catch(() => alert("Access Denied"));
  }, [id]);

  if (!doc) return <div className="p-10 text-center">Loading...</div>;

  const role = localStorage.getItem("role");
  const status = doc.document.status;
  const docType = doc.document.doc_type;

  const performAction = (action) => {
    const token = localStorage.getItem("accessToken");

    api
      .post("/action", null, {
        params: { doc_id: id, action },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => window.location.reload())
      .catch(() => alert("Action not allowed"));
  };

  const verifyHash = () => {
    const token = localStorage.getItem("accessToken");

    api
      .get(`/verify-hash?document_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHashResult(res.data))
      .catch(() => alert("Hash verification failed"));
  };

  const disableVerify = hashResult?.is_valid || doc.document.is_compromised;

  const statusColor = {
    CREATED: "bg-gray-200 text-gray-800",
    ISSUE_BOL: "bg-orange-100 text-orange-700",
    SHIP: "bg-blue-100 text-blue-700",
    RECEIVE: "bg-green-100 text-green-700",
    VERIFY: "bg-purple-100 text-purple-700",
    ISSUE_LOC: "bg-indigo-100 text-indigo-700",
    PAY: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">
            Document: {doc.document.doc_number}
          </h2>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              statusColor[status] || "bg-gray-100 text-gray-700"
            }`}
          >
            Status: {status}
          </span>
        </div>

        {/* Compromised Warning */}
        {doc.document.is_compromised && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            ⚠️ <strong>Integrity Alert:</strong> This document failed hash verification.
          </div>
        )}

        {/* Role Actions */}
        <div>
          <h3 className="font-semibold mb-2">Available Actions</h3>
          <div className="flex flex-wrap gap-2">
            {role === "seller" && docType === "PO" && status === "CREATED" && (
              <button
                onClick={() => performAction("ISSUE_BOL")}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Issue BOL
              </button>
            )}

            {role === "seller" && status === "ISSUE_BOL" && (
              <button
                onClick={() => performAction("SHIP")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ship
              </button>
            )}

            {role === "buyer" && status === "SHIP" && (
              <button
                onClick={() => performAction("RECEIVE")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Receive
              </button>
            )}

            {role === "auditor" && status !== "VERIFY" && (
              <button
                onClick={() => performAction("VERIFY")}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Verify
              </button>
            )}

            {role === "bank" && status === "CREATED" && (
              <button
                onClick={() => performAction("ISSUE_LOC")}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Issue LOC
              </button>
            )}

            {role === "bank" && status === "RECEIVE" && (
              <button
                onClick={() => performAction("PAY")}
                className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
              >
                Pay
              </button>
            )}
          </div>
        </div>

        {/* File Actions */}
        <div>
          <h3 className="font-semibold mb-2">File Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`http://127.0.0.1:8000/file?file_url=${doc.document.file_url}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
            >
              Download File
            </a>

            <button
              onClick={verifyHash}
              disabled={disableVerify}
              className={`px-4 py-2 rounded text-white ${
                disableVerify
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Verify File Integrity
            </button>
          </div>

          {hashResult && (
            <div className="mt-3 p-3 rounded border">
              {hashResult.is_valid ? (
                <p className="text-green-700 font-semibold">
                  ✅ File integrity verified. Hash matches.
                </p>
              ) : (
                <p className="text-red-700 font-semibold">
                  ❌ File integrity compromised.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Ledger Timeline */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Ledger Timeline</h3>

          <div className="space-y-4">
            {doc.ledger.map((entry, index) => (
              <div
                key={index}
                className="relative pl-6 border-l-4 border-blue-500 bg-gray-50 p-4 rounded"
              >
                <span className="absolute -left-2 top-4 w-4 h-4 bg-blue-500 rounded-full"></span>
                <p className="font-medium">Action: {entry.action}</p>
                <p className="text-sm text-gray-700">
                  Actor: {entry.actor_name} ({entry.actor_role})
                </p>
                <p className="text-sm text-gray-600">
                  Organization: {entry.actor_org}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
