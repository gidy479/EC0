import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import API_BASE_URL from '../config/apiConfig';
import { getSafeImageUrl } from '../utils/imageUtils';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);

    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState('');

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        const fetchWallet = async () => {
            try {
                const walRes = await fetch(`${API_BASE_URL}/api/wallet`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const walData = await walRes.json();
                if (walRes.ok) setWallet(walData);
            } catch (err) {
                console.error("Failed to fetch wallet", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, [user, navigate, cartItems]);

    const handleConfirmPurchase = async (e) => {
        e.preventDefault();
        setPurchasing(true);
        setError('');

        try {
            // Process each item in the cart sequentially
            for (const item of cartItems) {
                const res = await fetch(`${API_BASE_URL}/api/wallet/purchase/${item.product._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        quantity: item.quantity,
                        address,
                        city,
                        phone
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || `Failed to purchase ${item.product.name}`);
                }
            }

            clearCart();
            alert('Purchase successful! Orders placed.');
            navigate('/orders');
        } catch (err) {
            setError(err.message || 'An error occurred during purchase.');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading checkout...</div>;

    const canAfford = wallet && wallet.balance >= cartTotal;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">Secure Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary & Wallet */}
                <div className="space-y-6 md:space-y-8 order-2 md:order-1">
                    <div className="glass p-5 md:p-6 rounded-3xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 uppercase tracking-wider text-xs">Cart Summary</h3>
                        
                        <div className="max-h-48 overflow-y-auto pr-2 mb-4 space-y-3">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    {item.product.images?.[0] ? (
                                        <img src={getSafeImageUrl(item.product.images[0])} alt={item.product.name} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl"></div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-gray-800 text-xs md:text-sm truncate">{item.product.name}</p>
                                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-gray-700 text-xs md:text-sm whitespace-nowrap">GH₵{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-lg md:text-xl font-black text-green-800 pt-4 border-t border-gray-100">
                            <span className="text-sm uppercase tracking-widest text-gray-500 font-bold">Total</span>
                            <span>GH₵{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="glass-dark bg-gradient-to-br from-green-800 to-teal-900 p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                        <h3 className="text-sm md:text-lg font-bold mb-2 relative z-10 flex items-center opacity-80">
                            <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Wallet Balance
                        </h3>
                        <p className="text-3xl md:text-4xl font-black mb-4 relative z-10">GH₵{wallet?.balance?.toFixed(2) || '0.00'}</p>

                        {!canAfford && (
                            <div className="bg-red-500/30 backdrop-blur-md border border-red-500/50 p-4 rounded-xl text-red-50 text-xs relative z-10 animate-pulse">
                                <p className="font-bold mb-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Insufficient Funds
                                </p>
                                <p>Please add funds to your wallet from the Dashboard to complete this purchase.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Details Form */}
                <div className="glass p-6 md:p-8 rounded-3xl shadow-lg relative h-fit order-1 md:order-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-6 border-b border-gray-200/50 pb-3 uppercase tracking-wider">Delivery</h3>
                    <form onSubmit={handleConfirmPurchase} className="space-y-4 md:space-y-5">
                        <div>
                            <label className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Street Address</label>
                            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-green-400 focus:bg-white focus:border-transparent outline-none transition-all shadow-sm" placeholder="e.g. 12 Eco Avenue, East Legon" />
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-2">City / Region</label>
                            <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-green-400 focus:bg-white focus:border-transparent outline-none transition-all shadow-sm" placeholder="e.g. Accra" />
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-green-400 focus:bg-white focus:border-transparent outline-none transition-all shadow-sm" placeholder="+233 XX XXX XXXX" />
                        </div>

                        {error && <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-bold animate-shake">{error}</div>}

                        <button
                            type="submit"
                            disabled={purchasing || !canAfford || cartItems.length === 0}
                            className={`w-full mt-4 py-4 md:py-5 rounded-2xl font-black text-white text-base md:text-lg shadow-xl transition-all flex items-center justify-center transform active:scale-95 ${purchasing || !canAfford || cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed grayscale' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:-translate-y-1 shadow-green-500/20'}`}
                        >
                            {purchasing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </span>
                            ) : `Pay GH₵${cartTotal.toFixed(2)} Securely`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
