"use client";

import { SWRConfig } from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const errorInfo = await response.text();
    (error as any).info = errorInfo;
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
};

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: true,
        suspense: false,
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
