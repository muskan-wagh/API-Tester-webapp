"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF8] dark:bg-[#111110]">
      <SignIn />
    </div>
  );
}
