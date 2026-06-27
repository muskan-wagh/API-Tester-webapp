"use client";
import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  History,
  Folder,
  FolderOpen,
  ChevronRight,
  X,
  Clock,
  Star,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const methodColors = {
  GET: "text-[var(--method-get)] bg-[var(--method-get)]/10 border-[var(--method-get)]/20",
  POST: "text-[var(--method-post)] bg-[var(--method-post)]/10 border-[var(--method-post)]/20",
  PUT: "text-[var(--method-put)] bg-[var(--method-put)]/10 border-[var(--method-put)]/20",
  PATCH: "text-[var(--method-patch)] bg-[var(--method-patch)]/10 border-[var(--method-patch)]/20",
  DELETE: "text-[var(--method-delete)] bg-[var(--method-delete)]/10 border-[var(--method-delete)]/20",
};

const Sidebar = memo(({
  history,
  collections,
  onSelectHistory,
  userName,
  onLogout,
  onCreateCollection,
  collectionError,
  onClearCollectionError,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName("");
      setIsCreatingCollection(false);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.filter((col) =>
    col.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">Hurl</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50 pl-8 pr-3 text-xs text-sidebar-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-1 px-3 pb-2">
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "history"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-sidebar-foreground"
          )}
        >
          <History className="h-3.5 w-3.5" />
          History
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "collections"
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-sidebar-foreground"
          )}
        >
          <Folder className="h-3.5 w-3.5" />
          Collections
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {activeTab === "history" ? (
          <div className="space-y-0.5">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No requests yet</p>
                <p className="text-[11px] text-muted-foreground/60">
                  Send your first request to see it here
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredHistory.map((item) => (
                  <motion.button
                    key={item._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      onSelectHistory(item);
                      setSelectedId(item._id);
                    }}
                    className={cn(
                      "group relative flex w-full flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-all",
                      selectedId === item._id
                        ? "border-sidebar-ring/30 bg-sidebar-accent"
                        : "border-transparent hover:border-sidebar-border hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border",
                          methodColors[item.method] || "text-muted-foreground bg-muted/10 border-muted/20"
                        )}>
                          {item.method}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.responseStatus && `${item.responseStatus}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-foreground">
                          <Star className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    <span className="truncate text-xs text-sidebar-foreground">
                      {item.url}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {item.responseTime && (
                        <span className="text-[10px] text-muted-foreground">
                          {item.responseTime}ms
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {collectionError && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <span className="flex-1">{collectionError}</span>
                <button onClick={onClearCollectionError} className="text-destructive/60 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {filteredCollections.length === 0 && !isCreatingCollection ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No collections yet</p>
              </div>
            ) : (
              filteredCollections.map((col) => (
                <motion.div
                  key={col._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-all hover:border-sidebar-border hover:bg-sidebar-accent/50"
                >
                  <Folder className="h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 truncate text-xs font-medium text-sidebar-foreground">
                    {col.name}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                </motion.div>
              ))
            )}

            {isCreatingCollection ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateCollection}
                className="mt-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2.5"
              >
                <input
                  autoFocus
                  className="mb-2 w-full rounded-md border border-sidebar-border bg-card px-2.5 py-1.5 text-xs text-sidebar-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring"
                  placeholder="Collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCollection(false)}
                    className="flex-1 rounded-md border border-sidebar-border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-sidebar-accent"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : (
              <button
                onClick={() => setIsCreatingCollection(true)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-sidebar-border px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                New Collection
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-sidebar-border px-3 py-2.5">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-sidebar-foreground">
              {userName}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Sign out"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
