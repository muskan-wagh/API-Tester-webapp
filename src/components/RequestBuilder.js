"use client";
import { useState, useEffect, memo } from "react";

const RequestBuilder = memo(({ onSend, loading, initialData, collections }) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("headers");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [collectionId, setCollectionId] = useState("");

  useEffect(() => {
    if (initialData) {
      setMethod(initialData.method || "GET");
      setUrl(initialData.url || "");

      if (initialData.headers) {
        const headerArray = Object.entries(initialData.headers).map(
          ([key, value]) => ({ key, value }),
        );
        setHeaders(
          headerArray.length > 0 ? headerArray : [{ key: "", value: "" }],
        );
      }

      if (initialData.body) {
        setBody(
          typeof initialData.body === "object"
            ? JSON.stringify(initialData.body, null, 2)
            : initialData.body,
        );
      } else {
        setBody("");
      }

      setCollectionId(initialData.collectionId || "");
    }
  }, [initialData]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders.length ? newHeaders : [{ key: "", value: "" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const headerObj = {};
    headers.forEach((h) => {
      if (h.key.trim()) headerObj[h.key] = h.value;
    });

    let parsedBody = null;
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch (err) {
        parsedBody = body;
      }
    }

    onSend({
      method,
      url,
      headers: headerObj,
      body: parsedBody,
      collectionId: collectionId || null,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E8E6E1] bg-white shadow-sm dark:border-[#2a2a28] dark:bg-[#1c1c1a]">
      <div className="flex items-center justify-between border-b border-[#E8E6E1] bg-[#FDFCF8] px-4 py-3 dark:border-[#2a2a28] dark:bg-[#111110] md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#6b6b6b] dark:text-[#9a9a9a]">
            Workspace /
          </span>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="rounded-md border border-[#E8E6E1] bg-[#F5F3F0] px-3 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#111110] dark:text-[#e8e6e1] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
          >
            <option key="none" value="">No Collection</option>
            {collections?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 border-b border-[#E8E6E1] bg-white p-4 dark:border-[#2a2a28] dark:bg-[#1c1c1a] md:flex-row md:p-6"
      >
        <div className="flex gap-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-lg border border-[#E8E6E1] bg-[#F5F3F0] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#111110] dark:text-[#e8e6e1] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <button
            type="submit"
            disabled={loading || !url}
            className="flex-1 rounded-lg bg-[#D97757] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#C46745] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#e88b6a] dark:hover:bg-[#d97757] md:hidden"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        <div className="flex flex-1 gap-3">
          <input
            type="url"
            placeholder="Enter request URL..."
            className="min-w-0 flex-1 rounded-lg border border-[#E8E6E1] bg-[#FDFCF8] px-4 py-2.5 text-sm text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#111110] dark:text-[#e8e6e1] dark:placeholder:text-[#6b6b6b] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="hidden rounded-lg bg-[#D97757] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#C46745] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#e88b6a] dark:hover:bg-[#d97757] md:block"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      <div className="flex border-b border-[#E8E6E1] bg-[#F5F3F0] px-6 dark:border-[#2a2a28] dark:bg-[#111110]">
        <button
          type="button"
          onClick={() => setActiveTab("headers")}
          className={`border-b-2 px-4 py-3 text-xs font-medium transition-all ${activeTab === "headers" ? "border-[#D97757] text-[#D97757] dark:border-[#e88b6a] dark:text-[#e88b6a]" : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:text-[#e8e6e1]"}`}
        >
          Headers
        </button>
        <button
          type="button"
          disabled={method === "GET" || method === "HEAD"}
          onClick={() => setActiveTab("body")}
          className={`border-b-2 px-4 py-3 text-xs font-medium transition-all ${activeTab === "body" ? "border-[#D97757] text-[#D97757] dark:border-[#e88b6a] dark:text-[#e88b6a]" : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:text-[#e8e6e1] disabled:opacity-30"}`}
        >
          Body
        </button>
      </div>

      <div className="max-h-[350px] min-h-[160px] overflow-auto bg-[#FDFCF8] p-4 dark:bg-[#111110] md:p-6">
        {activeTab === "headers" ? (
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex flex-col gap-2 md:flex-row">
                <input
                  className="flex-1 rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#e8e6e1] dark:placeholder:text-[#6b6b6b] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) =>
                    handleHeaderChange(index, "key", e.target.value)
                  }
                />
                <input
                  className="flex-1 rounded-md border border-[#E8E6E1] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#e8e6e1] dark:placeholder:text-[#6b6b6b] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) =>
                    handleHeaderChange(index, "value", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(index)}
                  className="px-2 text-[#9a9a9a] transition-colors hover:text-[#C62828] dark:text-[#6b6b6b] dark:hover:text-[#ff6f6f]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddHeader}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#D97757] hover:underline dark:text-[#e88b6a]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add header
            </button>
          </div>
        ) : (
          <textarea
            className="h-[180px] w-full resize-none rounded-lg border border-[#E8E6E1] bg-white p-4 font-mono text-sm text-[#1a1a1a] transition-all outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#e8e6e1] dark:placeholder:text-[#6b6b6b] dark:focus:border-[#e88b6a] dark:focus:ring-[#e88b6a]"
            placeholder='{ "key": "value" }'
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        )}
      </div>
    </div>
  );
});

export default RequestBuilder;
