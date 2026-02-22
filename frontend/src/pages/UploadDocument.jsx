import { useState } from "react";
import api from "../services/api";

export default function UploadDocument() {
  const role = localStorage.getItem("role");

  const [sellerId, setSellerId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [poId, setPoId] = useState("");
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (role === "auditor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            Auditors cannot upload. They verify documents.
          </p>
        </div>
      </div>
    );
  }

  const upload = async () => {
    setError("");

    if (!file || !docType) {
      setError("Please select document type and file.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      let url = "";
      let params = {};

      if (role === "buyer" && docType === "PO") {
        if (!sellerId || !amount) {
          setError("Seller ID and Amount are required.");
          return;
        }

        url = "/po/create";
        params = {
          seller_id: sellerId,
          currency,
          amount,
        };
      } 
      else if (role === "bank" && docType === "LOC") {
        url = "/loc/issue";
        params = { po_id: poId };
      } 
      else if (role === "seller" && docType === "BOL") {
        url = "/bol/upload";
        params = { transaction_id: transactionId, tracking_id: "TRK123" };
      } 
      else if (role === "seller" && docType === "INVOICE") {
        url = "/invoice/issue";
        params = { transaction_id: transactionId };
      } 
      else {
        setError("Invalid role or document type.");
        return;
      }

      const res = await api.post(url, formData, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Uploaded successfully");

      if (res.data.transaction_id) {
        window.location.href = `/transaction/${res.data.transaction_id}`;
      } else {
        window.location.href = "/documents";
      }
    } catch (err) {
      console.error(err);
      setError("❌ Upload failed. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const ROLE_DOC_TYPES = {
    buyer: [{ value: "PO", label: "Purchase Order (PO)" }],
    seller: [
      { value: "BOL", label: "Bill of Lading (BOL)" },
      { value: "INVOICE", label: "Commercial Invoice" },
    ],
    bank: [{ value: "LOC", label: "Letter of Credit (LOC)" }],
  };

  const docTypeOptions = ROLE_DOC_TYPES[role] || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Trade Document
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {role === "buyer" && (
          <>
            <input
              className="w-full p-2 border rounded mb-3"
              placeholder="Seller User ID"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
            />

            <input
              type="number"
              className="w-full p-2 border rounded mb-3"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="w-full p-2 border rounded mb-3"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </>
        )}

        {role === "bank" && (
          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="PO Document ID"
            value={poId}
            onChange={(e) => setPoId(e.target.value)}
          />
        )}

        {role === "seller" && (
          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        )}

        <select
          className="w-full p-2 border rounded mb-3"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="">Select document type</option>
          {docTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={upload}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload & Link to Transaction"}
        </button>
      </div>
    </div>
  );
}