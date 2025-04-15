import { GET as ordersGET, POST as ordersPOST } from '../app/api/orders/route';
import { GET as idGET, PUT as idPUT, DELETE as idDELETE } from '../app/api/orders/[id]/route';
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
  mockOrder.findById = jest.fn ();
  mockOrder.findByIdAndUpdate = jest.fn();
  mockOrder.findByIdAndDelete = jest.fn();
  mockOrder.deleteOne = jest.fn();
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
    const response = await ordersGET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([{ id: 1 }]);
  });

  it('returns orders with filters', async () => {
    (Order.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const request = {
      url: `${process.env.NEXTAUTH_URL}/api/orders?start=2025-01-01&end=2025-01-31`,
    } as NextRequest;

    const response = await ordersGET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([{ id: 1 }]);
  });

  it('handles GET errors', async () => {
    (Order.find as jest.Mock).mockRejectedValue(new Error('DB error'));

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders` } as NextRequest;
    const response = await ordersGET(request);
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

    const response = await ordersPOST(mockRequest);
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

    const response = await ordersPOST(mockRequest);
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

    const response = await ordersPOST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Item DB error' });

    // Restore original method if needed
    // (Item.findById as jest.Mock).mockImplementation(originalFindById);
  });
});

describe('GET /api/orders/[id]', () => {
  it('returns order by id', async () => {
    const orderId = '12345';

    // Mock the findById to return a sample order
    (Order.findById as jest.Mock).mockResolvedValue({
      _id: orderId,
      customer_id: '67f07f533af3b60571ea2adf',
      product_items: ['67eb2857426d567905c67bc3'],
      total_amount: 150
    });
    
    // Create a request with params (Next.js context structure)
    const request = { 
      url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}`
    } as NextRequest;
    
    // Context object for dynamic route
    const context = {
      params: { id: Number(orderId) }
    };
    
    const response = await idGET(request, context);
    const json = await response.json();
    
    expect(response.status).toBe(200);
    expect(json).toHaveProperty('_id', orderId);
  });

  it('handles GET errors', async () => {
    const orderId = '12345';
    (Order.findById as jest.Mock).mockRejectedValue(new Error('DB error'));

    const context = {
      params: { id: Number(orderId) }
    };

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}` } as NextRequest;
    const response = await idGET(request, context);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'DB error' });
  });

  it('returns 404 when order does not exist', async () => {
    const orderId = 'nonexistent123';
    
    // Mock findById to return null (simulating no order found)
    (Order.findById as jest.Mock).mockResolvedValue(null);
  
    const context = {
      params: { id: Number(orderId) }
    };
  
    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}` } as NextRequest;
    const response = await idGET(request, context);
    const json = await response.json();
  
    expect(response.status).toBe(404);
    expect(json).toEqual({ error: 'Order not found' });
  });
});

describe('DELETE /api/orders/[id]', () => {
  it('successfully deletes an existing order', async () => {
    const orderId = '12345';
    
    // Mock findByIdAndDelete to return the deleted order (indicating success)
    (Order.findById as jest.Mock).mockResolvedValue({
      _id: orderId,
      customer_id: '67f07f533af3b60571ea2adf',
      product_items: ['67eb2857426d567905c67bc3'],
      total_amount: 150
    });

    (Order.deleteOne as jest.Mock).mockResolvedValue({ acknowledged: true, deletedCount: 1 });


    const context = {
      params: { id: Number(orderId) }
    };

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}` } as NextRequest;
    const response = await idDELETE(request, context);
    
    // Typically DELETE returns 200 No Content when successful
    expect(response.status).toBe(200);
  });

  it('returns 404 when trying to delete non-existent order', async () => {
    const orderId = 'nonexistent123';
    
    // Mock findByIdAndDelete to return null (no document found to delete)
    (Order.findById as jest.Mock).mockResolvedValue(null);

    const context = {
      params: { id: Number(orderId) }
    };

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}` } as NextRequest;
    const response = await idDELETE(request, context);
    const json = await response.json();
    
    expect(response.status).toBe(404);
    expect(json).toEqual({ error: 'Product not found' });
  });

  it('handles errors during deletion', async () => {
    const orderId = '12345';
    
    // Mock findByIdAndDelete to throw an error
    (Order.findById as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const context = {
      params: { id: Number(orderId) }
    };

    const request = { url: `${process.env.NEXTAUTH_URL}/api/orders/${orderId}` } as NextRequest;
    const response = await idDELETE(request, context);
    const json = await response.json();
    
    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Database connection error' });
  });
});