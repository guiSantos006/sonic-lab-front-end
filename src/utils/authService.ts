/**
 * Authentication Service
 * Strictly conforms to OpenAPI 3.1.0 specification
 * Server: http://localhost:8080
 *
 * Endpoints:
 * - POST /auth/register (RegisterUserRequest -> RegisterUserResponse)
 * - POST /auth/login (LoginRequest -> LoginResponse)
 * - POST /auth/forgot-password (ForgotPasswordRequest -> string)
 * - POST /auth/reset-password (ResetPasswordRequest -> string)
 * - GET /teste -> string
 * - GET /teste/users -> UserResponse[]
 */

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserResponse {
  id: string; // format: uuid
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
    };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: 'A senha deve conter pelo menos uma letra e um número.',
    };
  }
  return { valid: true };
}

export const TOKEN_STORAGE_KEY = 'sonic_lab_token';
export const DEFAULT_BACKEND_PORT = '8080';
export const DEFAULT_BACKEND_URL = `http://localhost:${DEFAULT_BACKEND_PORT}`;

/**
 * Returns current active backend port (defaults to 8080 or localStorage override)
 */
export function getBackendPort(): string {
  try {
    const saved = localStorage.getItem('sonic_lab_backend_port');
    if (saved && /^\d+$/.test(saved.trim())) {
      return saved.trim();
    }
  } catch {
    // ignore
  }

  const envPort =
    typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_BACKEND_PORT?: string } }).env?.VITE_BACKEND_PORT;
  if (envPort && /^\d+$/.test(envPort)) {
    return envPort;
  }

  return DEFAULT_BACKEND_PORT;
}

/**
 * Updates the backend port in localStorage
 */
export function setBackendPort(port: string | number): void {
  try {
    const clean = String(port).trim().replace(/[^\d]/g, '');
    if (clean) {
      localStorage.setItem('sonic_lab_backend_port', clean);
      localStorage.setItem('sonic_lab_backend_url', `http://localhost:${clean}`);
    }
  } catch {
    // ignore
  }
}

/**
 * Returns active backend base URL, e.g. http://localhost:8080
 */
export function getBackendBaseUrl(): string {
  try {
    const savedUrl = localStorage.getItem('sonic_lab_backend_url');
    if (savedUrl && savedUrl.startsWith('http')) {
      return savedUrl.replace(/\/+$/, '');
    }
    const savedPort = localStorage.getItem('sonic_lab_backend_port');
    if (savedPort && /^\d+$/.test(savedPort)) {
      return `http://localhost:${savedPort.trim()}`;
    }
  } catch {
    // ignore
  }

  const envUrl =
    typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_BACKEND_URL?: string } }).env?.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '');
  }

  return `http://localhost:${DEFAULT_BACKEND_PORT}`;
}

/**
 * Sets explicit base URL
 */
export function setBackendBaseUrl(url: string): void {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean) {
      localStorage.setItem('sonic_lab_backend_url', clean);
      const portMatch = clean.match(/:(\d+)$/);
      if (portMatch) {
        localStorage.setItem('sonic_lab_backend_port', portMatch[1]);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Decodes JWT token payload if valid JWT (format: header.payload.signature)
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    }
  } catch {
    // Not a valid JWT or parse error
  }
  return null;
}

/**
 * Extracts error details from response data (handles Spring Boot, Express, Django, etc.)
 */
