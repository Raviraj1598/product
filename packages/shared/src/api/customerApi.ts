import type { CustomerUser } from '../types/auth';
import type { Order } from '../types';

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

const jsonOpts = {
  credentials: 'include' as RequestCredentials,
  headers: { 'Content-Type': 'application/json' },
};

export async function fetchCustomerMe(): Promise<CustomerUser | null> {
  const res = await fetch(`${apiBase()}/api/store/auth/me`, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Customer auth check failed: ${res.status}`);
  const data = (await res.json()) as { user: CustomerUser };
  return data.user ?? null;
}

export async function registerCustomer(payload: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}): Promise<CustomerUser> {
  const res = await fetch(`${apiBase()}/api/store/auth/register`, {
    method: 'POST',
    ...jsonOpts,
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { user?: CustomerUser; error?: string };
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  if (!data.user) throw new Error('Registration failed');
  return data.user;
}

export async function loginCustomer(email: string, password: string): Promise<CustomerUser> {
  const res = await fetch(`${apiBase()}/api/store/auth/login`, {
    method: 'POST',
    ...jsonOpts,
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { user?: CustomerUser; error?: string };
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (!data.user) throw new Error('Login failed');
  return data.user;
}

export async function logoutCustomer(): Promise<void> {
  await fetch(`${apiBase()}/api/store/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function updateCustomerProfile(
  patch: Partial<Omit<CustomerUser, 'id' | 'email'>>,
): Promise<CustomerUser> {
  const res = await fetch(`${apiBase()}/api/store/profile`, {
    method: 'PATCH',
    ...jsonOpts,
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { user?: CustomerUser; error?: string };
  if (!res.ok) throw new Error(data.error || 'Could not update profile');
  if (!data.user) throw new Error('Could not update profile');
  return data.user;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${apiBase()}/api/store/my-orders`, { credentials: 'include' });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (!res.ok) throw new Error(`Could not load orders: ${res.status}`);
  const data = (await res.json()) as { orders: Order[] };
  return data.orders ?? [];
}

export async function fetchMyOrder(orderId: string): Promise<Order> {
  const res = await fetch(`${apiBase()}/api/store/my-orders/${encodeURIComponent(orderId)}`, {
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (res.status === 404) throw new Error('Order not found');
  if (!res.ok) throw new Error(`Could not load order: ${res.status}`);
  const data = (await res.json()) as { order: Order };
  return data.order;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  invoiceNumber?: string;
}

export async function postOrder(order: Order): Promise<PlaceOrderResult> {
  const res = await fetch(`${apiBase()}/api/orders`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  const data = (await res.json()) as PlaceOrderResult & { error?: string };
  if (!res.ok) throw new Error(data.error || `Order failed: ${res.status}`);
  return data;
}
