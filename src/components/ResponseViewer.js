"use client";
import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Download,
  Search,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function highlightJSON(json) {
  const text = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/"([^"]+)":/g, '<span class="text-blue-600 dark:text-blue-400">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-emerald-600 dark:text-emerald-400">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
    .replace(/: (null)/g, ': <span class="text-muted-foreground">$1</span>');
}

const RESPONSE_TABS = [
  { id: "body", label: "Response" },
  { id: "headers", label: "Headers" },
  { id: "cookies", label: "Cookies" },
  { id: "timeline", label: "Timeline" },
  { id: "preview", label: "Preview" },
];

const ResponseViewer = memo(({ response, loading }) => {
  const [activeTab, setActiveTab] = useState("body");
  const [copied, setCopied] = useState(false);
  const [beautified, setBeautified] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!response?.body) return;
    const text = typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const handleDownload = useCallback(() => {
    if (!response?.body) return;
    const text = typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "response.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [response]);

  const formatBody = () => {
    if (!response?.body) return "";
    if (beautified && typeof response.body === "object") {
      return JSON.stringify(response.body, null, 2);
    }
    return typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-sm md:min-h-[200px]"
      >
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs font-medium text-muted-foreground">
          Fetching response...
        </p>
      </motion.div>
    );
  }

  if (!response) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-sm md:min-h-[200px]"
      >
        <Sparkles className="mb-3 h-6 w-6 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">
          Send a request to see the response here
        </p>
      </motion.div>
    );
  }

  if (response.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 shadow-sm"
      >
        <h3 className="mb-2 text-xs font-semibold text-destructive">Request Failed</h3>
        <pre className="overflow-auto text-xs whitespace-pre-wrap text-destructive/80 font-mono">
          {response.error}
        </pre>
      </motion.div>
    );
  }

  const { status, statusText, responseTime, headers, body, size } = response;
  const isError = status >= 400;
  const isSuccess = status >= 200 && status < 300;
  const statusColor = isError
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : isSuccess
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

  const bodySize = size || (body ? new Blob([typeof body === "string" ? body : JSON.stringify(body)]).size : 0);
  const formattedSize = bodySize > 1024
    ? `${(bodySize / 1024).toFixed(1)} KB`
    : `${bodySize} B`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        expanded && "fixed inset-4 z-50"
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-muted-foreground">Response</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
              statusColor
            )}>
              {status}{statusText ? ` ${statusText}` : ""}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {responseTime}ms
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {formattedSize}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Copy response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Download response"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setBeautified(!beautified)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              beautified
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 hover:bg-accent hover:text-accent-foreground"
            )}
            title="Beautify JSON"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Toggle fullscreen"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0 border-b border-border bg-muted/10 px-3 overflow-x-auto">
        {RESPONSE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 py-2 text-[11px] font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="resp-tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="min-h-0 flex-1 overflow-auto"
        >
          {activeTab === "body" && (
            <div className="relative h-full">
              <pre
                className="h-full overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap md:p-5"
                style={{ tabSize: 2 }}
                dangerouslySetInnerHTML={{ __html: highlightJSON(beautified ? body : formatBody()) }}
              />
            </div>
          )}

          {activeTab === "headers" && (
            <div className="space-y-0.5 p-4">
              {headers && Object.entries(headers).length > 0 ? (
                Object.entries(headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-0.5 rounded-lg border border-border/50 px-3 py-2 transition-colors hover:bg-muted/30 md:flex-row md:items-center"
                  >
                    <span className="text-xs font-medium text-foreground md:w-1/3">
                      {key}
                    </span>
                    <span className="flex-1 font-mono text-[11px] break-all text-muted-foreground">
                      {value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-xs text-muted-foreground">No response headers</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === "cookies" || activeTab === "timeline" || activeTab === "preview") && (
            <div className="flex items-center justify-center py-12">
              <p className="text-xs text-muted-foreground capitalize">{activeTab} view coming soon</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

export default ResponseViewer;
