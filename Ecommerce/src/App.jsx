import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CheckoutModal from "./components/CheckoutModal";
import SellerDashboard from "./components/SellerDashboard";
import AuthModal from "./components/AuthModal";
import { 
  Sparkles, Package, ShoppingBag, ArrowRight, 
  Menu, X, Home, ShoppingCart, ClipboardList, Wallet, DollarSign, LayoutDashboard, LogIn, LogOut
} from "lucide-react";

const MOCK_CUSTOMER = {
  id: "user_customer",
  email: "customer@atelier.com",
  name: "Active Customer",
  role: "customer",
  balance: 1000,
  businessName: "Active Boutique"
};

const MOCK_SELLER = {
  id: "user_seller",
  email: "seller@atelier.com",
  name: "Artisan Boutique",
  role: "seller",
  balance: 2450,
  businessName: "Artisan Boutique"
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(MOCK_CUSTOMER);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All", "HOME DECOR", "APPAREL", "JEWELLERY", "ACCESSORIES", "TECHNOLOGY"]);

  // Navigation tabs
  const [activeCustomerTab, setActiveCustomerTab] = useState("catalog");
  const [activeSellerTab, setActiveSellerTab] = useState("listings");

  // Overlays
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Views
  const [isSellerViewActive, setIsSellerViewActive] = useState(false);
  
  // Reseller features (Meesho inspired)
  const [isResellerMode, setIsResellerMode] = useState(false);

  // Buyer Past Orders List
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load products & categories on load
  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Check last chosen view/user
    const storedUser = localStorage.getItem("atelier_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
      refreshProfile(parsed.id);
    } else {
      setCurrentUser(MOCK_CUSTOMER);
      localStorage.setItem("atelier_user", JSON.stringify(MOCK_CUSTOMER));
      refreshProfile("user_customer");
    }
  }, []);

  // Fetch products list on search / category change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  // Load buyer past orders when current user is logged in
  useEffect(() => {
    if (currentUser && currentUser.role === "customer") {
      fetchBuyerOrders();
    } else {
      setPastOrders([]);
    }
  }, [currentUser]);

  const refreshProfile = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const freshUser = await res.json();
        setCurrentUser(freshUser);
        localStorage.setItem("atelier_user", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Error refreshing profile stats", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(["All", ...data]);
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = "/api/products";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching product list", err);
    }
  };

  const fetchBuyerOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}&role=customer`);
      if (res.ok) {
        const data = await res.json();
        setPastOrders(data);
      }
    } catch (err) {
      console.error("Error getting past buyer orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const switchAccountMode = async (role) => {
    if (role === "customer") {
      setIsSellerViewActive(false);
    } else {
      setIsSellerViewActive(true);
    }
    setIsMobileSidebarOpen(false);
  };

  const handleToggleSellerView = () => {
    if (isSellerViewActive) {
      switchAccountMode("customer");
    } else {
      switchAccountMode("seller");
    }
  };

  // Add to Bag / Cart Handler
  const handleAddToCart = (product, margin) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, marginProfit: margin }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, marginProfit: margin }];
    });
  };

  const handleUpdateCartQty = (productId, qty) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleUpdateCartMargin = (productId, margin) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, marginProfit: margin } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Toggle wishlist state
  const handleToggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Place order finished callback
  const handleOrderPlacedSuccess = (order) => {
    setCart([]);
    setCheckoutOpen(false);
    if (currentUser) {
      refreshProfile(currentUser.id);
      fetchBuyerOrders();
    }
    alert(`🎉 Order placed successfully! Order ID: ${order.id}. If you earned a reseller profit margin, your wallet earnings balance has been updated.`);
  };

  // Render Left Sidebar content
  const renderSidebarContent = () => {
    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="flex flex-col h-full text-zinc-100 font-sans select-none">
        {/* Brand Header Logo */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-950/20">
            A
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-zinc-100 font-sans block">
              ATELIER<span className="text-orange-500">.</span>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
              RESELLER PORTAL
            </span>
          </div>
        </div>

        {/* Account Mode Switcher Widget */}
        <div className="mb-6 bg-zinc-900/60 border border-zinc-850 p-1 rounded-xl flex">
          <button
            onClick={() => switchAccountMode("customer")}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isSellerViewActive 
                ? "bg-orange-600 text-white shadow-md shadow-orange-950/10" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Buyer View
          </button>
          <button
            onClick={() => switchAccountMode("seller")}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isSellerViewActive 
                ? "bg-orange-600 text-white shadow-md shadow-orange-950/10" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Seller Portal
          </button>
        </div>

        {/* Sidebar Search Bar - Only in Buyer Mode */}
        {!isSellerViewActive && (
          <div className="mb-6">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Catalog Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search elegant items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-3.5 pr-8 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 focus:border-orange-500/60 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all"
              />
              <Menu size={12} className="absolute right-3 top-3.5 text-zinc-500" />
            </div>
          </div>
        )}

        {/* Navigation Menu Links */}
        <div className="flex-1 space-y-5">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Navigation
            </span>

            <div className="space-y-1">
              {!isSellerViewActive ? (
                /* Customer Navigation Link Set */
                <>
                  <button
                    onClick={() => {
                      setActiveCustomerTab("catalog");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeCustomerTab === "catalog"
                        ? "bg-zinc-900 text-orange-500 border border-zinc-800"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40"
                    }`}
                  >
                    <Home size={15} />
                    Catalog Collection
                  </button>

                  <button
                    onClick={() => {
                      setActiveCustomerTab("orders");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeCustomerTab === "orders"
                        ? "bg-zinc-900 text-orange-500 border border-zinc-800"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40"
                    }`}
                  >
                    <ClipboardList size={15} />
                    My Orders
                  </button>

                  <button
                    onClick={() => {
                      setCartOpen(true);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={15} />
                      <span>Shopping Bag</span>
                    </div>
                    {totalCartItems > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono min-w-[18px] text-center leading-none">
                        {totalCartItems}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                /* Seller Navigation Link Set */
                <>
                  <button
                    onClick={() => {
                      setActiveSellerTab("listings");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeSellerTab === "listings"
                        ? "bg-zinc-900 text-orange-500 border border-zinc-800"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40"
                    }`}
                  >
                    <Package size={15} />
                    My Products
                  </button>

                  <button
                    onClick={() => {
                      setActiveSellerTab("orders");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                      activeSellerTab === "orders"
                        ? "bg-zinc-900 text-orange-500 border border-zinc-800"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40"
                    }`}
                  >
                    <ClipboardList size={15} />
                    Incoming Orders
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wallet / Earnings Sidebar Footer Widget */}
        <div className="mt-auto pt-6 border-t border-zinc-900">
          {!isSellerViewActive ? (
            <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/30 rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                <Wallet size={12} />
                Wallet Earnings
              </div>
              <strong className="block text-xl font-bold font-mono text-emerald-300 mt-1.5">
                ₹{currentUser?.balance.toFixed(2)}
              </strong>
              <p className="text-[9px] text-zinc-500 mt-1">Automatic commissions from custom reseller margins.</p>
            </div>
          ) : (
            <div className="p-3.5 bg-orange-950/10 border border-orange-900/20 rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-wider font-semibold">
                <DollarSign size={12} />
                Store Revenue
              </div>
              <strong className="block text-xl font-bold font-mono text-orange-300 mt-1.5">
                ₹{currentUser?.balance.toFixed(2)}
              </strong>
              <p className="text-[9px] text-zinc-500 mt-1">Direct payout from product dispatches.</p>
            </div>
          )}
          
          {/* Sidebar Account Action Buttons (great for Mobile view) */}
          <div className="mt-4">
            {currentUser ? (
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setIsSellerViewActive(false);
                  setCart([]);
                  localStorage.removeItem("atelier_user");
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-zinc-900 hover:bg-rose-950/20 text-rose-400 hover:text-rose-350 border border-zinc-800 rounded-xl text-xs font-semibold tracking-wide transition-all"
              >
                <LogOut size={13} />
                Sign Out Account
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md shadow-orange-950/10 transition-all"
              >
                <LogIn size={13} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      
      {/* 1. Desktop Horizontal Header (visible on md screens & up) */}
      <div className="hidden md:block">
        <Header
          currentUser={currentUser}
          onOpenAuth={() => setAuthOpen(true)}
          onLogout={() => {
            setCurrentUser(null);
            setIsSellerViewActive(false);
            setCart([]);
            localStorage.removeItem("atelier_user");
          }}
          wishlistCount={wishlist.length}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setCartOpen(true)}
          onToggleSellerView={handleToggleSellerView}
          isSellerViewActive={isSellerViewActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* 2. Mobile Responsive Top Header Bar (only visible below md screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <Menu size={18} />
        </button>

        <span className="text-sm font-black tracking-widest text-zinc-100 uppercase">
          ATELIER.
        </span>

        <button
          onClick={() => setCartOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-xl relative"
        >
          <ShoppingCart size={18} />
          {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Slide-out Sidebar Panel */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop screen */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar Drawer container */}
          <div className="relative w-72 max-w-xs bg-zinc-950 border-r border-zinc-900 h-full p-5 flex flex-col z-10 animate-slide-in">
            {/* Close toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-5 right-5 p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg"
            >
              <X size={15} />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">

        {isSellerViewActive && currentUser ? (
          /* Render Active Seller Dashboard Component with activeTab synced */
          <SellerDashboard 
            currentUser={currentUser} 
            onRefreshUser={() => refreshProfile(currentUser.id)} 
            activeTab={activeSellerTab}
            setActiveTab={setActiveSellerTab}
            onRefreshProducts={fetchProducts}
          />
        ) : (
          /* Render Active Buyer Experience */
          <div className="pb-16">

            {/* Desktop-only Tab Switcher for Buyer */}
            <div className="hidden md:flex items-center justify-center border-b border-zinc-900 bg-zinc-950/40 py-3.5 px-4">
              <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850">
                <button
                  onClick={() => setActiveCustomerTab("catalog")}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
                    activeCustomerTab === "catalog"
                      ? "bg-orange-600 text-white shadow-md shadow-orange-950/10"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Home size={14} />
                  Catalog Collection
                </button>
                <button
                  onClick={() => setActiveCustomerTab("orders")}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
                    activeCustomerTab === "orders"
                      ? "bg-orange-600 text-white shadow-md shadow-orange-950/10"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <ClipboardList size={14} />
                  My Orders & Dispatches
                </button>
              </div>
            </div>

            {activeCustomerTab === "catalog" ? (
              <div className="space-y-8 animate-fade-in">
                {/* Curated Hero Banner Section */}
                <div className="relative w-full overflow-hidden bg-zinc-950 border-b border-zinc-900 pt-5 pb-16 sm:py-24">
                  {/* Backglow design */}
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[300px] h-[250px] bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

                  {/* Catalog Top Header & Search Bar (matches user images) */}
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900/60 pb-5 mb-8 md:mb-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                        Catalog Campaign
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full w-fit">
                        <Sparkles size={12} className="text-orange-500" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-bold">
                          Summer Collection '26
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:hidden">
                      <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                        Catalog Search
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search elegant items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full py-2 pl-3.5 pr-8 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 focus:border-orange-500/60 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all"
                        />
                        <Menu size={12} className="absolute right-3 top-3.5 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    
                    {/* Banner Copy */}
                    <div className="md:col-span-7 space-y-6">
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 font-sans leading-[1.1]">
                        Curated Everyday <br />
                        <span className="text-orange-500">Boutique Objects.</span>
                      </h1>

                      <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                        Celebrating simplicity, premium materials, and honest utility. Meticulously designed accessories and smart tech units crafted with quality care.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button 
                          onClick={() => {
                            const target = document.getElementById("collection-section");
                            target?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          Explore Collection
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Banner Hero Graphics */}
                    <div className="md:col-span-5 hidden md:block">
                      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-850 shadow-2xl">
                        <img 
                          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80" 
                          alt="Premium boutique shelf" 
                          className="w-full h-full object-cover brightness-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                          <div>
                            <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">Atelier Atelier</span>
                            <p className="text-xs text-zinc-300 mt-1">Premium silk sarees, bespoke decor, and tech accessories curated directly from authentic craftsmen.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Catalog Grid Area */}
                <div id="collection-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
                  
                  {/* Header Filter info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Complete Collection</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Browse our premium catalog. Resellers can copy descriptions, customize margin additions, and earn commissions.</p>
                    </div>

                    {/* Category Pills Slider */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border ${
                            selectedCategory.toUpperCase() === cat.toUpperCase()
                              ? "bg-orange-600 text-white border-orange-500 shadow"
                              : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Products Rendering */}
                  {products.length === 0 ? (
                    <div className="p-16 border border-zinc-900 border-dashed rounded-3xl text-center space-y-4">
                      <Package size={36} className="text-zinc-600 mx-auto" />
                      <h3 className="text-sm font-semibold text-zinc-300">No matching items found</h3>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">Try refining your search terms or choosing a different category tab.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                      {products.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onAddToCart={handleAddToCart}
                          isWishlisted={wishlist.includes(prod.id)}
                          onToggleWishlist={handleToggleWishlist}
                          isResellerMode={isResellerMode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Past Orders History Tab for customers rendered as its own dedicated Page */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
                <div className="border-b border-zinc-900 pb-5">
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                    <ClipboardList className="text-orange-500" />
                    My Dispatches & Orders
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Track customer parcel delivery status and total earnings collected for custom reseller bookings.</p>
                </div>

                {loadingOrders ? (
                  <div className="py-20 text-center">
                    <p className="text-xs text-zinc-500 font-mono animate-pulse">Retrieving secure dispatch reports...</p>
                  </div>
                ) : pastOrders.length === 0 ? (
                  <div className="p-16 border border-zinc-900 border-dashed rounded-3xl text-center space-y-4 max-w-lg mx-auto">
                    <ShoppingBag size={40} className="text-zinc-700 mx-auto" />
                    <h4 className="text-sm font-semibold text-zinc-300">No Orders Placed Yet</h4>
                    <p className="text-xs text-zinc-500">Add products to your shopping bag, apply your profit margin, and place your first dispatch booking to view your tracking history here.</p>
                    <button
                      onClick={() => setActiveCustomerTab("catalog")}
                      className="mt-2 py-2 px-4 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-orange-400 rounded-xl hover:bg-zinc-800 transition"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastOrders.map((ord) => (
                      <div key={ord.id} className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 hover:border-zinc-800 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                            <div>
                              <span className="text-xs font-mono font-bold text-zinc-300">{ord.id}</span>
                              <span className="block text-[10px] text-zinc-500 mt-0.5">{ord.orderDate}</span>
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${
                              ord.status === "delivered"
                                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                                : ord.status === "shipped"
                                ? "bg-blue-950/20 border-blue-900/40 text-blue-400"
                                : "bg-amber-950/20 border-amber-900/40 text-amber-400"
                            }`}>
                              ● {ord.status}
                            </span>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-3 mt-4">
                            {ord.items.map((it, index) => (
                              <div key={index} className="flex gap-3 items-center">
                                <img src={it.product.image} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-900" />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-zinc-200 truncate">{it.product.name}</h5>
                                  <span className="block text-[10px] text-zinc-500 mt-0.5">Qty: {it.quantity} | Margin profit: <span className="text-emerald-400 font-mono font-semibold">₹{it.marginProfit}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-sans">
                          <span className="flex flex-col">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Earnings Earned</span>
                            <strong className="text-sm text-emerald-400 font-mono font-bold mt-0.5">₹{ord.profitMarginTotal.toFixed(2)}</strong>
                          </span>
                          <span className="flex flex-col items-end">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Collected</span>
                            <strong className="text-sm text-zinc-200 font-mono font-bold mt-0.5">₹{ord.grandTotal.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Area */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <div>
              <span className="text-sm font-bold text-zinc-100 tracking-wider">ATELIER.</span>
              <span className="block text-[8px] font-mono text-zinc-500 uppercase">Premium Reseller Network</span>
            </div>
          </div>
          
          <p className="text-[11px] text-zinc-500 text-center md:text-right">
            © 2026 Atelier Ltd. Built with high-fidelity MERN stack specifications. Guaranteed margin dispersals.
          </p>
        </div>
      </footer>

      {/* OVERLAY & MODAL SHEETS CONTROLS */}

      {/* Cart Slider Drawer Overlay */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onUpdateMargin={handleUpdateCartMargin}
        onRemoveItem={handleRemoveFromCart}
        isResellerMode={isResellerMode}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Multi-step Secure Checkout Overlay */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        currentUser={currentUser}
        isResellerMode={isResellerMode}
        onOrderPlaced={handleOrderPlacedSuccess}
      />

      {/* User Authentication & Onboarding Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem("atelier_user", JSON.stringify(user));
          setAuthOpen(false);
          refreshProfile(user.id);
        }}
      />

    </div>
  );
}
