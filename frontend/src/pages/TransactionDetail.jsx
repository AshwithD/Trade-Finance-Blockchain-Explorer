import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function TransactionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    api.get(`/transaction?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(() => alert("Failed to load transaction"));
  }, [id]);

  if (!data) return <div className="p-6 text-gray-600">Loading transaction details...</div>;

  const { transaction, documents, ledger } = data;

  const docTypeMap = {};
  documents.forEach(doc => {
    docTypeMap[doc.id] = doc.doc_type;
  });

  const statusBadge = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "in_progress") return "bg-yellow-100 text-yellow-700";
    if (status === "pending") return "bg-orange-100 text-orange-700";
    if (status === "disputed") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Transaction #{transaction.id}</h2>
        <p className="text-sm text-gray-500 mt-1">
          View full trade flow, documents, and ledger history
        </p>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Buyer</p>
          <p className="font-medium">User #{transaction.buyer_id}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Seller</p>
          <p className="font-medium">User #{transaction.seller_id}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium">
            {transaction.amount} {transaction.currency}
          </p>
        </div>
      </div>

      {/* Status */}
      <div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge(transaction.status)}`}
        >
          Status: {transaction.status}
        </span>
      </div>

      {/* Documents */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-4">📄 Documents</h3>

        {documents.length === 0 ? (
          <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="border rounded p-3 bg-gray-50 hover:shadow transition"
              >
                <p className="font-medium">{doc.doc_type}</p>
                <p className="text-sm text-gray-600">Status: {doc.status}</p>

                <a
                  href={`http://127.0.0.1:8000/file?file_url=${doc.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-blue-600 text-sm underline"
                >
                  Download File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger Timeline */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-4">🧾 Ledger Timeline</h3>

        {ledger.length === 0 ? (
          <p className="text-gray-500 text-sm">No ledger entries yet.</p>
        ) : (
          <div className="space-y-4">
            {ledger.map((entry, index) => {
              const docType = docTypeMap[entry.document_id] || "Document";

              return (
                <div
                  key={index}
                  className="relative pl-4 border-l-4 border-blue-600 bg-gray-50 p-3 rounded"
                >
                  <p className="font-medium">
                    {entry.action} – {docType}
                  </p>

                  <p className="text-sm text-gray-700">
                    By {entry.actor_role} (User #{entry.actor_id})
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>

                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    {entry.extra_data?.transaction_id && (
                      <p>🔗 Transaction: #{entry.extra_data.transaction_id}</p>
                    )}
                    {entry.extra_data?.po_id && (
                      <p>📄 PO ID: #{entry.extra_data.po_id}</p>
                    )}
                    {entry.extra_data?.tracking_id && (
                      <p>📦 Tracking ID: {entry.extra_data.tracking_id}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
