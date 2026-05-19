import crypto from 'node:crypto';
import type { Express, Request, Response } from 'express';

import type { Customer, Order } from '../../packages/shared/src/types';
import { formatInvoiceNumber } from '../../packages/shared/src/utils/invoice';
import type { CatalogJson } from '../catalogService';
import { hashPasswordSync } from '../customerRepository';
import type { CustomerRepository } from '../customerRepository';
import {
  clearCustomerSessionCookie,
  customerToUser,
  loginCustomer,
  logoutCustomer,
  resolveCustomerId,
  setCustomerSessionCookie,
} from './session';

type CatalogAccess = {
  read: () => CatalogJson;
  write: (next: CatalogJson) => void;
};

export function mountCustomerAuthRoutes(
  app: Express,
  customerRepo: CustomerRepository,
  catalog: CatalogAccess,
) {
  const requireCustomer = (req: Request, res: Response): string | null => {
    const id = resolveCustomerId(req, customerRepo);
    if (!id) {
      res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
      return null;
    }
    return id;
  };

  app.get('/api/store/auth/me', (req, res) => {
    const customerId = resolveCustomerId(req, customerRepo);
    if (!customerId) {
      res.status(401).json({ error: 'Not signed in' });
      return;
    }
    const cat = catalog.read();
    const profile = cat.customers.find((c) => c.id === customerId);
    if (!profile) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }
    res.json({ user: customerToUser(profile) });
  });

  app.post('/api/store/auth/register', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

    if (!email || !password || password.length < 8) {
      res.status(400).json({ error: 'Email and password (min 8 chars) required' });
      return;
    }
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const cat = catalog.read();
    if (cat.customers.some((c) => c.email.toLowerCase() === email) || customerRepo.findByEmail(email)) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cus_${crypto.randomUUID().slice(0, 12)}`,
      email,
      name,
      phone,
      addressLine1: typeof req.body?.addressLine1 === 'string' ? req.body.addressLine1.trim() : '',
      city: typeof req.body?.city === 'string' ? req.body.city.trim() : '',
      zipCode: typeof req.body?.zipCode === 'string' ? req.body.zipCode.trim() : '',
      country: typeof req.body?.country === 'string' ? req.body.country.trim() : '',
      createdAt: now,
      updatedAt: now,
    };

    customerRepo.upsertCredentials(customer.id, email, hashPasswordSync(password));
    cat.customers.push(customer);
    catalog.write(cat);

    const login = await loginCustomer(customerRepo, email, password);
    if ('error' in login) {
      res.status(201).json({ user: customerToUser(customer) });
      return;
    }
    setCustomerSessionCookie(res, login.token);
    res.status(201).json({ user: customerToUser(customer) });
  });

  app.post('/api/store/auth/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email.trim() || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const result = await loginCustomer(customerRepo, email, password);
    if ('error' in result) {
      res.status(401).json({ error: result.error });
      return;
    }
    const cat = catalog.read();
    const profile = cat.customers.find((c) => c.id === result.customerId);
    if (!profile) {
      res.status(401).json({ error: 'Account profile missing' });
      return;
    }
    setCustomerSessionCookie(res, result.token);
    res.json({ user: customerToUser(profile) });
  });

  app.post('/api/store/auth/logout', (req, res) => {
    logoutCustomer(req, customerRepo);
    clearCustomerSessionCookie(res);
    res.json({ ok: true });
  });

  app.patch('/api/store/profile', (req, res) => {
    const customerId = requireCustomer(req, res);
    if (!customerId) return;

    const cat = catalog.read();
    const ix = cat.customers.findIndex((c) => c.id === customerId);
    if (ix < 0) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const cur = cat.customers[ix];
    const next: Customer = {
      ...cur,
      name: typeof req.body?.name === 'string' ? req.body.name.trim() : cur.name,
      phone: typeof req.body?.phone === 'string' ? req.body.phone.trim() : cur.phone,
      addressLine1:
        typeof req.body?.addressLine1 === 'string' ? req.body.addressLine1.trim() : cur.addressLine1,
      city: typeof req.body?.city === 'string' ? req.body.city.trim() : cur.city,
      zipCode: typeof req.body?.zipCode === 'string' ? req.body.zipCode.trim() : cur.zipCode,
      country: typeof req.body?.country === 'string' ? req.body.country.trim() : cur.country,
      updatedAt: new Date().toISOString(),
    };
    cat.customers[ix] = next;
    catalog.write(cat);
    res.json({ user: customerToUser(next) });
  });

  app.get('/api/store/my-orders', (req, res) => {
    const customerId = requireCustomer(req, res);
    if (!customerId) return;

    const cat = catalog.read();
    const profile = cat.customers.find((c) => c.id === customerId);
    const orders = cat.orders
      .filter(
        (o) =>
          o.customerId === customerId ||
          (profile && o.customerEmail.toLowerCase() === profile.email.toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ orders });
  });

  app.get('/api/store/my-orders/:orderId', (req, res) => {
    const customerId = requireCustomer(req, res);
    if (!customerId) return;

    const cat = catalog.read();
    const profile = cat.customers.find((c) => c.id === customerId);
    const order = cat.orders.find(
      (o) =>
        o.id === req.params.orderId &&
        (o.customerId === customerId ||
          (profile && o.customerEmail.toLowerCase() === profile.email.toLowerCase())),
    );
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ order });
  });
}

export function attachCustomerToOrder(order: Order, customerId: string | null, catalog: CatalogJson): Order {
  const invoiceNumber = order.invoiceNumber ?? formatInvoiceNumber(catalog.orders.length + 1);
  if (!customerId) return { ...order, invoiceNumber };

  const profile = catalog.customers.find((c) => c.id === customerId);
  if (!profile) return { ...order, customerId, invoiceNumber };

  const address =
    [profile.addressLine1, profile.city, profile.zipCode, profile.country].filter(Boolean).join(', ') ||
    order.customerAddress;

  return {
    ...order,
    customerId,
    invoiceNumber,
    customerName: profile.name || order.customerName,
    customerEmail: profile.email || order.customerEmail,
    customerPhone: profile.phone || order.customerPhone,
    customerAddress: address,
  };
}
