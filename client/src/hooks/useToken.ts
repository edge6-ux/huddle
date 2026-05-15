import { useState, useCallback } from "react";
import { getToken } from "../lib/api";

interface TokenParams {
  roomSlug: string;
  displayName: string;
}

interface TokenResult {
  token: string;
  livekitUrl: string;
  roomName: string;
}

export function useToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async ({ roomSlug, displayName }: TokenParams): Promise<TokenResult> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getToken(roomSlug, displayName);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join room";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchToken, loading, error };
}
