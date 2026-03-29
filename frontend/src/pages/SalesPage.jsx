import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/apiConfig';
import { getSafeImageUrl } from '../utils/imageUtils';

const SalesPage = () => {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/orders/seller`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) setSales(data);
            } catch (error) {
                console.error("Failed to fetch sales", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'Seller') fetchSales();
    }, [user]);

    const updateTrackingHandler = async (orderId, status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/tracking`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ trackingStatus: status })
            });

            if (res.ok) {
                setSales(sales.map(s => s._id === orderId ? { ...s, trackingStatus: status } : s));
            } else {
                alert('Failed to update tracking status');
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    if (!user || user.role !== 'Seller') return <div className="text-center py-20 text-gray-500">Access Denied. Only Sellers can view this page.</div>;
    if (loading) return <div className="text-center py-20 text-gray-500">Loading your sales...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-0 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-8 pb-4 border-b border-gray-200/50">Incoming Orders</h2>

            {sales.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center shadow-sm border border-white/40">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="text-xl font-black text-gray-700 mb-2">No Sales Yet</h3>
                    <p className="text-sm text-gray-500">List more products to start receiving orders!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sales.map(order => (
                        <div key={order._id} className="glass p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden group border border-white/40">
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>

                            <div className="w-24 h-24 flex-shrink-0 bg-white rounded-2xl overflow-hidden self-center md:self-start border border-gray-100 shadow-inner flex items-center justify-center">
                                {order.product?.images?.[0] ? (
                                    <img 
                                        src={getSafeImageUrl(order.product.images[0])} 
                                        alt={order.product.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = 'https://placehold.co/200x200?text=EcoMarket';
                                            e.target.className = "w-1/2 h-1/2 object-contain opacity-20";
                                        }}
                                    />
                                ) : (
                                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                            </div>

                            <div className="flex-grow space-y-4 relative z-10">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-800 leading-tight">
                                            {order.product?.name || <span className="text-gray-400 italic font-medium">Deleted Product</span>}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border mb-2 ${
                                            order.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                            order.trackingStatus === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            'bg-orange-100 text-orange-800 border-orange-200'
                                        }`}>
                                            {order.trackingStatus}
                                        </span>
                                        <span className="text-xl font-black text-teal-700">GH₵{order.totalCost.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Buyer Information</h4>
                                        <p className="font-bold text-sm text-gray-900">{order.buyer?.name}</p>
                                        <p className="text-xs text-gray-600">{order.buyer?.email}</p>
                                    </div>
                                    <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                                        <p className="text-xs text-gray-800 font-medium">{order.deliveryDetails?.address}, {order.deliveryDetails?.city}</p>
                                        <p className="text-xs text-gray-500 font-bold mt-1">📞 {order.deliveryDetails?.phone}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100/50 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 tracking-wider">PAYMENT STATUS</span>
                                        <span className={`text-xs font-black uppercase ${order.transaction?.status === 'disputed' ? 'text-red-600' : 'text-blue-700'}`}>
                                            {order.transaction?.status === 'escrow_held' ? 'Payment Secured (Escrow)' :
                                             order.transaction?.status === 'released_to_seller' ? 'Payment Completed' :
                                             order.transaction?.status === 'disputed' ? 'In Dispute' :
                                             order.transaction?.status === 'refunded' ? 'Refunded' :
                                             'Processing'}
                                        </span>
                                    </div>

                                    {order.trackingStatus !== 'Delivered' && (
                                        <div className="flex gap-2">
                                            {order.trackingStatus === 'Processing' && (
                                                <button 
                                                    onClick={() => updateTrackingHandler(order._id, 'Shipped')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition shadow-lg shadow-blue-500/20 active:scale-95"
                                                >
                                                    Mark as Shipped
                                                </button>
                                            )}
                                            {order.trackingStatus === 'Shipped' && (
                                                <button 
                                                    onClick={() => updateTrackingHandler(order._id, 'Delivered')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition shadow-lg shadow-green-500/20 active:scale-95"
                                                >
                                                    Confirm Delivery
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalesPage;
