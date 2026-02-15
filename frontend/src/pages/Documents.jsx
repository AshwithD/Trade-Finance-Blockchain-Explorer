import { useEffect, useState } from "react";
import api from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    api
      .get("/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setDocuments(res.data))
      .catch(() => alert("Unauthorized"));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        📄 My Documents
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-xl p-4 bg-white shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {doc.doc_number}
                </p>
                <p className="text-sm text-gray-500">
                  Type: {doc.doc_type}
                </p>
              </div>

              {/* Status badge */}
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium
                  ${
                    doc.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "DISPUTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
              >
                {doc.status}
              </span>
            </div>

            {/* Compromised warning */}
            {doc.is_compromised && (
              <div className="mt-2 text-sm text-red-600 font-medium">
                ⚠ Integrity issue detected
              </div>
            )}

            <div className="mt-4">
              <a href={`/document/${doc.id}`}>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition">
                  View Details →
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No documents available.
        </p>
      )}
    </div>
  );
}
