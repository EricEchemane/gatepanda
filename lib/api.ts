export async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    credentials: "same-origin",
  })

  if (!response.ok) {
    const message =
      (await response.text()) || "Something went wrong while loading data."

    throw new Error(message)
  }

  return (await response.json()) as T
}
