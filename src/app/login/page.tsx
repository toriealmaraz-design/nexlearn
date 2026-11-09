import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto px-4 py-20 text-center text-[#6b7796]">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
