import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/apiConfig';

const ReportsDashboard = () => {
    const { user } = useContext(AuthContext);
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/reports/overview`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setReportsData(data);
                }
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchReports();
    }, [user]);

    if (!user) return <div className="text-center py-20 text-gray-500">Please login to view reports.</div>;
    if (loading) return <div className="text-center py-20 text-gray-500">Loading reports...</div>;

    const { sales, products, transactions } = reportsData || {};
    const isBuyer = user.role === 'Buyer';

    const handleExportCSV = () => {
        if (!reportsData) return;

        const csvRows = [];
        csvRows.push(['Category', 'Metric', 'Value']);

        if (isBuyer) {
            csvRows.push(['Purchases', 'Total Spent (last 30 days)', sales.totalSpent || 0]);
            csvRows.push(['Purchases', 'Total Orders Placed', sales.totalOrdersPlaced || 0]);
            csvRows.push(['Purchases', 'Total Items Bought', sales.productsBoughtCount || 0]);
        } else {
            csvRows.push(['Sales & Revenue', 'Total Revenue (last 30 days)', sales.totalRevenue || 0]);
            csvRows.push(['Sales & Revenue', 'Total Orders Received', sales.totalOrdersReceived || 0]);
            csvRows.push(['Sales & Revenue', 'Total Items Sold', sales.totalItemsSold || 0]);

            csvRows.push(['Product Catalog', 'Total Listings', products.totalProductsListed || 0]);
            csvRows.push(['Product Catalog', 'Low Stock Count', products.lowStockCount || 0]);
        }

        csvRows.push(['Wallet Transactions', 'Total Transactions', transactions.totalTransactions || 0]);
        csvRows.push(['Wallet Transactions', 'Total Volume', transactions.totalVolume || 0]);
        csvRows.push(['Wallet Transactions', 'Completed', transactions.completedTransactions || 0]);
        csvRows.push(['Wallet Transactions', 'Pending Escrow', transactions.pendingEscrow || 0]);

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ecomarket_${user.role.toLowerCase()}_report_30days.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 animate-fade-in-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-4 border-b border-gray-200/50">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
                    My {isBuyer ? 'Spending' : 'Reports'}
                </h2>
                <button
                    onClick={handleExportCSV}
                    className="w-full md:w-auto px-5 py-3 md:py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 font-bold transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sales / Purchases Card */}
                <div className="glass p-6 md:p-8 rounded-3xl shadow-sm border border-blue-100 flex flex-col justify-between group">
                    <div>
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-400 mb-2">{isBuyer ? 'Total Spent' : 'Total Revenue'}</h3>
                        <p className="text-3xl md:text-4xl font-black text-blue-800 tracking-tight">
                            GH₵{isBuyer ? (sales?.totalSpent?.toFixed(2) || 0) : (sales?.totalRevenue?.toFixed(2) || 0)}
                        </p>
                    </div>
                    <div className="mt-8 flex flex-col gap-2 text-xs md:text-sm text-gray-500 border-t border-blue-50/50 pt-4">
                        <div className="flex justify-between">
                            <span>Orders {isBuyer ? 'Placed' : 'Received'}:</span>
                            <strong className="text-gray-900 font-black">{isBuyer ? sales?.totalOrdersPlaced : sales?.totalOrdersReceived || 0}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Items {isBuyer ? 'Bought' : 'Sold'}:</span>
                            <strong className="text-gray-900 font-black">{isBuyer ? sales?.productsBoughtCount : sales?.totalItemsSold || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Products Card (Only for Sellers) */}
                {!isBuyer && (
                    <div className="glass p-6 md:p-8 rounded-3xl shadow-sm border border-teal-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-400 mb-2">My Catalog</h3>
                            <p className="text-3xl md:text-4xl font-black text-teal-800 tracking-tight">{products?.totalProductsListed || 0} <span className="text-sm font-bold text-teal-600">Items Listed</span></p>
                        </div>
                        <div className="mt-8 flex justify-between items-center text-xs md:text-sm text-gray-500 border-t border-teal-50/50 pt-4">
                            <span>Status:</span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg font-black uppercase tracking-tighter text-[10px] border border-orange-100">Low Stock: {products?.lowStockCount || 0}</span>
                        </div>
                    </div>
                )}

                {/* Transactions Card */}
                <div className="glass p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                    <div>
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Transaction Volume</h3>
                        <p className="text-3xl md:text-4xl font-black text-indigo-800 tracking-tight">GH₵{transactions?.totalVolume?.toFixed(2) || 0}</p>
                    </div>
                    <div className="mt-8 flex flex-col gap-2 text-xs md:text-sm text-gray-500 border-t border-indigo-50/50 pt-4">
                        <div className="flex justify-between">
                            <span>Total Count:</span>
                            <strong className="text-gray-900 font-black">{transactions?.totalTransactions || 0}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Completed / Escrow:</span>
                            <strong className="text-gray-900 font-black">{transactions?.completedTransactions} / {transactions?.pendingEscrow}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Warning Section (Sellers only) */}
            {!isBuyer && products?.lowStockCount > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Low Stock Alerts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.lowStockProducts.map(fp => (
                            <div key={fp.id} className="bg-orange-50/40 backdrop-blur-md p-5 rounded-2xl border border-orange-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm hover:shadow-md transition">
                                <span className="font-bold text-gray-800 text-sm md:text-base">{fp.name}</span>
                                <span className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                                    Only {fp.stock} left
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsDashboard;
