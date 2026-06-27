"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser, useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false });
const RequestBuilder = dynamic(() => import("../components/RequestBuilder"), { ssr: false });
const ResponseViewer = dynamic(() => import("../components/ResponseViewer"), { ssr: false });

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  // Use Clerk's isSignedIn as primary auth gate — it's always in sync with the session.
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

  // Convex data — run when Clerk confirms the user is signed in
  const history = useQuery(
    api.functions.getRequestHistory,
    isUserReady && user?.id ? { userId: user.id } : "skip",
  );
  const collections = useQuery(
    api.functions.getCollections,
    isUserReady && user?.id ? { userId: user.id } : "skip",
  );

  // Convex mutations
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

  // Loading — wait for Clerk to resolve the session
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCF8] dark:bg-[#111110]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-[#D97757]"></div>
          <p className="animate-pulse text-sm text-[#6b6b6b] dark:text-[#9a9a9a]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — only show landing page when Clerk confirms no session
  if (!isUserReady) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDFCF8] dark:bg-[#111110]">
        <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 text-[#D97757] dark:text-[#e88b6a]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-medium text-[#1a1a1a] dark:text-[#e8e6e1]">API Tester</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6b6b] transition-colors hover:bg-[#F5F3F0] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:bg-[#1c1c1a] dark:hover:text-[#e8e6e1]"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <SignInButton>
              <button className="text-sm font-medium text-[#6b6b6b] transition hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:text-[#e8e6e1]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-lg bg-[#D97757] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#C46745] dark:bg-[#e88b6a]">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8E6E1] bg-white px-4 py-2 text-sm text-[#6b6b6b] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#9a9a9a]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D97757] dark:bg-[#e88b6a]"></span>
              Powered by Convex + Clerk
            </div>
            <h1 className="mb-6 text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#e8e6e1] md:text-5xl">
              Test APIs with ease,
              <br />
              <span className="text-[#D97757] dark:text-[#e88b6a]">save everything</span>
            </h1>
            <p className="mb-10 text-base text-[#6b6b6b] dark:text-[#9a9a9a] md:text-lg">
              A beautiful API testing workspace. Make requests, save
              collections, track history — all synced in real-time.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SignUpButton>
                <button className="rounded-xl bg-[#D97757] px-8 py-3.5 font-medium text-white shadow-sm transition hover:bg-[#C46745] dark:bg-[#e88b6a] dark:hover:bg-[#d97757]">
                  Create free account
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-xl border border-[#E8E6E1] bg-white px-8 py-3.5 font-medium text-[#1a1a1a] transition hover:bg-[#FDFCF8] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#e8e6e1] dark:hover:bg-[#111110]">
                  Sign in
                </button>
              </SignInButton>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-3">
              {[
                "🔐 Clerk Auth",
                "⚡ Real-time Convex DB",
                "📦 Collections",
                "🕐 Request History",
                "🌐 All HTTP Methods",
              ].map((f) => (
                <span
                  key={f}
                  className="rounded-lg border border-[#E8E6E1] bg-white px-4 py-2 text-sm text-[#6b6b6b] dark:border-[#2a2a28] dark:bg-[#1c1c1a] dark:text-[#9a9a9a]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </main>

        <footer className="px-4 py-6 text-center text-sm text-[#9a9a9a] dark:text-[#6b6b6b] md:px-8">
          <p>© 2025 API Tester. Built with Convex + Clerk.</p>
        </footer>
      </div>
    );
  }

  // Authenticated - main app
  return (
    <div className="flex h-screen bg-[#FDFCF8] dark:bg-[#111110]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E8E6E1] bg-white px-4 dark:border-[#2a2a28] dark:bg-[#1c1c1a] md:h-16 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b6b6b] transition-colors hover:bg-[#F5F3F0] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:bg-[#111110] dark:hover:text-[#e8e6e1] md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <svg
              className="hidden h-5 w-5 text-[#D97757] md:block dark:text-[#e88b6a]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-medium text-[#1a1a1a] dark:text-[#e8e6e1] md:text-base">Workspace</span>
            <span className="hidden text-[#9a9a9a] dark:text-[#6b6b6b] md:inline">/</span>
            <span className="hidden text-sm text-[#6b6b6b] dark:text-[#9a9a9a] md:inline">My Requests</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6b6b] transition-colors hover:bg-[#F5F3F0] hover:text-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:bg-[#111110] dark:hover:text-[#e8e6e1]"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <span className="hidden max-w-[140px] truncate rounded-full bg-[#F5F3F0] px-3 py-1.5 text-xs font-medium text-[#6b6b6b] dark:bg-[#111110] dark:text-[#9a9a9a] md:block">
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 overflow-auto bg-[#FDFCF8] p-4 dark:bg-[#111110] md:gap-6 md:p-8">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 md:gap-6">
            <RequestBuilder
              onSend={handleSendRequest}
              loading={sending}
              initialData={activeRequest}
              collections={collections || []}
            />
            <ResponseViewer response={response} loading={sending} />
          </div>
        </main>
      </div>
    </div>
  );
}
