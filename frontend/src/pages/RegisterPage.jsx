import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Buyer');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await register(name, email, password, role);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center py-6 md:py-10 px-4 animate-fade-in-up">
            <div className="glass p-6 md:p-10 rounded-2xl w-full max-w-md relative overflow-hidden shadow-xl border border-white/40">
                {/* Decorative elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-6 md:mb-8">
                        Create Account
                    </h2>

                    {error && <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-xs font-bold text-center shadow-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <div>
                            <label className="block text-gray-500 font-black uppercase tracking-widest mb-2 text-[10px]">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g. Ama Serwaa"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 font-black uppercase tracking-widest mb-2 text-[10px]">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 font-black uppercase tracking-widest mb-2 text-[10px]">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 font-black uppercase tracking-widest mb-2 text-[10px]">I want to...</label>
                            <select
                                className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm cursor-pointer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Buyer">Shop for verified products</option>
                                <option value="Seller">Sell eco-friendly items</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-teal-500 text-white font-black py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition duration-300 transform active:scale-95 mt-6 shadow-md"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 font-bold text-sm">
                        Already have an account? <Link to="/login" className="text-teal-600 hover:text-teal-700 transition">Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
