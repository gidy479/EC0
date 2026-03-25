import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getSafeImageUrl } from '../utils/imageUtils';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/checkout'); // We'll update CheckoutPage to handle cart
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center animate-fade-in-up">
                <div className="bg-white/50 backdrop-blur-md p-12 rounded-3xl shadow-sm border border-gray-100">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/" className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-fade-in-up flex flex-col lg:flex-row gap-8">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">
                        Shopping Cart
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">{cartCount} Items</span>
                </div>

                <div className="space-y-4 md:space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.product._id} className="glass p-4 rounded-2xl flex flex-row gap-4 md:gap-6 shadow-sm border border-white/40">
                            {/* Product Image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-xl overflow-hidden self-center sm:self-start">
                                {item.product.images && item.product.images.length > 0 ? (
                                    <img src={getSafeImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="max-w-[150px] sm:max-w-none">
                                        <Link to={`/product/${item.product._id}`} className="text-sm md:text-lg font-bold text-gray-800 hover:text-green-600 transition truncate block">
                                            {item.product.name}
                                        </Link>
                                        <p className="text-[10px] md:text-sm text-gray-500 mt-1">Sold by {item.product.seller?.name || 'Seller'}</p>
                                    </div>
                                    <span className="font-black text-sm md:text-xl text-teal-700 whitespace-nowrap">GH₵{item.product.price.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition text-sm"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="font-bold w-4 md:w-6 text-center text-sm">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.product._id)}
                                        className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium transition flex items-center gap-1"
                                    >
                                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        <span className="hidden xs:inline">Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Clear Cart */}
                <div className="mt-6 text-right">
                    <button onClick={clearCart} className="text-xs font-medium text-gray-500 hover:text-red-500 transition">
                        Clear Cart
                    </button>
                </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96 flex-shrink-0">
                <div className="glass p-6 md:p-8 rounded-3xl shadow-lg border border-white/50 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Subtotal ({cartCount} items)</span>
                            <span className="font-semibold text-gray-900">GH₵{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-[10px] md:text-sm italic">
                            <span>Shipping estimate</span>
                            <span className="font-medium text-gray-400">Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total</span>
                            <span className="text-2xl font-black text-teal-700">GH₵{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-1 transition transform active:scale-95"
                    >
                        Proceed to Checkout
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Secure Escrow Payment
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
