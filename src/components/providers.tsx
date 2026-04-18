"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { SWRProvider } from "./swr-provider";
import { ToastContainer } from "./toast";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </SWRProvider>
  );
}
