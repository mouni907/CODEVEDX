import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Tag, ShieldCheck } from "lucide-react";

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateMargin,
  onRemoveItem,
  isResellerMode,
  onProceedToCheckout,
}) {
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  if (!isOpen) return null;

  // Calculations
  const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const marginTotal = isResellerMode 
    ? cartItems.reduce((sum, item) => sum + item.marginProfit * item.quantity, 0)
    : 0;

  // Let's implement Free Express Shipping threshold
  const freeShippingThreshold = 150;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - itemTotal);
  const shippingFee = itemTotal > 0 ? (itemTotal >= freeShippingThreshold ? 0 : 15) : 0;

  const discountAmount = discountApplied ? Math.round(itemTotal * 0.1) : 0; // 10% discount on products base price
  const subtotal = itemTotal - discountAmount;
  const grandTotal = subtotal + marginTotal + shippingFee;

  const handleApplyPromo = () => {
    setPromoError("");
    if (promoCode.trim().toUpperCase() === "ATELIER10") {
      setDiscountApplied(true);
    } else {
      setPromoError("Invalid code. Use 'ATELIER10' for 10% off.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Panel container */}
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-850 flex flex-col shadow-2xl z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-600/10 border border-orange-500/20 rounded-lg text-orange-500">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Your Shopping Bag</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Free Shipping Progress bar */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-zinc-900/40 border-b border-zinc-900">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                {missingForFreeShipping > 0 ? (
                  <>Add <strong className="text-zinc-100">₹{missingForFreeShipping.toFixed(2)}</strong> more to unlock <strong className="text-orange-400">Free Express Shipping!</strong></>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">🎉 Express Shipping unlocked!</span>
                )}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">{Math.min(100, Math.round((itemTotal / freeShippingThreshold) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (itemTotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Bag Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
                <Trash2 size={24} />
              </div>
              <h4 className="text-sm font-semibold text-zinc-300">Your bag is empty</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">
                Explore our catalog to find fine handcrafted home decor and boutique items.
              </p>
              <button
                onClick={onClose}
                className="mt-5 py-2 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              return (
                <div 
                  key={item.product.id}
                  className="p-3 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 rounded-2xl flex gap-3 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-850">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-semibold text-zinc-200 line-clamp-1">
                          {item.product.name}
                        </h5>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-zinc-500 hover:text-rose-500 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-zinc-100">₹{item.product.price}</span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[10px] text-zinc-500 line-through">₹{item.product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Reseller margin adjust inline (Meesho style) */}
                    {isResellerMode && (
                      <div className="mt-2.5 px-2 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500 font-mono">Profit Margin (Item):</span>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={item.marginProfit}
                            onChange={(e) => onUpdateMargin(item.product.id, Math.max(0, Number(e.target.value)))}
                            className="w-8 bg-transparent text-center text-zinc-200 font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-500">Quantity</span>
                      <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 p-0.5 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center font-mono text-xs text-zinc-300">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Block */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-zinc-900 bg-zinc-950 space-y-4">
            
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="ENTER CODE (ATELIER10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full py-2 pl-8 pr-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono uppercase text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] text-red-400 font-mono">{promoError}</p>}
              {discountApplied && <p className="text-[10px] text-emerald-400 font-mono">🎉 Promo code applied! 10% discount on catalog base price.</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-zinc-900 pt-3">
              <div className="flex justify-between text-zinc-400">
                <span>Product Base Price ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-mono text-zinc-300">₹{itemTotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Code Discount (10%)</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {isResellerMode && marginTotal > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Your Reseller Profit Margin</span>
                  <span className="font-mono">+₹{marginTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping Carrier Fee</span>
                <span className="font-mono text-zinc-300">
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between text-sm font-bold text-zinc-100 border-t border-zinc-900 pt-2.5">
                <span>Total Quote Price</span>
                <span className="font-mono text-orange-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 active:scale-[0.98] transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