function extractErrorMessage(data: unknown, status: number, statusText: string): string {
  if (status === 429) {
    if (typeof data === 'object' && data !== null && 'message' in data && typeof (data as Record<string, unknown>).message === 'string') {
      return (data as Record<string, unknown>).message as string;
    }
    return 'Limite de requisições excedido. Por favor, aguarde um minuto e tente novamente.';
  }

  if (status === 409) {
    return 'Este e-mail já está cadastrado no sistema.';
  }

  if (status === 401 || status === 403) {
    if (typeof data === 'object' && data !== null && 'message' in data && typeof (data as Record<string, unknown>).message === 'string') {
      const msg = (data as Record<string, unknown>).message as string;
      if (msg.trim()) return msg.trim();
    }
    return 'E-mail ou senha incorretos.';
  }

  if (!data) return `Erro do servidor (${status}: ${statusText || 'Falha na requisição'})`;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;

    // Spring Boot validation errors: errors array
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const messages = obj.errors
        .map((e: unknown) => {
          if (typeof e === 'object' && e !== null) {
            const errObj = e as Record<string, unknown>;
            return errObj.defaultMessage || errObj.message || '';
          }
          return typeof e === 'string' ? e : '';
        })
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }

    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message.trim();
    }
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error.trim();
    }
    if (typeof obj.detail === 'string' && obj.detail.trim()) {
      return obj.detail.trim();
    }
  }

  return `Erro na requisição (${status}: ${statusText || 'Não autorizado / Dados inválidos'})`;
}

/**
 * Sends a POST request with JSON to the backend.
 * Tries direct backend URL (e.g. http://localhost:8080/auth/...) first,
 * with automatic fallback to relative /auth/... proxy if CORS or direct connection is blocked.
 */
async function postToBackend(
  subPath: '/auth/register' | '/auth/login' | '/auth/forgot-password' | '/auth/reset-password',
  bodyObj: unknown
): Promise<Response> {
  const baseUrl = getBackendBaseUrl();
  const directUrl = `${baseUrl}${subPath}`;
  const relativeUrl = subPath;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const body = JSON.stringify(bodyObj);

  try {
    const response = await fetch(directUrl, {
      method: 'POST',
      headers,
      body,
    });
    return response;
  } catch (directError) {
    // If direct fetch to http://localhost failed (e.g., in cloud preview or CORS),
    // attempt relative proxy path through Vite dev server
    try {
      const proxyResponse = await fetch(relativeUrl, {
        method: 'POST',
        headers,
        body,
      });
      return proxyResponse;
    } catch {
      // Both attempts failed
      const port = getBackendPort();
      throw new Error(
        `Não foi possível conectar ao back-end em ${directUrl}. Verifique se o servidor está rodando na porta ${port} e se o CORS está liberado (@CrossOrigin).`
      );
    }
  }
}

/**
 * POST /auth/register
 * Sends RegisterUserRequest { name, email, password }
 * Returns RegisterUserResponse { name, email }
 */
export async function apiRegister(payload: RegisterUserRequest): Promise<RegisterUserResponse> {
  const cleanName = payload.name.trim();
  const cleanEmail = payload.email.trim();
  const cleanPassword = payload.password;

  const passwordValidation = validatePassword(cleanPassword);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || 'Senha inválida.');
  }

  // Exactly matches RegisterUserRequest schema: { name, email, password }
  const requestBody: RegisterUserRequest = {
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
  };

  const response = await postToBackend('/auth/register', requestBody);
  const responseText = await response.text();

  let data: Record<string, unknown> = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    const errorMsg = extractErrorMessage(data, response.status, response.statusText);
    throw new Error(errorMsg);
  }

  return {
    name: (typeof data.name === 'string' && data.name) || cleanName,
    email: (typeof data.email === 'string' && data.email) || cleanEmail,
  };
}

/**
 * POST /auth/login
 * Sends LoginRequest { email, password }
 * Returns LoginResponse { token }
 */
