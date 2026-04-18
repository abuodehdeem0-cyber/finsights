import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

// Base fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await response.text();
    throw error;
  }
  return response.json();
};

// Market data hooks
export function useMarketQuote(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/market/quote?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    quote: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMarketOverview() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/market/overview',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    overview: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHistoricalData(symbol: string, timeframe: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol && timeframe 
      ? `/api/market/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}` 
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Historical data doesn't change frequently
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    historicalData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStockSearch(query: string) {
  const { data, error, isLoading } = useSWR(
    query && query.length >= 2
      ? `/api/market/search?keyword=${encodeURIComponent(query)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000, // Debounce search by 1 second
    }
  );

  return {
    results: data?.results || [],
    isLoading,
    isError: error,
  };
}

// Portfolio hooks
export function usePortfolio() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/portfolio',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    portfolio: data?.positions || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Sector data hooks
export function useSectorData(sectorId: string) {
  const { data, error, isLoading } = useSWR(
    sectorId ? `/api/sectors/${sectorId}` : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    sectorData: data,
    isLoading,
    isError: error,
  };
}

// Analysis hook
export function useStockAnalysis(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/analysis?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache analysis for 1 minute
    }
  );

  return {
    analysis: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching multiple quotes at once (for dashboard indices)
export function useMultipleQuotes(symbols: string[]) {
  const symbolsKey = symbols.sort().join(',');
  
  const { data, error, isLoading } = useSWR(
    symbols.length > 0 
      ? `/api/market/quotes?symbols=${encodeURIComponent(symbolsKey)}` 
      : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    quotes: data?.quotes || {},
    isLoading,
    isError: error,
  };
}

// Preloading helper
export function preloadMarketData(symbol: string) {
  const url = `/api/market/quote?symbol=${encodeURIComponent(symbol)}`;
  return fetcher(url);
}
