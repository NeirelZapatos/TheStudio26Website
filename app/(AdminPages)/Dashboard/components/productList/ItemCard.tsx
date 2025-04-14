import { Item } from './ItemTypes';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div className="flex flex-col h-full cursor-pointer" onClick={onClick}>
      <div className="mb-2 h-48 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">Product Image</div>
        )}
      </div>
      <h3 className="font-medium text-lg">{item.name}</h3>
      <p className="text-gray-700">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
      <button 
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
      >
        View Details
      </button>
    </div>
  );
};

export default ItemCard;