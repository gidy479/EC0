import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsSubmitting(false);
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
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm pr-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 focus:outline-none transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full text-white font-black py-4 px-4 rounded-xl shadow-md transition duration-300 md:mt-4 flex justify-center items-center transform active:scale-95 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-500 hover:shadow-lg hover:shadow-green-500/20'}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Logging In...
                                </span>
                            ) : 'Log In'}
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
