import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart, CheckCircle } from "lucide-react";
import ProductSpecifications from "./ProductSpecifications";
import { addToCart } from "@/services/cartService";

interface ProductDescriptionProps {
  product: {
    _id: string;
    image_url: string;
    name: string;
    price: number;
    description: string;
    color?: string;
    material?: string;
    quantity_in_stock: number;
    category?: string;
  };
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);

  // Clean up any lingering alerts when component unmounts
  useEffect(() => {
    return () => {
      if (showAlert) {
        setShowAlert(false);
      }
    };
  }, []);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(
      1,
      Math.min(product.quantity_in_stock || 10, quantity + change)
    );
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
    };

    addToCart(item);
    setShowAlert(true);
    
    // Hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const formattedPrice =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : Number(product.price).toFixed(2);

  return (
    <>
      {/* Alert notification */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-6xl z-50 animate-slideDown">
          <div className="alert alert-success flex items-center bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-md">
            <CheckCircle className="text-green-500 mr-3" size={20} />
            <div className="flex-1">
              <span className="font-medium text-green-800">Success!</span>
              <p className="text-green-700">{quantity > 1 ? `${quantity} items` : '1 item'} of {product.name} added to your cart.</p>
            </div>
            <button 
              className="text-green-500 hover:text-green-700" 
              onClick={() => setShowAlert(false)}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 sm:mt-16 lg:mt-0 lg:col-span-2 px-4 sm:px-0">
        <h1 className="text-3xl font-serif tracking-tight text-gray-900">
          {product.name}
        </h1>
        <div className="mt-3 flex items-center">
          <p className="text-2xl font-sans tracking-tight text-gray-900">
            ${formattedPrice}
          </p>
        </div>
        <div className="mt-6 space-y-6">
          <p className="text-base text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          {product.quantity_in_stock > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center mt-2 border border-gray-300 rounded-md w-min">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-center w-12">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.quantity_in_stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4">
            {product.quantity_in_stock > 0 ? (
              <button
                onClick={(e) => {
                  handleAddToCart();
                }}
                className="flex-1 font-sans bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center transition-colors duration-200"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
            ) : (
              <button
                className="flex-1 font-sans bg-gray-300 text-gray-500 py-3 px-6 rounded-md font-medium flex items-center justify-center cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
          <ProductSpecifications product={product} />
        </div>
      </div>
    </>
  );
}