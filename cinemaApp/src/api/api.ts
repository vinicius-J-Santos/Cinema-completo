const API_URL = 'https://cinema-api-hs2h.onrender.com/api';

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      'Não foi possível conectar à API. Verifique o endereço e se o servidor está em execução.',
    );
  }

  const text = await response.text();
  let result: { mensagem?: string; message?: string; title?: string } | null = null;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = null;
    }
  }
  if (!response.ok) {
    throw new Error(
      result?.mensagem ||
        result?.message ||
        result?.title ||
        `A API respondeu com erro (${response.status}).`,
    );
  }
  return (result ?? []) as T;
}
