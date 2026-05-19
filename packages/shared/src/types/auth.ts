/** Public admin identity returned from `/api/auth/me` and login. */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
}

/** Storefront customer session profile (no password). */
export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  addressLine1: string;
  city: string;
  zipCode: string;
  country: string;
}