export async function apiLogin(payload: LoginRequest): Promise<LoginResponse> {
  const cleanEmail = payload.email.trim();
  const cleanPassword = payload.password;

  // Exactly matches LoginRequest schema: { email, password }
  const requestBody: LoginRequest = {
    email: cleanEmail,
    password: cleanPassword,
  };

  const response = await postToBackend('/auth/login', requestBody);
  const responseText = await response.text();

  let data: Record<string, unknown> = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    const errorMsg = extractErrorMessage(data, response.status, response.statusText);
    throw new Error(errorMsg);
  }

  // Extract the token returned by the backend per LoginResponse schema
  let token =
    (typeof data.token === 'string' && data.token) ||
    '';

  // Check nested or alternate token format if returned
  if (!token && typeof data.data === 'object' && data.data !== null) {
    const nested = data.data as Record<string, unknown>;
    if (typeof nested.token === 'string') token = nested.token;
  }

  if (!token && typeof responseText === 'string' && responseText.trim().startsWith('eyJ')) {
    token = responseText.trim();
  }

  if (!token) {
    const possibleKey = Object.keys(data).find(
      (k) =>
        typeof data[k] === 'string' &&
        (k.toLowerCase().includes('token') || (data[k] as string).startsWith('eyJ'))
    );
    if (possibleKey) {
      token = data[possibleKey] as string;
    }
  }

  if (token) {
    setAuthToken(token);
  }

  return {
    token: token || '',
  };
}

/**
 * POST /auth/forgot-password
 * Sends ForgotPasswordRequest { email }
 * Returns string response
 */
export async function apiForgotPassword(payload: ForgotPasswordRequest): Promise<string> {
  const requestBody: ForgotPasswordRequest = {
    email: payload.email.trim(),
  };

  const response = await postToBackend('/auth/forgot-password', requestBody);
  const responseText = await response.text();

  if (!response.ok) {
    let data: unknown;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = responseText;
    }
    throw new Error(extractErrorMessage(data, response.status, response.statusText));
  }

  return responseText || 'E-mail de recuperação enviado com sucesso.';
}

/**
 * POST /auth/reset-password
 * Sends ResetPasswordRequest { token, newPassword }
 * Returns string response
 */
export async function apiResetPassword(payload: ResetPasswordRequest): Promise<string> {
  const passwordValidation = validatePassword(payload.newPassword);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || 'Nova senha inválida.');
  }

  const requestBody: ResetPasswordRequest = {
    token: payload.token.trim(),
    newPassword: payload.newPassword,
  };

  const response = await postToBackend('/auth/reset-password', requestBody);
  const responseText = await response.text();

  if (!response.ok) {
    let data: unknown;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = responseText;
    }
    throw new Error(extractErrorMessage(data, response.status, response.statusText));
  }

  return responseText || 'Senha redefinida com sucesso.';
}


/**
 * GET /teste
 * Returns string
 */
export async function apiTest(): Promise<string> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}/teste`);
  if (!response.ok) {
    throw new Error(`Erro na rota de teste (${response.status})`);
  }
  return await response.text();
}

/**
 * GET /teste/users
 * Returns UserResponse[]
 */
export async function apiListUsers(): Promise<UserResponse[]> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}/teste/users`);
  if (!response.ok) {
    throw new Error(`Erro ao listar usuários (${response.status})`);
  }
  return await response.json();
}

/**
 * Tests connection to the backend server
 */
export async function testBackendConnection(): Promise<{
  ok: boolean;
  url: string;
  port: string;
  message: string;
}> {
  const baseUrl = getBackendBaseUrl();
  const port = getBackendPort();

  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'OPTIONS',
    });
    return {
      ok: true,
      url: baseUrl,
      port,
      message: `Back-end online em ${baseUrl} (HTTP ${res.status})`,
    };
  } catch {
    try {
      const proxyRes = await fetch('/auth/login', {
        method: 'OPTIONS',
      });
      return {
        ok: true,
        url: `${baseUrl} (via proxy)`,
        port,
        message: `Back-end online via proxy local na porta ${port}`,
      };
    } catch {
      return {
        ok: false,
        url: baseUrl,
        port,
        message: `Não foi possível conectar em ${baseUrl}. Inicie seu servidor na porta ${port}.`,
      };
    }
  }
}

/**
 * Retrieve current cached token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store token in localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem('sonic_lab_auth', 'true');
  } catch {
    // Ignore storage issues
  }
}

/**
 * Remove token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('sonic_lab_auth');
  } catch {
    // Ignore
  }
}
