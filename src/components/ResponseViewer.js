"use client";
import { useState, memo } from "react";

function highlightJSON(json) {
  const text = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"]+)":/g, '<span class="text-[#1976D2] dark:text-[#6fbfff]">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-[#2E7D32] dark:text-[#6fbf6f]">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="text-[#F57C00] dark:text-[#ff9f4f]">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-[#C62828] dark:text-[#ff6f6f]">$1</span>')
    .replace(/: (null)/g, ': <span class="text-[#9a9a9a] dark:text-[#6b6b6b]">$1</span>');
}

const ResponseViewer = memo(({ response, loading }) => {
  const [activeTab, setActiveTab] = useState("body");

  if (loading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#E8E6E1] bg-white p-8 shadow-sm dark:border-[#2a2a28] dark:bg-[#1c1c1a] md:min-h-[300px]">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#E8E6E1] border-t-[#D97757] dark:border-[#2a2a28] dark:border-t-[#e88b6a]"></div>
        <p className="text-sm font-medium text-[#6b6b6b] dark:text-[#9a9a9a]">
          Fetching response...
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#E8E6E1] bg-white p-8 text-[#9a9a9a] shadow-sm dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#6b6b6b] md:min-h-[300px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4 h-8 w-8 opacity-20 md:h-12 md:w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <p className="text-sm">Send a request to see the response here</p>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] p-6 shadow-sm dark:border-[#3a1a1a] dark:bg-[#1a0a0a]">
        <h3 className="mb-2 font-semibold text-[#C62828] dark:text-[#ff6f6f]">Request Failed</h3>
        <pre className="overflow-auto text-xs whitespace-pre-wrap text-[#DC2626] dark:text-[#ff6f6f]">
          {response.error}
        </pre>
      </div>
    );
  }

  const { status, statusText, responseTime, headers, body } = response;
  const isError = status >= 400;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#E8E6E1] bg-white shadow-sm dark:border-[#2a2a28] dark:bg-[#1c1c1a]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E8E6E1] bg-[#FDFCF8] px-4 py-3 dark:border-[#2a2a28] dark:bg-[#111110] md:px-6 md:py-4">
        <span className="text-xs font-medium text-[#6b6b6b] dark:text-[#9a9a9a]">Response</span>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold md:px-3 md:py-1.5 md:text-xs ${isError ? "border border-[#FEE2E2] bg-[#FEF2F2] text-[#C62828] dark:border-[#3a1a1a] dark:bg-[#1a0a0a] dark:text-[#ff6f6f]" : "border border-[#DCFCE7] bg-[#F0FDF4] text-[#16A34A] dark:border-[#1a3a1a] dark:bg-[#0a1a0a] dark:text-[#6fbf6f]"}`}
          >
            {status} {statusText}
          </span>
          <span className="rounded bg-[#F5F3F0] px-2 py-0.5 text-[10px] font-medium text-[#6b6b6b] dark:bg-[#111110] dark:text-[#9a9a9a] md:px-2.5 md:py-1 md:text-xs">
            {responseTime}ms
          </span>
        </div>
      </div>

      <div className="flex border-b border-[#E8E6E1] bg-[#F5F3F0] px-6 dark:border-[#2a2a28] dark:bg-[#111110]">
        <button
          onClick={() => setActiveTab("body")}
          className={`border-b-2 px-4 py-3 text-xs font-medium transition-all ${activeTab === "body" ? "border-[#D97757] text-[#D97757] dark:border-[#e88b6a] dark:text-[#e88b6a]" : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:text-[#e8e6e1]"}`}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab("headers")}
          className={`border-b-2 px-4 py-3 text-xs font-medium transition-all ${activeTab === "headers" ? "border-[#D97757] text-[#D97757] dark:border-[#e88b6a] dark:text-[#e88b6a]" : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:text-[#e8e6e1]"}`}
        >
          Headers
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#FDFCF8] dark:bg-[#111110]">
        {activeTab === "body" ? (
          <pre
            className="h-full overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap md:p-6"
            dangerouslySetInnerHTML={{ __html: highlightJSON(body) }}
          />
        ) : (
          <div className="h-full space-y-2 overflow-auto bg-[#FDFCF8] p-4 dark:bg-[#111110] md:p-6">
            {Object.entries(headers).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-1 rounded border-b border-[#E8E6E1] p-2 transition-colors last:border-0 hover:bg-[#F5F3F0] dark:border-[#2a2a28] dark:hover:bg-[#1c1c1a] md:flex-row"
              >
                <span className="truncate text-xs font-medium text-[#1a1a1a] dark:text-[#e8e6e1] md:w-1/3">
                  {key}
                </span>
                <span className="flex-1 font-mono text-xs break-all text-[#6b6b6b] dark:text-[#9a9a9a]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default ResponseViewer;
