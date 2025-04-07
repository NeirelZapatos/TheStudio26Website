import {POST, GET, PUT} from "../app/api/orders/route";
import Order from "../app/models/Order";
import dbConnect from "../app/lib/dbConnect";

jest.mock('../app/models/Order', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

test('GET /api/orders returns 200 on success', async () => {
    const req = {
      url: 'http://localhost/api/orders?start=2025-01-01&end=2025-01-31',
    } as any;
  
    (Order.find as jest.Mock).mockResolvedValue([]);
  
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
  