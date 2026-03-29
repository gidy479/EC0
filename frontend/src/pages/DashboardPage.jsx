import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const DashboardPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState(0);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchWallet = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/wallet`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setWallet(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch wallet");
                } finally {
                    setLoading(false);
                }

                if (user.role === 'Seller') {
                    try {
                        const earRes = await fetch(`${API_BASE_URL}/api/wallet/earnings`, {
                            headers: { Authorization: `Bearer ${user.token}` },
                        });
                        const earData = await earRes.json();
                        if (earRes.ok) {
                            setEarnings(earData.totalEarnings || 0);
                        }
                    } catch (error) {
                        console.error("Failed to fetch earnings");
                    }
                }
            };
            fetchWallet();
        }

        // Dynamically load Paystack script
        const script = document.createElement('script');
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [user]);



    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">Please Login</h2>
                <p className="text-gray-600 mt-4">You need to be logged in to view your dashboard.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email,
        amount: Number(depositAmount) * 100, // Paystack uses kobo/pesewas (multiply by 100)
        currency: 'GHS',
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    };
    const isConfigMissing = !config.publicKey;

    const handlePaystackSuccess = async (reference) => {
        try {
            setIsDepositModalOpen(false);

            const res = await fetch(`${API_BASE_URL}/api/wallet/verify-paystack-deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ reference: reference.reference })
            });

            const data = await res.json();
            if (res.ok && data.wallet) {
                alert('Deposit verified and successful! Your trust wallet has been credited.');
                setWallet(data.wallet);
            } else {
                alert(data.message || 'Deposit verification failed.');
            }
        } catch (e) {
            console.error(e);
            alert("Deposit verification failed. Please check backend.");
        } finally {
            setIsProcessingDeposit(false);
            setDepositAmount('');
        }
    };

    const handleDepositSubmit = (e) => {
        e.preventDefault();
        if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) return;

        if (isConfigMissing) {
            return;
        }

        setIsProcessingDeposit(true);

        const handler = window.PaystackPop.setup({
            key: config.publicKey,
            email: config.email,
            amount: config.amount,
            currency: 'GHS',
            ref: config.reference,
            callback: (response) => {
                handlePaystackSuccess(response);
            },
            onClose: () => {
                setIsProcessingDeposit(false);
                console.log('Payment modal closed');
            }
        });
        handler.openIframe();
    };

    return (
        <div className="animate-fade-in-up px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-4 border-b border-gray-200/50 gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">Dashboard</h2>
                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex-1 sm:flex-none glass border-green-200 text-green-700 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-green-50 transition shadow-sm text-sm"
                    >
                        My Orders
                    </button>
                    {user.role === 'Seller' && (
                        <button
                            onClick={() => navigate('/sales')}
                            className="flex-1 sm:flex-none glass border-indigo-200 text-indigo-700 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm text-sm"
                        >
                            My Sales
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex-1 sm:flex-none glass border-red-200 text-red-600 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition shadow-sm text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Profile Card */}
                <div className="glass p-6 md:p-8 rounded-3xl relative overflow-hidden group border border-white/40 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                    <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-800 relative z-10 flex items-center">
                        <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile
                    </h3>

                    <div className="space-y-4 text-gray-700 relative z-10">
                        <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-black mb-1">Full Name</p>
                            <p className="font-bold text-gray-900 text-sm md:text-base">{user.name}</p>
                        </div>
                        <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-black mb-1">Email</p>
                            <p className="font-bold text-gray-900 text-xs md:text-base truncate">{user.email}</p>
                        </div>
                        <div className="bg-white/40 p-3 rounded-xl border border-white/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-black mb-1">Role</p>
                                <p className="font-bold text-gray-900 text-sm">{user.role}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${user.role === 'Seller' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                {user.role === 'Seller' ? 'Merchant' : 'Shopper'}
                            </span>
                        </div>
                    </div>
                </div>

                {user.role === 'Seller' && (
                    <div className="glass p-6 md:p-8 rounded-3xl relative overflow-hidden group border border-white/40 shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                        <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-800 relative z-10 flex items-center">
                            <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Earnings
                        </h3>

                        <div className="relative z-10 h-full flex flex-col justify-center items-center py-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Total Sales</p>
                            <p className="text-3xl md:text-5xl font-black tracking-tight text-blue-600 drop-shadow-sm">
                                GH₵{earnings.toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Wallet Card */}
                <div className="glass-dark bg-gradient-to-br from-green-800 to-teal-900 p-6 md:p-8 rounded-3xl text-white md:col-span-2 lg:col-span-2 relative overflow-hidden shadow-xl">
                    {/* Decorative Background for Wallet */}
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse-slow"></div>
                    <div className="absolute top-10 right-20 w-32 h-32 bg-green-400 rounded-full mix-blend-overlay filter blur-2xl opacity-20"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-bold flex items-center">
                                <svg className="w-6 h-6 md:w-7 md:h-7 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Trust Wallet
                            </h3>
                            <span className="bg-white/10 px-2 md:px-3 py-1 rounded-lg text-[10px] font-bold border border-white/20 backdrop-blur-md uppercase tracking-wider">Escrow</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mt-auto">
                            <div>
                                <p className="text-[10px] text-green-100/70 uppercase tracking-widest font-black mb-1">Available Funds</p>
                                <p className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-md">
                                    {loading ? '...' : `GH₵${wallet?.balance?.toFixed(2) || '0.00'}`}
                                </p>
                            </div>
                            <div className="w-full sm:w-auto">
                                <button
                                    onClick={() => setIsDepositModalOpen(true)}
                                    className="w-full sm:w-auto bg-white/20 hover:bg-white text-white hover:text-green-900 px-6 py-4 rounded-2xl font-black uppercase tracking-wide text-sm transition-all duration-300 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center transform active:scale-95 sm:hover:-translate-y-1"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Add Funds
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {isDepositModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white/90 glass p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add Funds Securely
                        </h3>

                        {isConfigMissing ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-bold">Configuration Missing</p>
                                        <p className="text-xs text-red-600 mt-1">Please add your `VITE_PAYSTACK_PUBLIC_KEY` in the `frontend/.env` file and restart the React server before depositing.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 mb-6">Enter the amount you'd like to deposit into your Trust Wallet. Payments are securely processed by Paystack.</p>
                        )}

                        <form onSubmit={handleDepositSubmit}>
                            <div className="relative mb-6">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">GH₵</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full pl-20 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-2xl font-bold transition-all"
                                    placeholder="100.00"
                                    disabled={isProcessingDeposit}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDepositModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors shadow-sm"
                                    disabled={isProcessingDeposit}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center h-12 ${isConfigMissing ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
                                    disabled={isProcessingDeposit || isConfigMissing}
                                >
                                    {isProcessingDeposit ? (
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : 'Proceed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
