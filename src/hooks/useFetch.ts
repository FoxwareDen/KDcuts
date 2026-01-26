import { useEffect, useState } from "react";

type TriggerFunction<T> = () => Promise<T>;

/**
 * Custom React hook to fetch data asynchronously.
 *
 * @template T - The type of data expected from the fetch function.
 * @param {TriggerFunction<T>} param - An asynchronous function that returns a promise resolving to the data.
 * @returns {{
 *   data: T | null,
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => void,
 *   clear: () => void
 * }} An object containing the fetched data, loading and error states, and utility functions.
 *
 * @example
 * const { data, loading, error, refresh, clear } = useFetch(() => fetch("/api/data").then(res => res.json()));
 */
export default function useFetch<T>(param: TriggerFunction<T>): {
  data: T | null,
  loading: boolean,
  error: Error | null,
  refresh: () => void,
  clear: () => void
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFunc = async () => {
    setLoading(true);

    try {
      const data = await param();
      setData(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFunc();
  }, [param])

  const refresh = () => {
    fetchFunc();
  }

  const clear = () => {
    setData(null);
    setError(null);
  }

  return {
    data,
    loading,
    error,
    refresh,
    clear
  }
}
