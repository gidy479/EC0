import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import API_BASE_URL from '../config/apiConfig';

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
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">Secure Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary & Wallet */}
                <div className="space-y-8">
                    <div className="glass p-6 rounded-3xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Cart Summary</h3>
                        
                        <div className="max-h-48 overflow-y-auto pr-2 mb-4 space-y-3">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    {item.product.images?.[0] ? (
                                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                    )}
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800 text-sm truncate">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-700 text-sm">GH₵{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-lg font-black text-green-800 pt-4 border-t border-gray-100">
                            <span>Total</span>
                            <span>GH₵{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="glass-dark bg-gradient-to-br from-green-800 to-teal-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Trust Wallet Balance
                        </h3>
                        <p className="text-4xl font-black mb-4 relative z-10">GH₵{wallet?.balance?.toFixed(2) || '0.00'}</p>

                        {!canAfford && (
                            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-red-100 text-sm relative z-10">
                                <p className="font-bold">Insufficient Funds</p>
                                <p>Please add funds to your wallet from the Dashboard.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Details Form */}
                <div className="glass p-8 rounded-3xl shadow-lg relative h-fit">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200/50 pb-3">Delivery Details</h3>
                    <form onSubmit={handleConfirmPurchase} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Street Address</label>
                            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all" placeholder="123 Eco Street" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">City / Region</label>
                            <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all" placeholder="Accra" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number</label>
                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all" placeholder="+233 24 000 0000" />
                        </div>

                        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">{error}</div>}

                        <button
                            type="submit"
                            disabled={purchasing || !canAfford}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center ${purchasing || !canAfford ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:-translate-y-1'}`}
                        >
                            {purchasing ? 'Processing...' : `Pay GH₵${cartTotal.toFixed(2)} using Escrow`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
