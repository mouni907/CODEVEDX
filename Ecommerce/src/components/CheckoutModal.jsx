import React, { useState } from "react";
import { X, Check, CreditCard, Shield, Truck, AlertCircle, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  isResellerMode,
  onOrderPlaced,
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState(currentUser?.name || "Aarav Sharma");
  const [address, setAddress] = useState("12, MG Road, Indiranagar");
  const [city, setCity] = useState("Bengaluru");
  const [zipCode, setZipCode] = useState("560038");
  const [country, setCountry] = useState("India");

  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!isOpen) return null;

  // Price Calculations
  const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const marginTotal = isResellerMode 
    ? cartItems.reduce((sum, item) => sum + item.marginProfit * item.quantity, 0)
    : 0;

  const standardShipping = itemTotal >= 150 ? 0 : 15;
  const deliveryFee = deliveryOption === "express" ? standardShipping + 50 : standardShipping;

  const grandTotal = itemTotal + marginTotal + deliveryFee;

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!name || !address || !city || !zipCode || !country) {
        setError("Please fill in all shipping details");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setError("");
    setLoading(true);

    if (!currentUser) {
      setError("Please login to place your order.");
      setLoading(false);
      return;
    }

    const orderBody = {
      buyerId: currentUser.id,
      items: cartItems,
      shippingAddress: {
        name,
        address,
        city,
        zipCode,
        country
      },
      deliveryOption,
      deliveryFee,
      subtotal: itemTotal,
      profitMarginTotal: marginTotal,
      grandTotal,
      paymentMethod
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      onOrderPlaced(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        
        {/* Left Column - Multi-Step Interactive Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold tracking-wider text-orange-500 uppercase">
                🔒 SSL SECURE CHECKOUT
              </span>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            {/* Stepper indicator matching screenshot 1 */}
            <div className="flex items-center gap-2.5 mb-8 select-none">
              <div className="flex items-center gap-1.5">
                <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                  step >= 1 ? "bg-orange-600 text-white" : "bg-zinc-900 text-zinc-500"
                }`}>
                  1
                </span>
                <span className={`text-[10px] uppercase font-mono tracking-wider ${step === 1 ? "text-zinc-200 font-bold" : "text-zinc-500"}`}>Shipping</span>
              </div>
              <div className="h-px w-8 bg-zinc-850" />
              <div className="flex items-center gap-1.5">
                <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                  step >= 2 ? "bg-orange-600 text-white" : "bg-zinc-900 text-zinc-500"
                }`}>
                  2
                </span>
                <span className={`text-[10px] uppercase font-mono tracking-wider ${step === 2 ? "text-zinc-200 font-bold" : "text-zinc-500"}`}>Delivery</span>
              </div>
              <div className="h-px w-8 bg-zinc-850" />
              <div className="flex items-center gap-1.5">
                <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                  step >= 3 ? "bg-orange-600 text-white" : "bg-zinc-900 text-zinc-500"
                }`}>
                  3
                </span>
                <span className={`text-[10px] uppercase font-mono tracking-wider ${step === 3 ? "text-zinc-200 font-bold" : "text-zinc-500"}`}>Payment</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 mb-5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Steps Rendering */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="step-1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  onSubmit={handleNextStep}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Shipping Details</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Aarav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-2 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="12, MG Road, Indiranagar"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full py-2 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        required
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full py-2 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Postal / Zip Code</label>
                      <input
                        type="text"
                        required
                        placeholder="560038"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full py-2 px-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg active:scale-98 transition"
                  >
                    Continue to Delivery
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Delivery Option</h3>

                  <div className="space-y-3">
                    {/* Standard Card */}
                    <label className={`flex items-start justify-between p-4 bg-zinc-900/40 border rounded-2xl cursor-pointer hover:border-zinc-700 transition select-none ${
                      deliveryOption === "standard" ? "border-orange-500/80 bg-zinc-900" : "border-zinc-900"
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === "standard"}
                          onChange={() => setDeliveryOption("standard")}
                          className="mt-1 accent-orange-600"
                        />
                        <div>
                          <span className="block text-sm font-semibold text-zinc-200">Standard Delivery</span>
                          <span className="block text-xs text-zinc-500 mt-1 leading-relaxed">
                            Takes 4 to 5 days to arrive safely. Included with your regular shipping fee.
                          </span>
                          <span className="block text-xs font-mono font-bold text-zinc-300 mt-2.5">
                            {standardShipping === 0 ? "FREE" : `₹${standardShipping.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Express Card */}
                    <label className={`flex items-start justify-between p-4 bg-zinc-900/40 border rounded-2xl cursor-pointer hover:border-zinc-700 transition select-none ${
                      deliveryOption === "express" ? "border-orange-500/80 bg-zinc-900" : "border-zinc-900"
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === "express"}
                          onChange={() => setDeliveryOption("express")}
                          className="mt-1 accent-orange-600"
                        />
                        <div>
                          <span className="block text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                            <Truck size={14} className="text-orange-500" /> Fast Order (Express)
                          </span>
                          <span className="block text-xs text-zinc-500 mt-1 leading-relaxed">
                            Expedited handling. Arrives in 1 to 2 days instead of standard schedule.
                          </span>
                          <span className="block text-xs font-mono font-bold text-orange-400 mt-2.5">
                            + ₹50.00 Surcharge
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-xl border border-zinc-800 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg active:scale-98 transition"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step-3"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Payment Method</h3>

                  {/* Pre-seeded balance notice if Customer/Reseller has earnings */}
                  {currentUser && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={15} className="text-emerald-400" />
                        <span className="text-xs text-zinc-300">Your Wallet Balance:</span>
                      </div>
                      <strong className="text-xs text-emerald-400 font-mono">₹{currentUser.balance.toFixed(2)}</strong>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`py-4 px-3 flex flex-col items-center justify-center gap-2.5 border rounded-2xl transition select-none ${
                        paymentMethod === "card" ? "border-orange-500 bg-zinc-900 text-white" : "border-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <CreditCard size={18} className={paymentMethod === "card" ? "text-orange-500" : ""} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Card</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`py-4 px-3 flex flex-col items-center justify-center gap-2.5 border rounded-2xl transition select-none ${
                        paymentMethod === "cod" ? "border-orange-500 bg-zinc-900 text-white" : "border-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Truck size={18} className={paymentMethod === "cod" ? "text-orange-500" : ""} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">COD</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`py-4 px-3 flex flex-col items-center justify-center gap-2.5 border rounded-2xl transition select-none ${
                        paymentMethod === "upi" ? "border-orange-500 bg-zinc-900 text-white" : "border-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Shield size={18} className={paymentMethod === "upi" ? "text-orange-500" : ""} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">UPI / Pay</span>
                    </button>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl space-y-3">
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase font-semibold">💳 Debit/Credit Card Checkout</span>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number (4111 2222 3333 4444)"
                          className="w-full py-2 px-3.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full py-2 px-3.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            className="w-full py-2 px-3.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        📦 <strong>Cash on Delivery (COD)</strong> selected. You can pay our shipping agent in cash or via QR scan upon arrival at your doorstep.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl space-y-2">
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase font-semibold">📱 Fast UPI Mobile Payment</span>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        className="w-full py-2 px-3.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-xl border border-zinc-800 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg active:scale-98 transition disabled:opacity-50"
                    >
                      {loading ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Receipt Summary (5 cols) matching screenshot 1 */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-zinc-950/40 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          
          {/* Receipt Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
                Order Receipt Summary
              </h3>
              <button
                onClick={onClose}
                className="hidden md:block p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-850 rounded-lg hover:border-zinc-750 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* List of items inside receipt */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-850 shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-200 truncate">
                      {item.product.name}
                    </h4>
                    <span className="block text-[10px] font-mono text-zinc-500 mt-0.5">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-300 shrink-0">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing calculations details inside receipt */}
          <div className="border-t border-zinc-900 pt-6 mt-6 space-y-3.5">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono text-zinc-300">₹{itemTotal.toFixed(2)}</span>
            </div>

            {isResellerMode && marginTotal > 0 && (
              <div className="flex justify-between text-xs text-amber-500">
                <span>Earned profit margin</span>
                <span className="font-mono">+₹{marginTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-zinc-500">
              <span>Shipping Fee</span>
              <span className="font-mono text-zinc-300">
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-zinc-900">
              <span className="text-sm font-extrabold text-zinc-200">Total Amount</span>
              <span className="text-lg font-extrabold font-mono text-orange-500">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Footer notice */}
            <div className="pt-6 flex items-center justify-center gap-2 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-widest text-center">
              <Shield size={12} className="text-zinc-600" />
              <span>256-Bit SSL Secure Checkout</span>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
