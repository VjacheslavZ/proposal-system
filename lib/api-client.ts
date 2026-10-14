/** Calls the app's JSON API and throws the server's error message on failure. */
export async function apiRequest<T>(path: string, init?: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? "GET",
    headers: init?.body === undefined ? undefined : { "content-type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}
