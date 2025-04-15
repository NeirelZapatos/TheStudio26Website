import { GET } from '../app/api/financial-analytics/date-filter/route';
import { NextRequest } from 'next/server';
import dbConnect from '../app/lib/dbConnect';
import Order from '../app/models/Order';
import Item from '../app/models/Item';
import Course from '../app/models/Course';

jest.mock('../app/lib/dbConnect', () => jest.fn());

jest.mock('../app/models/Order', () => {
  const mockOrder = function () {};
  mockOrder.find = jest.fn();
  return mockOrder;
});

jest.mock('../app/models/Item', () => ({
  findById: jest.fn(),
}));

jest.mock('../app/models/Course', () => ({
  findById: jest.fn(),
}));

function makeMockRequest(path: string): NextRequest {
  return { url: new URL(`http://localhost:3000${path}`).toString() } as NextRequest;
}

describe('GET /api/financial-analytics/date-filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns total and category revenue for valid input', async () => {
    (Order.find as jest.Mock).mockResolvedValue([
      {
        product_items: ['item1', 'item2'],
        course_items: ['course1'],
      },
    ]);

    (Item.findById as jest.Mock)
      .mockResolvedValueOnce({ price: 50, category: 'Jewelry' })
      .mockResolvedValueOnce({ price: 30, category: 'Supplies' });

    (Course.findById as jest.Mock).mockResolvedValue({ price: 100 });

    const request = makeMockRequest('/api/financial-analytics/date-filter?startDate=2024-01-01&endDate=2024-12-31');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      revenue: 180,
      categoryRevenue: {
        Jewelry: { revenue: 50 },
        Stones: { revenue: 0 },
        Supplies: { revenue: 30 },
        Courses: { revenue: 100 },
      },
    });
  });

  it('returns 400 for invalid start date', async () => {
    const request = makeMockRequest('/api/financial-analytics/date-filter?startDate=invalid-date');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid Start Date' });
  });

  it('returns 400 for invalid end date', async () => {
    const request = makeMockRequest('/api/financial-analytics/date-filter?startDate=2024-01-01&endDate=invalid-date');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid End Date' });
  });

  it('returns 500 on internal server error', async () => {
    (Order.find as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const request = makeMockRequest('/api/financial-analytics/date-filter?startDate=2024-01-01&endDate=2024-12-31');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'DB failure' });
  });
});