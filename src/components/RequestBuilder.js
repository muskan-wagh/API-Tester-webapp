"use client";
import { useState, useEffect, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  X,
  ChevronDown,
  Code,
  FileText,
  Braces,
  Sigma,
  Binary,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const methodColors = {
  GET: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  POST: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  PUT: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  PATCH: { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  DELETE: { bg: "bg-red-500", text: "text-red-600 dark:text-red-400", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

const bodyTypes = [
  { id: "json", label: "JSON", icon: Braces },
  { id: "form-data", label: "Form Data", icon: FileText },
  { id: "raw", label: "Raw", icon: Code },
  { id: "binary", label: "Binary", icon: Binary },
  { id: "text", label: "Text", icon: Sigma },
  { id: "xml", label: "XML", icon: FileCode },
];

const TABS = [
  { id: "headers", label: "Headers" },
  { id: "params", label: "Params" },
  { id: "authorization", label: "Authorization" },
  { id: "body", label: "Body" },
  { id: "cookies", label: "Cookies" },
  { id: "tests", label: "Tests" },
  { id: "settings", label: "Settings" },
];

const RequestBuilder = memo(({ onSend, loading, initialData, collections }) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("headers");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState("json");
  const [collectionId, setCollectionId] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastUrl");
    if (saved) setUrl(saved);
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (url) handleSubmit(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [url, method, headers, body, collectionId]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    if (index === headers.length - 1 && value) {
      newHeaders.push({ key: "", value: "" });
    }
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders.length ? newHeaders : [{ key: "", value: "" }]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    localStorage.setItem("lastUrl", url);
    const headerObj = {};
    headers.forEach((h) => {
      if (h.key.trim()) headerObj[h.key] = h.value;
    });

    let parsedBody = null;
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      if (bodyType === "json") {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body;
        }
      } else {
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

  const mc = methodColors[method] || methodColors.GET;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2 md:px-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground">Workspace</span>
          {collections.length > 0 && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="rounded-md border-0 bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground outline-none focus:ring-0"
              >
                <option value="">No Collection</option>
                {collections.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-3 md:px-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMethodOpen(!methodOpen)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold tracking-wide uppercase transition-all",
                mc.badge
              )}
            >
              {method}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {methodOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMethodOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-24 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMethod(m); setMethodOpen(false); }}
                      className={cn(
                        "flex w-full items-center px-3 py-1.5 text-xs font-bold tracking-wide transition-colors hover:bg-accent",
                        methodColors[m]?.text
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative flex-1">
            <input
              ref={urlRef}
              type="url"
              placeholder="https://api.example.com/users"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 pr-20 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-1 md:flex">
              <span className="text-[10px] text-muted-foreground/40">Ctrl+Enter</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden md:inline">{loading ? "Sending..." : "Send"}</span>
          </button>
        </div>
      </form>

      <div className="flex items-center gap-0 border-b border-border bg-muted/20 px-3 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 py-2.5 text-[11px] font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
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
          transition={{ duration: 0.12 }}
          className="bg-background"
        >
          {activeTab === "headers" && (
            <div className="max-h-[320px] min-h-[120px] overflow-auto p-4">
              <div className="flex flex-col gap-0">
                <div className="hidden grid-cols-[1fr_1fr_32px] gap-2 px-0.5 pb-1.5 md:grid">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Key</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Value</span>
                </div>
                {headers.map((header, index) => (
                  <div
                    key={index}
                    className="group -mx-1 flex flex-col gap-1.5 rounded-lg px-1 py-1 transition-colors hover:bg-muted/30 md:flex-row md:items-center"
                  >
                    <input
                      className="h-8 flex-1 rounded-md border border-input bg-card px-2.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring/20"
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                    />
                    <input
                      className="h-8 flex-1 rounded-md border border-input bg-card px-2.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring/20"
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHeader(index)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddHeader}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add header
                </button>
              </div>
            </div>
          )}

          {activeTab === "params" && (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-xs text-muted-foreground">Query parameters coming soon</p>
            </div>
          )}

          {activeTab === "authorization" && (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-xs text-muted-foreground">Authorization coming soon</p>
            </div>
          )}

          {activeTab === "body" && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 border-b border-border px-3 py-1.5 overflow-x-auto">
                {bodyTypes.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => setBodyType(bt.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                        bodyType === bt.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {bt.label}
                    </button>
                  );
                })}
              </div>
              <div className="max-h-[400px] min-h-[160px] overflow-auto">
                {bodyType === "json" ? (
                  <div className="relative">
                    <textarea
                      className="h-[200px] w-full resize-none border-0 bg-background p-4 font-mono text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
                      placeholder='{\n  "key": "value"\n}'
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      spellCheck={false}
                    />
                    <div className="absolute bottom-3 right-3 rounded bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                      JSON
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="h-[200px] w-full resize-none border-0 bg-background p-4 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
                    placeholder="Enter body content..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          )}

          {(activeTab === "cookies" || activeTab === "tests" || activeTab === "settings") && (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-xs text-muted-foreground capitalize">{activeTab} coming soon</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default RequestBuilder;
