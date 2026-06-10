import React from 'react';
import { Package } from 'lucide-react';

export default function ProductSelector({ products, selectedProductId, onSelectProduct }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {products.map((product) => (
        <button
          key={product._id}
          onClick={() => onSelectProduct(product._id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap
            ${
              selectedProductId === product._id
                ? 'bg-[#5048e5] border-[#5048e5] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#5048e5]/30 hover:bg-[#eeecfb]'
            }
          `}
        >
          <Package size={18} className={selectedProductId === product._id ? 'text-white' : 'text-[#5048e5]'} />
          <div className="text-left">
            <div className={`text-sm font-semibold ${selectedProductId === product._id ? 'text-white' : 'text-gray-900'}`}>
              {product.productName}
            </div>
            <div className={`text-xs ${selectedProductId === product._id ? 'text-[#eeecfb]' : 'text-gray-500'}`}>
              {product.sku}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
