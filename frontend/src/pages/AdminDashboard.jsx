import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Users
                if (activeTab === 'users') {
                    const res = await fetch('http://localhost:5000/api/admin/users', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    const data = await res.json();
                    if (res.ok) setUsers(data);
                }
                
                // Fetch Products
                if (activeTab === 'products') {
                    const res = await fetch('http://localhost:5000/api/admin/products', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    const data = await res.json();
                    if (res.ok) setProducts(data);
                }

                // Fetch Orders/Disputes
                if (activeTab === 'disputes') {
                    const res = await fetch('http://localhost:5000/api/admin/orders', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    const data = await res.json();
                    if (res.ok) setOrders(data);
                }
            } catch (error) {
                console.error('Admin fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, activeTab]);

    const deleteUserHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    setUsers(users.filter(u => u._id !== id));
                }
            } catch (error) {
                alert('Error deleting user');
            }
        }
    };

    const verifyProductHandler = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/products/${id}/verify`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ status })
            });
            const updated = await res.json();
            if (res.ok) {
                setProducts(products.map(p => p._id === id ? updated : p));
            }
        } catch (error) {
            alert('Error updating product status');
        }
    };

    const resolveDisputeHandler = async (orderId, resolution) => {
        try {
            const res = await fetch(`http://localhost:5000/api/wallet/resolve/${orderId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ resolution })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Dispute resolved: ${resolution}`);
                // Refresh orders
                const updatedRes = await fetch('http://localhost:5000/api/admin/orders', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const updatedOrders = await updatedRes.json();
                setOrders(updatedOrders);
            } else {
                alert(data.message || 'Error resolving dispute');
            }
        } catch (error) {
            alert('Failed to resolve dispute');
        }
    };

    const updateTrackingHandler = async (orderId, trackingStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/tracking`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ trackingStatus })
            });
            if (res.ok) {
                // Refresh orders
                const updatedRes = await fetch('http://localhost:5000/api/admin/orders', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const updatedOrders = await updatedRes.json();
                setOrders(updatedOrders);
            } else {
                alert('Error updating tracking status');
            }
        } catch (error) {
            alert('Failed to update tracking');
        }
    };

    if (!user || user.role !== 'Admin') return null;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200/50 pb-4">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-orange-600">Admin Control Panel</h2>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-8 py-3 rounded-xl font-bold shadow-sm transition transform hover:-translate-y-0.5 ${activeTab === 'users' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    Manage Users
                </button>
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`px-8 py-3 rounded-xl font-bold shadow-sm transition transform hover:-translate-y-0.5 ${activeTab === 'products' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    Moderate Products
                </button>
                <button 
                    onClick={() => setActiveTab('disputes')}
                    className={`px-8 py-3 rounded-xl font-bold shadow-sm transition transform hover:-translate-y-0.5 ${activeTab === 'disputes' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    Escrow & Disputes
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading data...</div>
            ) : (
                <div className="glass p-8 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

                    {activeTab === 'users' && (
                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200/50">
                                        <th className="py-4 px-4 font-bold text-gray-700">ID</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">NAME</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">EMAIL</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">ROLE</th>
                                        <th className="py-4 px-4 font-bold text-gray-700 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-gray-100 hover:bg-white/40 transition">
                                            <td className="py-4 px-4 text-sm text-gray-500 font-mono">{u._id}</td>
                                            <td className="py-4 px-4 font-bold text-gray-800">{u.name}</td>
                                            <td className="py-4 px-4 text-gray-600">{u.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.role === 'Admin' ? 'bg-red-100 text-red-800' : u.role === 'Seller' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button onClick={() => deleteUserHandler(u._id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-sm transition">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200/50">
                                        <th className="py-4 px-4 font-bold text-gray-700">PRODUCT</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">PRICE</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">SELLER</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">STATUS</th>
                                        <th className="py-4 px-4 font-bold text-gray-700 text-center">OVERRIDE ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} className="border-b border-gray-100 hover:bg-white/40 transition">
                                            <td className="py-4 px-4 font-bold text-gray-800">
                                                {p.name}
                                                <div className="text-xs text-gray-500 font-normal truncate w-48">{p.description}</div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-800 font-bold">GH₵{p.price.toFixed(2)}</td>
                                            <td className="py-4 px-4 text-gray-600">{p.seller?.name || 'Unknown'}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : p.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {p.verificationStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => verifyProductHandler(p._id, 'verified')} className="text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold text-xs transition border border-green-200">
                                                        Accept
                                                    </button>
                                                    <button onClick={() => verifyProductHandler(p._id, 'rejected')} className="text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs transition border border-red-200">
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'disputes' && (
                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200/50">
                                        <th className="py-4 px-4 font-bold text-gray-700">ORDER / REASON</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">AMOUNT</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">PARTIES</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">TRACKING</th>
                                        <th className="py-4 px-4 font-bold text-gray-700">ESCROW STATUS</th>
                                        <th className="py-4 px-4 font-bold text-gray-700 text-center">RESOLUTION & TRACKING</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id} className="border-b border-gray-100 hover:bg-white/40 transition">
                                            <td className="py-4 px-4 font-bold text-gray-800">
                                                Order #{o._id.substring(0, 8).toUpperCase()}
                                                {o.transaction?.disputeReason && (
                                                    <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                                        <span className="font-bold">Reason:</span> {o.transaction.disputeReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-800 font-bold">GH₵{o.totalCost.toFixed(2)}</td>
                                            <td className="py-4 px-4 text-xs">
                                                <div className="text-blue-700 font-bold">Buyer: {o.buyer?.name}</div>
                                                <div className="text-gray-600 font-bold">Seller: {o.seller?.name}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase w-full text-center ${o.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800' : o.trackingStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {o.trackingStatus || 'Processing'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                                    o.transaction?.status === 'disputed' ? 'bg-red-100 text-red-800' :
                                                    o.transaction?.status === 'escrow_held' ? 'bg-blue-100 text-blue-800' :
                                                    o.transaction?.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {o.transaction?.status?.replace('_', ' ') || 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col space-y-2">
                                                    {/* Tracking Controls */}
                                                    <div className="flex justify-center space-x-1 border-b border-gray-100 pb-2 mb-2">
                                                        {o.trackingStatus !== 'Shipped' && o.trackingStatus !== 'Delivered' && (
                                                            <button onClick={() => updateTrackingHandler(o._id, 'Shipped')} className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded font-bold text-[10px] transition border border-blue-200">Set Shipped</button>
                                                        )}
                                                        {o.trackingStatus !== 'Delivered' && (
                                                            <button onClick={() => updateTrackingHandler(o._id, 'Delivered')} className="text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded font-bold text-[10px] transition border border-green-200">Set Delivered</button>
                                                        )}
                                                    </div>

                                                    {/* Dispute Controls */}
                                                    {o.transaction?.status === 'disputed' && (
                                                        <>
                                                            <button onClick={() => resolveDisputeHandler(o._id, 'refund_buyer')} className="text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-bold text-xs transition border border-purple-200">
                                                                Refund Buyer
                                                            </button>
                                                            <button onClick={() => resolveDisputeHandler(o._id, 'release_to_seller')} className="text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold text-xs transition border border-green-200">
                                                                Release to Seller
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
