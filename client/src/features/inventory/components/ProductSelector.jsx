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
                ? 'bg-[#2f8159] border-[#2f8159] text-white shadow-md'
                : 'bg-card border-border text-foreground hover:border-[#2f8159]/30 hover:bg-[#ebf6ef]'
            }
          `}
        >
          <Package size={18} className={selectedProductId === product._id ? 'text-white' : 'text-[#2f8159]'} />
          <div className="text-left">
            <div className={`text-sm font-semibold ${selectedProductId === product._id ? 'text-white' : 'text-ink'}`}>
              {product.productName}
            </div>
            <div className={`text-xs ${selectedProductId === product._id ? 'text-[#ebf6ef]' : 'text-muted-foreground'}`}>
              {product.sku}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
