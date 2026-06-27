"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF8] dark:bg-[#111110]">
      <SignUp />
    </div>
  );
}
