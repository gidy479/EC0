import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/apiConfig';

const OrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

        const disputeOrderHandler = async (orderId) => {
        const reason = window.prompt("Please provide a reason for disputing this order:");
        if (!reason) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/wallet/dispute/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Order has been disputed. Funds are frozen until Admin resolution.");
                setOrders(orders.map(o => o._id === orderId ? { ...o, transaction: { ...o.transaction, status: 'disputed' } } : o));
            } else {
                alert(data.message || 'Failed to file dispute');
            }
        } catch (error) {
            alert('Error filing dispute');
        }
    };

    if (!user) return <div className="text-center py-20 text-gray-500">Please login to view orders.</div>;
    if (loading) return <div className="text-center py-20 text-gray-500">Loading your orders...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">My Orders</h2>

            {orders.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Orders</h3>
                    <p className="text-gray-500">You haven't purchased anything yet. Head to the marketplace to explore sustainable goods!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="glass p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-50/50 to-transparent pointer-events-none"></div>

                            <div className="w-24 h-24 flex-shrink-0 bg-white rounded-2xl overflow-hidden self-center border border-gray-100 shadow-inner">
                                {order.product?.images?.[0] ? (
                                    <img src={order.product.images[0]} alt={order.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100"></div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-center">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{order.product?.name || 'Product Unavailable'}</h3>
                                        <p className="text-sm text-gray-500 tracking-wide mt-1">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border ${order.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                                order.trackingStatus === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-orange-100 text-orange-800 border-orange-200'
                                            }`}>
                                            {order.trackingStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                                    <p><span className="text-gray-500 font-medium">Quantity:</span> <span className="font-bold text-gray-800">{order.quantity}</span></p>
                                    <p><span className="text-gray-500 font-medium">Total Paid:</span> <span className="font-bold text-green-700">GH₵{order.totalCost.toFixed(2)}</span></p>
                                    <p><span className="text-gray-500 font-medium">Seller:</span> <span className="font-bold text-gray-800">{order.seller?.name || 'Unknown'}</span></p>
                                    <p><span className="text-gray-500 font-medium">Escrow Status:</span> <span className={`font-bold uppercase ${order.transaction?.status === 'disputed' ? 'text-red-600' : 'text-blue-700'}`}>{order.transaction?.status?.replace('_', ' ') || 'UNKNOWN'}</span></p>
                                </div>
                                {order.transaction?.status === 'escrow_held' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button onClick={() => disputeOrderHandler(order._id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-sm transition">
                                            Dispute & Freeze Funds
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
