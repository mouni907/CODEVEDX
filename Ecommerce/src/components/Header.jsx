import React, { useState } from "react";
import { Search, Heart, ShoppingBag, User, LogOut, Store, LayoutDashboard, Wallet, UserCheck } from "lucide-react";

export default function Header({
  currentUser,
  onOpenAuth,
  onLogout,
  wishlistCount,
  cartCount,
  onOpenCart,
  onToggleSellerView,
  isSellerViewActive,
  searchQuery,
  setSearchQuery,
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-900 shadow-xl backdrop-blur-md/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => {
              if (isSellerViewActive) onToggleSellerView();
            }}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-orange-950/20 group-hover:scale-105 transition-all">
              A
            </div>
            <div>
              <span className="text-lg font-bold font-sans text-zinc-100 tracking-wider">
                ATELIER<span className="text-orange-500">.</span>
              </span>
              <span className="block text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-widest leading-none">
                CURATED
              </span>
            </div>
          </div>

          {/* Search Catalog - Only show if not in Seller Dashboard view */}
          {!isSellerViewActive ? (
            <div className="flex-1 max-w-md mx-auto hidden md:block">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search elegant apparel, decor, tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-zinc-900 hover:bg-zinc-850/80 border border-zinc-800 rounded-full text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:bg-zinc-900 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-md mx-auto hidden md:flex items-center justify-center">
              <span className="text-xs font-mono px-3 py-1.5 bg-orange-950/20 border border-orange-900/30 rounded-full text-orange-400 font-semibold uppercase tracking-wider">
                🛡️ SELLER WORKSPACE ACTIVE
              </span>
            </div>
          )}

          {/* Actions & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Seller Portal Toggle Switcher */}
            {currentUser && (
              <button
                onClick={onToggleSellerView}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition border ${
                  isSellerViewActive
                    ? "bg-zinc-900 hover:bg-zinc-800 text-orange-400 border-zinc-800"
                    : currentUser.role === "seller"
                    ? "bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-950/20"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-850"
                }`}
              >
                {isSellerViewActive ? (
                  <>
                    <ShoppingBag size={14} />
                    Buyer Mode
                  </>
                ) : (
                  <>
                    {currentUser.role === "seller" ? (
                      <>
                        <LayoutDashboard size={14} />
                        Seller Portal
                      </>
                    ) : (
                      <>
                        <Store size={14} />
                        Become Seller
                      </>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Wishlist Icon */}
            {!isSellerViewActive && (
              <button 
                className="relative p-2.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-full transition"
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-zinc-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Bag / Cart Icon */}
            {!isSellerViewActive && (
              <button 
                onClick={onOpenCart}
                className="relative p-2.5 text-zinc-400 hover:text-orange-400 hover:bg-zinc-900 rounded-full transition"
                title="Shopping Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-zinc-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

            {/* Profile Dropdown or Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 hover:bg-zinc-900 border border-zinc-850 rounded-full transition"
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-sm">
                    {currentUser.name[0]}
                  </div>
                  <span className="text-xs font-medium text-zinc-300 hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {showProfileDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50">
                      {/* User Brief */}
                      <div className="pb-3 border-b border-zinc-900 mb-3">
                        <p className="text-sm font-semibold text-zinc-100">{currentUser.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
                        
                        <div className="flex items-center gap-1.5 mt-2.5 px-2 py-1 bg-zinc-900 border border-zinc-850 rounded-lg">
                          <UserCheck size={12} className="text-orange-500" />
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400">
                            {currentUser.role === "seller" ? "⭐ Approved Seller" : "Reseller Account"}
                          </span>
                        </div>
                      </div>

                      {/* Earnings / Balance Wallet (Meesho style) */}
                      <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-xl mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet size={16} className="text-emerald-500" />
                          <span className="text-xs font-medium text-zinc-300">
                            {currentUser.role === "seller" ? "Seller Balance" : "Wallet Earnings"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">
                          ₹{currentUser.balance.toFixed(2)}
                        </span>
                      </div>

                      {/* Dropdown Items */}
                      <div className="space-y-1">
                        {currentUser.role === "seller" && (
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (!isSellerViewActive) onToggleSellerView();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition"
                          >
                            <LayoutDashboard size={14} />
                            Go to Seller Panel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-350 hover:bg-rose-950/20 rounded-xl transition text-left"
                        >
                          <LogOut size={14} />
                          Sign Out Account
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-full text-xs tracking-wide shadow-md shadow-orange-950/10 active:scale-95 transition-all"
              >
                <User size={14} />
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
