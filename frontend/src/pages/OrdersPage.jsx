import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/apiConfig';
import { getSafeImageUrl } from '../utils/imageUtils';


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
        <div className="max-w-5xl mx-auto px-4 sm:px-0 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">My Orders</h2>

            {orders.length === 0 ? (
                <div className="glass p-8 md:p-12 rounded-3xl text-center shadow-sm border border-white/40">
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <h3 className="text-lg md:text-xl font-black text-gray-700 mb-2">No Active Orders</h3>
                    <p className="text-sm text-gray-500">You haven't purchased anything yet. Head over to the marketplace!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map(order => (
                        <div key={order._id} className="glass p-5 md:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group border border-white/40">
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-green-50/50 to-transparent pointer-events-none"></div>

                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-2xl overflow-hidden self-center sm:self-start border border-gray-100 shadow-inner">
                                {order.product?.images?.[0] ? (
                                    <img src={getSafeImageUrl(order.product.images[0])} alt={order.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100"></div>
                                )}
                            </div>


                            <div className="flex-grow flex flex-col justify-center relative z-10">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-3">
                                    <div>
                                        <h3 className="text-base md:text-lg font-black text-gray-800 leading-tight">{order.product?.name || 'Product'}</h3>
                                        <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1">Order #{order._id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="w-fit">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border ${order.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                                order.trackingStatus === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-orange-100 text-orange-800 border-orange-200'
                                            }`}>
                                            {order.trackingStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-[11px] md:text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-black uppercase tracking-tighter">Qty</span>
                                        <span className="font-black text-gray-900">{order.quantity}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-black uppercase tracking-tighter">Total</span>
                                        <span className="font-black text-green-700">GH₵{order.totalCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-black uppercase tracking-tighter">Merchant</span>
                                        <span className="font-black text-gray-600 truncate">{order.seller?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 font-black uppercase tracking-tighter">Payment Status</span>
                                        <span className={`font-black uppercase truncate ${order.transaction?.status === 'disputed' ? 'text-red-600' : 'text-blue-700'}`}>
                                            {order.transaction?.status === 'escrow_held' ? 'Payment Secured' :
                                             order.transaction?.status === 'released_to_seller' ? 'Payment Finalized' :
                                             order.transaction?.status === 'disputed' ? 'In Dispute' :
                                             order.transaction?.status === 'refunded' ? 'Refunded' :
                                             (order.transaction?.status ? order.transaction.status.replace('_', ' ') : 'Processing')}
                                        </span>
                                    </div>
                                </div>

                                {order.transaction?.status === 'escrow_held' && (
                                    <div className="mt-6 pt-4 border-t border-gray-100/50 flex justify-end">
                                        <button onClick={() => disputeOrderHandler(order._id)} className="w-full sm:w-auto text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-tighter transition active:scale-95">
                                            Dispute Order
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
