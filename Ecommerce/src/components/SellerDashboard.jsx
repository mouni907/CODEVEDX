import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Package, ShoppingCart, X } from "lucide-react";

export default function SellerDashboard({ currentUser, onRefreshUser, activeTab, setActiveTab, onRefreshProducts }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [shippingCost, setShippingCost] = useState("0");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  // Category Creation State
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const loadSellerData = async () => {
    try {
      // 1. Load seller specific products
      const pRes = await fetch(`/api/products?sellerId=${currentUser.id}`);
      const pData = await pRes.json();
      setProducts(pData);

      // 2. Load incoming orders for this seller
      const oRes = await fetch(`/api/orders?userId=${currentUser.id}&role=seller`);
      const oData = await oRes.json();
      setOrders(oData);

      onRefreshUser();
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setAvailableCategories(data);
        if (data.length > 0 && !category) {
          setCategory(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    loadSellerData();
    fetchCategories();
  }, [currentUser.id]);

  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setStock("50");
    setShippingCost("0");
    setImage("");
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setIsAddOpen(true);
  };

  const handleStartEditProduct = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "");
    setStock(product.stock.toString());
    setShippingCost(product.shippingCost.toString());
    setImage(product.image || "");
    setCategory(product.category);
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setIsAddOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const finalCategory = isCreatingNewCategory ? newCategoryName.trim().toUpperCase() : category.toUpperCase();

    if (!name || !price || !finalCategory) {
      setErrorMessage("Please fill in name, price and category.");
      setLoading(false);
      return;
    }

    const body = {
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.5,
      image: image || undefined, // server provides high quality fallbacks
      category: finalCategory,
      sellerId: currentUser.id,
      stock: Number(stock),
      shippingCost: Number(shippingCost)
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        const cleanText = text.replace(/<[^>]*>/g, "").trim(); // Strip HTML tags to see the plain error message
        throw new Error(cleanText.slice(0, 150) || `Server responded with status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save catalog product.");
      }

      setIsAddOpen(false);
      setEditingProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setStock("50");
      setShippingCost("0");
      setImage("");
      setIsCreatingNewCategory(false);
      setNewCategoryName("");
      
      loadSellerData();
      fetchCategories();
      onRefreshProducts?.();
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: currentUser.id })
      });
      if (res.ok) {
        loadSellerData();
        onRefreshProducts?.();
      }
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, sellerId: currentUser.id })
      });
      if (res.ok) {
        loadSellerData();
      }
    } catch (err) {
      console.error("Error updating order status", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Seller Header Brief */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-950/20">
            {currentUser.businessName ? currentUser.businessName[0] : currentUser.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-100">{currentUser.businessName || `${currentUser.name}'s Boutique`}</h2>
              <span className="text-[10px] bg-orange-950/20 border border-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold">
                Store Owner
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Manage listings, track customer dispatches, and review premium reseller order requests.</p>
          </div>
        </div>

        {/* Dashboard Quick Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto shrink-0">
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex flex-col justify-between min-w-[105px]">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Total Revenue</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1">₹{currentUser.balance.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => setActiveTab("listings")}
            className={`p-3.5 border rounded-2xl flex flex-col justify-between min-w-[105px] text-left transition ${
              activeTab === "listings" 
                ? "bg-zinc-900 border-orange-500/40" 
                : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
            }`}
          >
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">My Catalog</span>
            <span className="text-base font-bold text-zinc-100 font-mono mt-1">{products.length} Products</span>
          </button>

          <button 
            onClick={() => setActiveTab("orders")}
            className={`p-3.5 border rounded-2xl flex flex-col justify-between min-w-[105px] text-left transition ${
              activeTab === "orders" 
                ? "bg-zinc-900 border-orange-500/40" 
                : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
            }`}
          >
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Requests</span>
            <span className="text-base font-bold text-orange-400 font-mono mt-1">{orders.length} Dispatches</span>
          </button>
        </div>
      </div>

      {/* Main Tab Rendering Block */}
      <div className="animate-fade-in">
        
        {/* Listings Section */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-200">Products Catalog Listings</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Your boutique collection currently published to consumers and resellers.</p>
              </div>
              <button
                onClick={handleStartAddProduct}
                className="flex items-center gap-1.5 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-orange-950/20 active:scale-95 transition"
              >
                <Plus size={14} />
                Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.length === 0 ? (
                <div className="col-span-2 p-16 border border-zinc-900 border-dashed rounded-3xl text-center space-y-3">
                  <Package size={36} className="text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-zinc-300">No products uploaded yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">Upload beautiful sarees, high-end accessories, or home decor items to begin generating sales.</p>
                </div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl flex items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-zinc-850 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-200 truncate">{p.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{p.description}</p>
                        <div className="flex items-center gap-2.5 mt-2">
                          <span className="text-xs font-mono font-bold text-orange-400">₹{p.price}</span>
                          <span className="text-[10px] text-zinc-500 line-through">₹{p.originalPrice}</span>
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850 uppercase">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Stock</span>
                        <strong className={`text-xs font-mono ${p.stock < 10 ? "text-rose-500 font-bold" : "text-zinc-300"}`}>{p.stock} pcs</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-2.5 text-zinc-500 hover:text-orange-400 bg-zinc-900 hover:bg-orange-950/20 border border-zinc-850 hover:border-orange-900/30 rounded-xl transition-all"
                          title="Edit Listing"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/20 border border-zinc-850 hover:border-rose-900/30 rounded-xl transition-all"
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Incoming Dispatches Section */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <h3 className="text-lg font-bold text-zinc-200">Incoming Reseller Dispatch Requests</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Orders booked by customers and resellers requiring packaging & courier shipment dispatch.</p>
            </div>

            {orders.length === 0 ? (
              <div className="p-16 border border-zinc-900 border-dashed rounded-3xl text-center space-y-4 max-w-lg mx-auto">
                <ShoppingCart size={40} className="text-zinc-700 mx-auto" />
                <h4 className="text-sm font-semibold text-zinc-300">No active dispatches</h4>
                <p className="text-xs text-zinc-500">When customers place bookings or resellers copy descriptions and book dispatch orders, they will appear here instantly for direct processing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded-2xl space-y-4 shadow-xl transition-all flex flex-col justify-between">
                    <div>
                      {/* Title Bar */}
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-zinc-300">{o.id}</span>
                          <span className="block text-[10px] text-zinc-500 mt-1">Booked: {o.orderDate}</span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 border rounded-full ${
                          o.status === "delivered" 
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                            : o.status === "shipped"
                            ? "bg-blue-950/20 border-blue-900/40 text-blue-400"
                            : o.status === "cancelled"
                            ? "bg-red-950/20 border-red-900/40 text-red-400"
                            : "bg-amber-950/20 border-amber-900/40 text-amber-400"
                        }`}>
                          ● {o.status}
                        </span>
                      </div>

                      {/* Items list inside dispatch */}
                      <div className="space-y-3 mt-4">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-xl object-cover bg-zinc-900 border border-zinc-850" />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-zinc-200 truncate">{item.product.name}</h5>
                              <span className="block text-[10px] font-mono text-zinc-500 mt-0.5">Qty: {item.quantity} | Rate: ₹{item.product.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Address info */}
                      <div className="text-xs text-zinc-400 bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl mt-4 space-y-1">
                        <strong className="text-zinc-500 block text-[9px] font-mono uppercase tracking-wider">Shipping Consignee</strong>
                        <p className="text-zinc-200 font-bold">{o.shippingAddress.name}</p>
                        <p className="text-[11px] leading-normal">{o.shippingAddress.address}, {o.shippingAddress.city} - {o.shippingAddress.zipCode}</p>
                        <div className="pt-2 mt-2 border-t border-zinc-900/60 font-mono text-[10px] text-zinc-500 flex justify-between">
                          <span>Pay Mode: {String(o.paymentMethod).toUpperCase()}</span>
                          <span>Payout Due: <strong className="text-emerald-400">₹{o.subtotal.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {o.status === "pending" && (
                      <div className="flex gap-2 pt-3 border-t border-zinc-900">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, "cancelled")}
                          className="flex-1 py-2 bg-zinc-900 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider border border-zinc-850 hover:border-red-900/30 rounded-xl transition"
                        >
                          Decline / Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, "shipped")}
                          className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                        >
                          Ship / Dispatch
                        </button>
                      </div>
                    )}

                    {o.status === "shipped" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "delivered")}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition mt-3"
                      >
                        Complete Delivery & Release Funds
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Product Modal Sheet */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl overflow-hidden p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-5">
              <div>
                <h3 className="text-base font-bold text-zinc-200">{editingProduct ? "Edit Product Details" : "Add New Product"}</h3>
                <p className="text-xs text-zinc-500">{editingProduct ? "Modify existing catalog specifications." : "List an item in the general catalog."}</p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Georgette Saree"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                      className="text-[10px] text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1"
                    >
                      {isCreatingNewCategory ? "✕ Use list" : "＋ Create category"}
                    </button>
                  </div>
                  {isCreatingNewCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. HANDICRAFTS"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategory(e.target.value);
                      }}
                      className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full py-2 px-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-orange-500/50"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">MSRP (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Shipping (₹)</label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Image Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the fabric, colors, components, care instructions, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
              >
                {loading 
                  ? (editingProduct ? "Saving changes..." : "Listing product...") 
                  : (editingProduct ? "Save Product Changes" : "Add to General Catalog")}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
