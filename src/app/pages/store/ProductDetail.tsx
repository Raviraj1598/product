import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black mb-8">
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm mb-4">
            {product.category}
          </span>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                <div className="mb-6">
                  <label className="block font-medium mb-2">Quantity:</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQuantity}
                      className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Free shipping on orders over $50</li>
              <li>30-day return policy</li>
              <li>1-year warranty included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
