import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    
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
                const res = await fetch('http://localhost:5000/api/auth/profile', {
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
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setAvatar(`http://localhost:5000${data.imageUrl}`);
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
            const res = await fetch('http://localhost:5000/api/auth/profile', {
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
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">My Profile Settings</h2>

            <div className="glass p-8 rounded-3xl shadow-lg relative h-fit overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border shadow-sm`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={submitHandler} className="relative z-10 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center border-b border-gray-100 pb-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                {avatar ? (
                                    <img src={avatar.startsWith('/') ? `http://localhost:5000${avatar}` : avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full cursor-pointer shadow-md transform hover:scale-110 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/*" />
                            </label>
                            {uploading && <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-teal-600 font-bold">Uploading...</span>}
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                            <p className="text-gray-500">{user?.role} Account</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Reset Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition-all placeholder-gray-400" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Main Delivery Address</label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Eco Street, Accra" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition-all" />
                        </div>
                    </div>

                    <button type="submit" className="w-full mt-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition transform">
                        Save Profile Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
