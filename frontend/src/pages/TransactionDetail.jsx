import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function TransactionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/transaction?id=${id}`)
      .then(res => setData(res.data))
      .catch(() => alert("Failed to load transaction"));
  }, [id]);

  if (!data) return <div className="p-6 text-gray-600">Loading transaction details...</div>;

  const { transaction, documents, ledger } = data;
  const role = localStorage.getItem("role");

  const hasPO = documents.some(d => d.doc_type === "PO");
  const hasLOC = documents.some(d => d.doc_type === "LOC");
  const hasBOL = documents.some(d => d.doc_type === "BOL");
  const hasInvoice = documents.some(d => d.doc_type === "INVOICE");

  const statusBadge = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700 border-green-300";
    if (status === "in_progress") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (status === "pending") return "bg-orange-100 text-orange-700 border-orange-300";
    if (status === "disputed") return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  const docIcon = (type) => {
    if (type === "PO") return "📝";
    if (type === "BOL") return "📦";
    if (type === "INVOICE") return "🧾";
    if (type === "LOC") return "🏦";
    return "📄";
  };

  const actionDotColor = (action) => {
    if (action === "ISSUED") return "bg-blue-600";
    if (action === "VERIFY") return "bg-purple-600";
    if (action === "SHIP") return "bg-orange-500";
    if (action === "RECEIVE") return "bg-green-600";
    if (action === "PAY") return "bg-emerald-600";
    return "bg-gray-400";
  };

  const createPO = async () => {
    setLoadingAction(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(
        `/po/create?seller_id=${transaction.seller_id}&currency=${transaction.currency}&amount=${transaction.amount}`,
        formData
      );
      window.location.reload();
    } catch {
      alert("Failed to create PO");
    } finally {
      setLoadingAction(false);
    }
  };



  const issueLOC = async (poId) => {
  setLoadingAction(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    await api.post(
      `/loc/issue?po_id=${poId}`,
      formData
    );

    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to issue LOC");
  } finally {
    setLoadingAction(false);
  }
};


const uploadBOL = async () => {
  setLoadingAction(true);
  const formData = new FormData();
  formData.append("file", file);

  try {
    await api.post(
      `/bol/upload?transaction_id=${transaction.id}&tracking_id=TRK123`,
      formData
    );
    window.location.reload();
  } catch {
    alert("Failed to upload BOL");
  } finally {
    setLoadingAction(false);
  }
};




  const issueInvoice = async () => {
  setLoadingAction(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    await api.post(
      `/invoice/issue?transaction_id=${transaction.id}`,
      formData
    );

    window.location.reload();
  } catch (err) {
    alert("Failed to issue invoice");
  } finally {
    setLoadingAction(false);
  }
  };




  const receiveGoods = async () => {
  setLoadingAction(true);

  try {
    const bolDoc = documents.find(d => d.doc_type === "BOL");

    await api.post(`/bol/receive?bol_id=${bolDoc.id}`);

    window.location.reload();
  } catch {
    alert("Failed to mark goods as received");
  } finally {
    setLoadingAction(false);
  }
  };




  const payInvoice = async (invoiceId) => {
  setLoadingAction(true);

  try {
    await api.post(`/invoice/pay?invoice_id=${invoiceId}`);
    alert("✅ Invoice Paid. Transaction Completed.");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("❌ Payment failed.");
  } finally {
    setLoadingAction(false);
  }
  };

  

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Transaction #{transaction.id}</h2>
          <p className="text-sm text-gray-500">
            End-to-end trade workflow, documents, and ledger trail
          </p>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusBadge(transaction.status)}`}
        >
          {transaction.status.toUpperCase()}
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Buyer" value={transaction.buyer_name} color="blue" />
        <SummaryCard label="Seller" value={transaction.seller_name} color="indigo" />
        <SummaryCard label="Amount" value={`${transaction.amount} ${transaction.currency}`} color="emerald" />
      </div>

      {/* Actions */}
      <Card title="⚙️ Available Actions" accent="blue">
        <div className="space-y-4">

          {role === "buyer" && !hasPO && (
            <div className="flex gap-3">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button
                onClick={createPO}
                disabled={!file || loadingAction}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create PO
              </button>
            </div>
          )}

          {role === "bank" && hasPO && !hasLOC && (
            <div className="flex gap-3">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button
                onClick={() => issueLOC(documents.find(d => d.doc_type === "PO").id)}
                disabled={!file || loadingAction}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Issue LOC
              </button>
            </div>
          )}

          {role === "auditor" && (
            <button
              onClick={() => navigate("/auditor")}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🔍 Verify in Auditor Panel
            </button>
          )}

          {role === "seller" && transaction.status === "in_progress" && (
            <div className="flex gap-3 flex-col">

              {!hasBOL && (
                <>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                  <button
                    onClick={uploadBOL}
                    disabled={!file || loadingAction}
                    className="bg-orange-600 text-white px-4 py-2 rounded"
                  >
                    Upload BOL (Ship Goods)
                  </button>
                </>
              )}

              {hasBOL && !hasInvoice && (
                <>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                  <button
                    onClick={issueInvoice}
                    disabled={!file || loadingAction}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Issue Invoice
                  </button>
                </>
              )}
            </div>
          )}

          {role === "buyer" && hasBOL && transaction.status === "in_progress" && (
            <button
              onClick={receiveGoods}
              disabled={loadingAction}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Mark Goods as Received
            </button>
          )}

          {role === "bank" && hasInvoice && transaction.status === "in_progress" && (
            <button
              onClick={() => payInvoice(documents.find(d => d.doc_type === "INVOICE").id)}
              disabled={loadingAction}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Pay Invoice
            </button>
          )}


        </div>
      </Card>

      {/* Documents */}
      <Card title="📄 Documents" accent="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="border-l-4 border-blue-500 p-4 bg-white rounded-lg flex gap-3">
              <div className="text-2xl">{docIcon(doc.doc_type)}</div>
              <div>
                <p className="font-semibold">{doc.doc_type}</p>
                <p className="text-sm">Status: {doc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ledger */}
      <Card title="🧾 Ledger Timeline" accent="purple">
        <div className="relative border-l-2 border-gray-300 pl-6 space-y-6">
          {ledger.map((entry, index) => (
            <div key={index} className="relative">
              <div className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full ${actionDotColor(entry.action)}`} />
              <div className="bg-white p-4 rounded shadow">
                <p className="font-medium">{entry.action}</p>
                <p className="text-sm text-gray-600">
                  By {entry.actor_name} ({entry.actor_role})
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    blue: "border-blue-500",
    indigo: "border-indigo-500",
    emerald: "border-emerald-500",
  };

  return (
    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${colors[color]}`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Card({ title, children, accent }) {
  const accents = {
    blue: "border-blue-500",
    purple: "border-purple-600",
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${accents[accent]}`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}



