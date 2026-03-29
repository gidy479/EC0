import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useState, useContext } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ReportsDashboard from './pages/ReportsDashboard';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import SalesPage from './pages/SalesPage';
import { CartProvider, CartContext } from './context/CartContext';

function Navbar() {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
    <header className="glass-dark sticky top-0 z-[60] mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 md:px-8">
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2.5 group z-50 transition active:scale-95" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/favicon.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300 border border-white/20" />
          <span className="text-white drop-shadow-sm">EcoMarket<span className="text-green-400">Plus</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-2 md:space-x-4">
          <Link to="/cart" className="relative text-gray-300 hover:text-white transition px-3 py-2 flex items-center group">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-teal-500 rounded-full shadow-sm shadow-teal-500/50">{cartCount}</span>
            )}
          </Link>
          <Link to="/" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Marketplace</Link>
          {user ? (
            <>
              {user.role === 'Seller' && (
                <>
                  <Link to="/add-product" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Add Product</Link>
                  <Link to="/sales" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">My Sales</Link>
                </>
              )}
              <Link to="/reports" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Reports</Link>
              <Link to="/profile" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Profile</Link>
              <Link to="/dashboard" className="ml-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl hover:from-green-600 hover:to-teal-600 font-bold transition shadow-lg border border-white/10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Dashboard
              </Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 font-bold transition px-4 py-2 rounded-lg hover:bg-red-500/20 border border-red-500/30 bg-red-500/10 ml-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Admin</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Login</Link>
              <Link to="/register" className="ml-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 font-bold transition shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20">
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <Link to="/cart" className="relative text-gray-300 transition p-2" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-teal-500 rounded-full shadow-sm shadow-teal-500/50">{cartCount}</span>
            )}
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white p-2 z-50"
          >
            {isMobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Side Drawer & Backdrop (Moved outside the <header> tag for full-viewport coverage) */}
    <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop overlay - darkens the rest of the page */}
      <div 
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* The Actual Side Drawer */}
      <div 
        className={`absolute right-0 top-0 h-full w-80 glass-dark shadow-[-20px_0_50px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-white/10 overflow-y-auto`}
      >
        {/* Menu Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Logo" className="w-6 h-6 rounded-lg" />
            <span className="text-lg font-black text-white">EcoMarket<span className="text-green-400">Plus</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all active:scale-90"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col p-6 space-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2 font-bold">Navigation</span>
          
          <Link to="/" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            Marketplace
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                Dashboard
              </Link>
              {user.role === 'Seller' && (
                <>
                  <Link to="/add-product" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    Add Product
                  </Link>
                  <Link to="/sales" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    My Sales
                  </Link>
                </>
              )}
              <Link to="/reports" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                 <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                Reports
              </Link>
              <Link to="/profile" className="flex items-center gap-3 text-lg font-bold text-white p-3 rounded-2xl hover:bg-white/5 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                Profile
              </Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className="flex items-center gap-3 text-lg font-bold text-red-400 p-3 rounded-2xl hover:bg-red-500/10 transition-colors group mt-4 border border-red-500/20 bg-red-500/5 shadow-inner" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <div className="space-y-3 pt-6 border-t border-white/5 mt-4">
              <Link to="/login" className="flex items-center justify-center w-full py-4 text-white font-bold bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="flex items-center justify-center w-full py-4 text-gray-900 font-bold bg-green-400 hover:bg-green-500 rounded-2xl transition-all shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>Register Now</Link>
            </div>
          )}
        </div>
        
        <div className="mt-auto p-8 text-center text-xs text-gray-500 font-medium border-t border-white/5">
          &copy; {new Date().getFullYear()} EcoMarketPlus.<br/>Verified sustainable commerce.
        </div>
      </div>
    </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col font-sans text-gray-800 selection:bg-green-200 selection:text-green-900 overflow-x-hidden relative">
          {/* Global decorative backdrop elements */}
          <div className="fixed inset-0 z-[-1] pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-300/20 rounded-full blur-[120px]"></div>
          </div>

          <Navbar />

          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pb-12 z-10">
            <Routes>
              <Route path="/" element={<MarketplacePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-product" element={<AddProductPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/sales" element={<SalesPage />} />
            </Routes>
          </main>

          <footer className="glass-dark border-t border-white/10 text-center py-8 mt-auto relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-400 to-teal-400 w-6 h-6 rounded-lg flex items-center justify-center opacity-80">
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="font-bold tracking-tight text-white opacity-90">EcoMarket<span className="text-green-400">Plus</span></span>
              </div>
              <p className="text-sm font-medium text-gray-400">&copy; {new Date().getFullYear()} EcoMarketPlus. Trust through AI Verification.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><span className="sr-only">GitHub</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
