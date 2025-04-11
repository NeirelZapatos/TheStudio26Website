import { GET, POST } from '../app/api/orders/route';
import { NextRequest } from 'next/server';
import dbConnect from '../app/lib/dbConnect';
import Order from '../app/models/Order';
import Item from '../app/models/Item';
import Course from '../app/models/Course';
import { sendOrderEmail } from '../app/lib/mailer';
import 'dotenv/config';

// Mocks
jest.mock('../app/lib/dbConnect', () => jest.fn());

jest.mock('../app/models/Order', () => {
  const mockOrder = function () {
    return {
      _id: '12345',
      save: jest.fn().mockResolvedValue({ _id: '12345' }),
    };
  };
  mockOrder.find = jest.fn();
  return mockOrder;
});

jest.mock('../app/models/Item', () => ({
  findById: jest.fn().mockResolvedValue({ price: 50 }),
}));

jest.mock('../app/models/Course', () => ({
  findById: jest.fn().mockResolvedValue({ price: 100 }),
}));

jest.mock('../app/lib/mailer', () => ({
  sendOrderEmail: jest.fn(),
}));

describe('GET /api/orders', () => {
  it('returns orders without filters', async () => {
    (Order.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

    console.log(`${process.env.NEXTAUTH_URL}/api/orders`);

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders` } as NextRequest;
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([{ id: 1 }]);
  });

  it('returns orders with filters', async () => {
    (Order.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const request = {
      url: `${process.env.NEXTAUTH_URL}/api/orders?start=2025-01-01&end=2025-01-31`,
    } as NextRequest;

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([{ id: 1 }]);
  });

  it('handles GET errors', async () => {
    (Order.find as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders` } as NextRequest;
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'DB error' });
  });
});

describe('POST /api/orders', () => {
  it('creates an order successfully', async () => {
    const body = {
      customer_id: '67f07f533af3b60571ea2adf',
      product_items: ['67eb2857426d567905c67bc3'],
      course_items: ['67d0eeb57a2116d64f1b0c6e'],
      shipping_method: 'Standard',
      payment_method: 'Credit Card',
      order_status: 'pending',
      shipping_address: '123 Main St',
      billing_address: '123 Main St',
      order_date: new Date().toISOString(),
    };

    const mockRequest = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toHaveProperty('_id', '12345');
  });

  it('fails to create an order', async () => {
    const body = {
      product_items: ['67eb2857426d567905c67bc3'],
      course_items: ['67d0eeb57a2116d64f1b0c6e'],
      shipping_method: 'Standard',
      payment_method: 'Credit Card',
      order_status: 'pending',
      shipping_address: '123 Main St',
      billing_address: '123 Main St',
      order_date: new Date().toISOString(),
    };

    const mockRequest = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
  });

  it('handles POST errors', async () => {
    // Simulate an internal server error by making Item.findById reject
    // const originalFindById = Item.findById;
    (Item.findById as jest.Mock).mockRejectedValue(new Error('Item DB error'));

    const body = {
      customer_id: '67f07f533af3b60571ea2adf',
      product_items: ['67eb2857426d567905c67bc3'],
      course_items: ['67d0eeb57a2116d64f1b0c6e'],
      shipping_method: 'Standard',
      payment_method: 'Credit Card',
      order_status: 'pending',
      shipping_address: '123 Main St',
      billing_address: '123 Main St',
      order_date: new Date().toISOString(),
    };

    const mockRequest = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Item DB error' });

    // Restore original method if needed
    // (Item.findById as jest.Mock).mockImplementation(originalFindById);
  });
});
