import React, { useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";

export default function ProductCard({
  product,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  isResellerMode,
}) {
  const [margin, setMargin] = useState(0); // Default profit margin ₹0
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const finalQuotedPrice = product.price + margin;

  const handleShareSimulate = () => {
    setCopied(true);
    // Copy a mock reshare description to clipboard
    const description = `🔥 *${product.name}* 🔥\n\n${product.description}\n\n💸 *Special Price:* ₹${finalQuotedPrice}\n🚚 Shipping: ${product.shippingCost === 0 ? "FREE Shipping!" : `₹${product.shippingCost}`}\n\nInbox me to place your order now!`;
    navigator.clipboard.writeText(description);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    onAddToCart(product, margin);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div id={`product-card-${product.id}`} className="group relative bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300 flex flex-col h-full shadow-lg">
      
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3.5 right-3.5 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-zinc-300 hover:text-rose-500 active:scale-90 transition-all z-10"
        >
          <Heart size={16} fill={isWishlisted ? "#f43f5e" : "transparent"} className={isWishlisted ? "text-rose-500" : ""} />
        </button>

        {/* Category Badge */}
        <span className="absolute bottom-3.5 left-3.5 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-mono tracking-wider text-zinc-300 font-medium">
          {product.category}
        </span>

        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span className="absolute top-3.5 left-3.5 px-2 py-0.5 bg-orange-600 rounded-md text-[10px] font-bold text-white shadow">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center text-amber-500 text-xs font-semibold">
            ⭐ {product.rating}
          </div>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-zinc-500 text-xs">{product.numReviews} Reviews</span>
          {product.shippingCost === 0 && (
            <>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                Free Shipping
              </span>
            </>
          )}
        </div>

        {/* Name */}
        <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {product.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-zinc-500 line-clamp-2 mt-1 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Seller Info */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-900 pb-2.5">
          <span>Seller: <strong className="text-zinc-300">{product.sellerName}</strong></span>
          <span className="font-mono">Stock: {product.stock > 0 ? product.stock : <span className="text-rose-500 font-semibold">Out of Stock</span>}</span>
        </div>

        {/* Pricing Layout */}
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-zinc-100">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-zinc-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-1">
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl tracking-wide transition-all ${
              added
                ? "bg-emerald-600 text-white"
                : product.stock <= 0
                ? "bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500 text-white active:scale-95 shadow-lg shadow-orange-950/10"
            }`}
          >
            {added ? (
              <>
                <Check size={14} />
                Added To Bag!
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                {product.stock <= 0 ? "Sold Out" : "Add to Shopping Bag"}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
