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
import { CartProvider, CartContext } from './context/CartContext';

function Navbar() {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="glass-dark sticky top-0 z-[60] mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 md:px-8">
        <Link to="/" className="text-2xl font-extrabold tracking-tighter flex items-center gap-2 group z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-gradient-to-br from-green-400 to-teal-400 text-gray-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          EcoMarket<span className="text-green-400">Plus</span>
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
                <Link to="/add-product" className="text-gray-300 hover:text-white font-medium transition px-3 py-2 rounded-lg hover:bg-white/10">Add Product</Link>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl animate-fade-in flex flex-col pt-24 px-6 space-y-4">
          <Link to="/" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              {user.role === 'Seller' && (
                <Link to="/add-product" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Add Product</Link>
              )}
              <Link to="/reports" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Reports</Link>
              <Link to="/profile" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className="text-2xl font-bold text-red-500 border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-2xl font-bold text-white border-b border-white/10 pb-4" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
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
