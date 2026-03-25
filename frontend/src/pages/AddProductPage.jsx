import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const AddProductPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(1);
    const [description, setDescription] = useState('');
    const [ecoLabels, setEcoLabels] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [image, setImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploadingImage(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Adjust path for full URL if needed, but backend gives e.g., /uploads/...
            setImage(`${API_BASE_URL}${data.imageUrl}`);
        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    if (!user || user.role !== 'Seller') {
        return (
            <div className="text-center py-20 animate-fade-in-up">
                <div className="glass max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h2 className="text-4xl font-extrabold text-gray-900 relative z-10">Access Denied</h2>
                    <p className="text-gray-600 mt-4 relative z-10 text-lg">You must be a registered <span className="font-bold text-gray-800">Merchant</span> to add products.</p>
                    <button onClick={() => navigate('/')} className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:from-black hover:to-gray-800 transition transform hover:-translate-y-1 relative z-10 w-full">Return Home</button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setVerificationResult(null);

        try {
            // 1. Create Product
            const prodRes = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    stock: Number(stock),
                    description,
                    ecoLabels: ecoLabels.split(',').map(l => l.trim()).filter(l => l),
                    images: image ? [image] : []
                })
            });

            const productData = await prodRes.json();

            if (!prodRes.ok) throw new Error(productData.message);

            // 2. Trigger AI Verification
            const verRes = await fetch(`${API_BASE_URL}/api/verify/${productData._id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            const verificationData = await verRes.json();
            setVerificationResult(verificationData);

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0 animate-fade-in-up">
            <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-8 pb-4 border-b border-gray-200/50">List Product</h2>

            {verificationResult ? (
                <div className={`p-6 md:p-8 rounded-3xl border mb-8 glass shadow-lg relative overflow-hidden ${verificationResult.status === 'verified' ? 'border-green-200/50' : 'border-red-200/50'}`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-multiply filter blur-2xl opacity-40 ${verificationResult.status === 'verified' ? 'bg-green-300' : 'bg-red-300'}`}></div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                            <h3 className={`text-xl md:text-2xl font-black flex items-center ${verificationResult.status === 'verified' ? 'text-green-800' : 'text-red-800'}`}>
                                {verificationResult.status === 'verified' ? (
                                    <svg className="w-6 h-6 md:w-8 md:h-8 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-6 h-6 md:w-8 md:h-8 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                )}
                                AI Verification: {verificationResult.status.toUpperCase()}
                            </h3>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 bg-white/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/50 w-fit">
                                Confidence: {(verificationResult.confidence * 100).toFixed(0)}%
                            </span>
                        </div>

                        <div className="bg-white/50 p-5 rounded-2xl border border-white/60 mb-6 shadow-sm">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">AI Analysis</h4>
                            <p className="text-gray-800 leading-relaxed font-bold text-sm md:text-base">{verificationResult.reasoning}</p>
                        </div>

                        <div className="w-full bg-gray-200/50 rounded-full h-2 mb-8 shadow-inner overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${verificationResult.status === 'verified' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`} style={{ width: `${verificationResult.confidence * 100}%` }}>
                                <div className="absolute inset-0 bg-white/20 w-full animate-pulse-slow"></div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/dashboard')} className="flex-1 bg-white border border-gray-200 text-gray-800 py-3.5 rounded-xl hover:bg-gray-50 font-black uppercase tracking-wide text-sm shadow-sm transition transform active:scale-95">
                                Dashboard
                            </button>
                            <button onClick={() => window.location.reload()} className="flex-1 bg-gradient-to-r from-green-600 to-teal-700 text-white py-3.5 rounded-xl hover:from-green-700 hover:to-teal-800 font-black uppercase tracking-wide text-sm shadow-lg transition transform active:scale-95">
                                Add Another
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="glass p-6 md:p-10 rounded-3xl shadow-lg relative overflow-hidden group border border-white/40">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="space-y-6 md:space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div>
                                <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-green-400 focus:bg-white/90 outline-none transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 font-bold"
                                    placeholder="e.g. Bamboo Toothbrush"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Price (GH₵)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-green-400 focus:bg-white/90 outline-none transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 text-lg font-black"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div>
                                <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Stock Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-green-400 focus:bg-white/90 outline-none transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 text-lg font-black"
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Eco-Labels</label>
                                <input
                                    type="text"
                                    value={ecoLabels}
                                    onChange={e => setEcoLabels(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-green-400 focus:bg-white/90 outline-none transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 font-bold"
                                    placeholder="e.g. FSC, FairTrade"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Product Image</label>
                            <label className="cursor-pointer block">
                                <div className="w-full px-4 py-3 bg-white/50 border-2 border-dashed border-white/60 rounded-xl hover:border-green-400 hover:bg-white/80 transition-all text-center">
                                    <span className="text-gray-500 font-bold text-sm">{image ? 'Image Uploaded ✓' : 'Click to Upload Image'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={uploadFileHandler}
                                        className="hidden"
                                    />
                                </div>
                            </label>
                            {uploadingImage && <p className="text-[10px] font-black uppercase text-blue-600 mt-2 animate-pulse">Uploading...</p>}
                            {image && (
                                <div className="mt-4 flex justify-center md:justify-start">
                                    <img src={image} alt="Product Preview" className="w-24 h-24 object-cover rounded-xl shadow-lg border-2 border-white/40" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-600 font-black mb-2 text-[10px] uppercase tracking-widest">Detailed Description</label>
                            <textarea
                                required
                                rows="4"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-4 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-green-400 focus:bg-white/90 outline-none resize-none transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 font-bold text-sm"
                                placeholder="Describe materials and impact..."
                            ></textarea>
                            <div className="mt-3 bg-blue-50/60 backdrop-blur-md border border-blue-100/50 rounded-xl p-3 flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                <p className="text-[10px] text-blue-800 font-bold leading-tight">AI analyzes this to detect greenwashing. Be specific about materials!</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-all duration-300 flex justify-center items-center transform active:scale-95 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-700 hover:shadow-green-500/20 hover:-translate-y-1'}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verifying...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddProductPage;
