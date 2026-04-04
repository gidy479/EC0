import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setName(data.name);
                    setEmail(data.email);
                    setPhone(data.phone || '');
                    setAddress(data.address || '');
                    setAvatar(data.avatar || '');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, navigate]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setAvatar(`${API_BASE_URL}${data.imageUrl}`);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error uploading image' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error uploading image' });
        } finally {
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ name, email, phone, address, password, avatar })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile Updated Successfully! Password/Email changes will reflect on next login.' });
                setPassword('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-0 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">Profile Settings</h2>

            <div className="glass p-6 md:p-8 rounded-3xl shadow-lg relative h-fit overflow-hidden border border-white/40">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-xs font-black uppercase tracking-tighter ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border shadow-sm`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={submitHandler} className="relative z-10 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-100/50 pb-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {avatar ? (
                                    <img src={avatar.startsWith('/') ? `${API_BASE_URL}${avatar}` : avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-14 h-14 md:w-16 md:h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg transform active:scale-95 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/*" />
                            </label>
                            {uploading && <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-teal-600 font-black uppercase tracking-widest animate-pulse whitespace-nowrap">Uploading...</span>}
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-lg md:text-xl font-black text-gray-800">{name}</h3>
                            <p className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-widest mt-1">{user?.role} Account</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all font-bold text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all font-bold text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all font-bold text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reset Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" 
                                    pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$"
                                    title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all font-bold text-gray-800 placeholder-gray-300 pr-12" />
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
                            <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wide">Req: 8+ chars, 1 upper, 1 lower, 1 number, 1 special char</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Address</label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Main Street, Accra" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all font-bold text-gray-800" />
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-4 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-gray-200 transition-all transform active:scale-95 sm:hover:-translate-y-1">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
