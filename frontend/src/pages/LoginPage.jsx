import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 md:py-20 px-4 animate-fade-in-up">
            <div className="glass p-6 md:p-10 rounded-2xl w-full max-w-md relative overflow-hidden shadow-xl border border-white/40">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-6 md:mb-8">
                        Welcome Back
                    </h2>

                    {error && <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-xs font-bold text-center shadow-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
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
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-teal-500 text-white font-black py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition duration-300 transform active:scale-95 md:mt-4 shadow-md"
                        >
                            Log In
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 font-bold text-sm">
                        Don't have an account? <Link to="/register" className="text-teal-600 hover:text-teal-700 transition">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
