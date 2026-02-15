import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Transactions() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    api.get("/transactions", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTxs(res.data))
      .catch(() => alert("Failed to load transactions"));
  }, []);

  const statusBadge = (status) => {
    if (status === "completed") {
      return "bg-green-100 text-green-700 border-green-300";
    }
    if (status === "in_progress") {
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
    if (status === "disputed") {
      return "bg-red-100 text-red-700 border-red-300";
    }
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Transactions</h2>
        <span className="text-sm text-gray-500">
          Total: {txs.length}
        </span>
      </div>

      {txs.length === 0 && (
        <div className="border rounded-lg p-6 text-center text-gray-600 bg-gray-50">
          No transactions found.
        </div>
      )}

      <div className="space-y-4">
        {txs.map(tx => (
          <Link to={`/transaction/${tx.id}`} key={tx.id}>
            <div className="border rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-lg">
                  Transaction #{tx.id}
                </p>

                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${statusBadge(tx.status)}`}
                >
                  {tx.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Buyer:</span>{" "}
                  {tx.buyer_id}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Seller:</span>{" "}
                  {tx.seller_id}
                </p>
              </div>

              <div className="mt-2 text-sm text-gray-800">
                <span className="font-medium text-gray-900">Amount:</span>{" "}
                {tx.amount} {tx.currency}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
