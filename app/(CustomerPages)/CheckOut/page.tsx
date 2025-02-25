import dbConnect from '@/app/lib/dbConnect';
import Item from '@/app/models/Item';
import CheckoutForm from '@/app/Components/CheckoutForm';

export default async function CheckoutPage() {
  await dbConnect();

  // Fetch items from MongoDB
  const items = await Item.find({}); // Add any filters if needed

  // Extract item IDs
  const itemIds = items.map((item) => item._id.toString());

  return (
    <div>
      <h1>Checkout</h1>
      <CheckoutForm itemIds={itemIds} />
    </div>
  );
}