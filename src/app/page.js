"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser, useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import dynamic from "next/dynamic";
import { Moon, Sun, Menu } from "lucide-react";

const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false });
const RequestBuilder = dynamic(() => import("../components/RequestBuilder"), { ssr: false });
const ResponseViewer = dynamic(() => import("../components/ResponseViewer"), { ssr: false });

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const isUserReady = isLoaded && isSignedIn;
  const [activeRequest, setActiveRequest] = useState(null);
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collectionError, setCollectionError] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sidebarOpen]);

  const history = useQuery(
    api.functions.getRequestHistory,
    isUserReady && user?.id ? { userId: user.id } : "skip",
  );
  const collections = useQuery(
    api.functions.getCollections,
    isUserReady && user?.id ? { userId: user.id } : "skip",
  );

  const saveRequest = useMutation(api.functions.saveRequest);
  const createCollectionMutation = useMutation(api.functions.createCollection);

  const abortRef = useRef(null);

  const handleSendRequest = useCallback(async (requestData) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setSending(true);
    setResponse(null);
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });
      const data = await res.json();
      setResponse(data);

      if (user) {
        await saveRequest({
          userId: user.id,
          method: requestData.method,
          url: requestData.url,
          headers: JSON.stringify(requestData.headers),
          body: requestData.body ? JSON.stringify(requestData.body) : "",
          responseStatus: data.status,
          responseTime: data.responseTime,
          collectionId: requestData.collectionId || undefined,
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setResponse({ error: err.message });
      }
    } finally {
      setSending(false);
    }
  }, [user, saveRequest]);

  const handleSelectHistory = useCallback((item) => {
    setActiveRequest({
      method: item.method,
      url: item.url,
      headers: item.headers ? JSON.parse(item.headers) : {},
      body: item.body ? JSON.parse(item.body) : "",
      collectionId: item.collectionId || "",
    });
  }, []);

  const handleCreateCollection = useCallback(async (name) => {
    try {
      if (user) {
        await createCollectionMutation({ userId: user.id, name });
      }
    } catch (err) {
      setCollectionError(err.message);
    }
  }, [user, createCollectionMutation]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="animate-pulse text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isUserReady) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-4 w-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">Hurl</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDark(!dark)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="mx-auto max-w-xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Powered by Convex + Clerk
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Test APIs with ease,
              <br />
              <span className="text-primary">save everything</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              A premium API testing workspace. Make requests, save collections, track history — all synced in real-time.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                  Create free account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="rounded-lg border border-border bg-card px-8 py-3 text-sm font-medium text-foreground transition hover:bg-accent">
                  Sign in
                </button>
              </SignInButton>
            </div>

            <div className="mt-14 flex flex-wrap justify-center gap-2">
              {[
                ["Shield", "Clerk Auth"],
                ["Zap", "Real-time Convex"],
                ["Folder", "Collections"],
                ["Clock", "Request History"],
                ["Globe", "All HTTP Methods"],
              ].map(([icon, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {icon === "Shield" && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
                    {icon === "Zap" && <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10" /></>}
                    {icon === "Folder" && <><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></>}
                    {icon === "Clock" && <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
                    {icon === "Globe" && <><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>}
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </main>

        <footer className="px-6 py-5 text-center text-sm text-muted-foreground">
          <p>© 2025 Hurl. Built with Convex + Clerk.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-72 md:static md:z-auto ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          history={history || []}
          collections={collections || []}
          onSelectHistory={(item) => {
            handleSelectHistory(item);
            setSidebarOpen(false);
          }}
          userName={user?.emailAddresses?.[0]?.emailAddress || user?.fullName}
          onLogout={() => {}}
          onCreateCollection={handleCreateCollection}
          collectionError={collectionError}
          onClearCollectionError={() => setCollectionError("")}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-foreground">Hurl</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-0 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
              <RequestBuilder
                onSend={handleSendRequest}
                loading={sending}
                initialData={activeRequest}
                collections={collections || []}
              />
              <ResponseViewer response={response} loading={sending} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
