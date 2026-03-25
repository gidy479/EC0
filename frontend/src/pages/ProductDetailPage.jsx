import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import API_BASE_URL from '../config/apiConfig';
import { getSafeImageUrl } from '../utils/imageUtils';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [message, setMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useContext(CartContext);
    const [added, setAdded] = useState(false);

    // Reviews state
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating: Number(rating), comment })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Review submitted successfully!');
                setRating('');
                setComment('');
                // Instead of writing a custom fetch trigger, quick reload handles state refetch optimally for now
                window.location.reload();
            } else {
                setReviewError(data.message || 'Failed to submit review');
            }
        } catch (err) {
            setReviewError('Failed to submit review. Server error.');
        }
    };

    if (loading) return <div className="text-center py-20 animate-pulse text-gray-500">Loading product data...</div>;
    if (!product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in-up">
            <div className="glass rounded-3xl overflow-hidden relative shadow-lg">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                <div className="flex flex-col md:flex-row relative z-10">
                    {/* Image */}
                    <div className="w-full md:w-1/2 bg-white/30 flex items-center justify-center min-h-[300px] md:min-h-[450px] p-4 md:p-6 backdrop-blur-sm border-b md:border-b-0 md:border-r border-white/40">
                        {product.images && product.images.length > 0 ? (
                            <img src={getSafeImageUrl(product.images[0])} alt={product.name} className="w-full h-full max-h-[400px] md:max-h-none object-cover rounded-2xl shadow-sm" />
                        ) : (
                            <svg className="w-24 h-24 text-green-200/60 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-6 md:p-10 w-full md:w-1/2 flex flex-col justify-between bg-white/20 backdrop-blur-md">
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
                                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">GH₵{product.price.toFixed(2)}</span>
                            </div>

                            {/* Ratings Summary */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex text-yellow-400">
                                    {[1,2,3,4,5].map(star => (
                                        <svg key={star} className={`w-5 h-5 ${product.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{product.numReviews} review{product.numReviews !== 1 && 's'}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-8">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-sm border ${product.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                    {product.verificationStatus === 'verified' ? (
                                        <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> AI VERIFIED</span>
                                    ) : (
                                        <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> UNVERIFIED</span>
                                    )}
                                </span>
                                {(product.stock !== undefined) && (
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-sm border ${product.stock > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                        {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                                    </span>
                                )}
                                <span className="text-[10px] md:text-sm bg-white/40 px-3 py-1.5 rounded-full border border-white/50 text-gray-600 font-medium whitespace-nowrap">By: <span className="font-bold text-gray-800">{product.seller?.name || 'Unknown'}</span></span>
                            </div>

                            <div className="mb-8 p-5 md:p-6 bg-white/40 rounded-2xl border border-white/50 shadow-sm relative overflow-hidden">
                                <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-widest text-green-800/70">About this product</h3>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{product.description}</p>
                            </div>

                            {product.ecoLabels && product.ecoLabels.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-widest text-green-800/70">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.ecoLabels.map((label, idx) => (
                                            <span key={idx} className="bg-white/60 backdrop-blur-sm text-green-800 font-medium border border-green-200/50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-sm shadow-sm flex items-center">
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 border-t border-white/40 pt-8">
                            {message && (
                                <div className={`mb-5 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100/90 text-green-800 border border-green-200 shadow-sm' : 'bg-red-100/90 text-red-800 border border-red-200 shadow-sm'}`}>
                                    {message.text}
                                </div>
                            )}

                            {product.verificationStatus === 'verified' ? (
                                <>
                                    <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 bg-white/40 p-4 rounded-xl shadow-sm border border-white/50 gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <span className="text-gray-700 font-medium text-sm">Quantity:</span>
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white ml-auto sm:ml-0">
                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" disabled={product.stock < 1}>-</button>
                                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 1, parseInt(e.target.value) || 1)))} className="w-12 text-center py-1 outline-none text-gray-800 font-bold" min="1" max={product.stock || 1} disabled={product.stock < 1} />
                                                <button onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" disabled={product.stock < 1}>+</button>
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Total Amount</span>
                                            <span className="text-2xl font-black text-green-700">GH₵{(product.price * quantity).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock < 1}
                                        className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-[0_4px_15px_rgba(34,197,94,0.3)] transition-all duration-300 flex justify-center items-center transform active:scale-95 ${product.stock < 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:-translate-y-1 hover:shadow-lg'}`}
                                    >
                                        {added ? (
                                            <>
                                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                Added to Cart
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200/80 p-5 rounded-2xl text-orange-800 text-center shadow-sm">
                                    <p className="font-extrabold flex items-center justify-center text-lg mb-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Unverified Product
                                    </p>
                                    <p className="text-sm">Our Trust Layer prevents the purchase of goods until they are fully verified by AI to prevent greenwashing.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Verification Reasoning Section */}
                {product.verificationReasoning && (
                    <div className="bg-white/30 backdrop-blur-md border-t border-white/50 p-6 md:p-10 relative z-10 w-full">
                        <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm border border-green-200 flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            AI Verification Report
                        </h3>
                        <div className="glass-card p-6 md:p-8 rounded-2xl block hover:transform-none bg-white/40">
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base"><strong className="text-gray-900 block mb-2 text-lg">Analysis Summary:</strong> {product.verificationReasoning}</p>
                            <div className="mt-8 flex flex-col md:flex-row md:items-center bg-white/50 p-5 rounded-xl border border-white/60 shadow-inner">
                                <span className="text-[10px] md:text-sm text-gray-600 uppercase tracking-widest font-black mb-3 md:mb-0 md:mr-6 whitespace-nowrap">AI Confidence Index</span>
                                <div className="flex-grow w-full bg-gray-200/50 rounded-full h-4 shadow-inner overflow-hidden relative">
                                    <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${(product.aiConfidenceScore || 0) * 100}%` }}>
                                        <div className="absolute inset-0 bg-white/30 w-full animate-pulse-slow"></div>
                                    </div>
                                </div>
                                <span className="text-xl md:text-2xl font-black ml-0 md:ml-6 mt-3 md:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 self-center md:self-auto">{(product.aiConfidenceScore * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white/40 backdrop-blur-md border-t border-white/50 p-6 md:p-10 relative z-10 w-full">
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-8 flex items-center">
                        Customer Reviews
                    </h3>
                    
                    {/* Review List */}
                    <div className="space-y-6 mb-10 w-full">
                        {(!product.reviews || product.reviews.length === 0) && (
                            <div className="text-gray-500 italic bg-white/50 p-8 rounded-2xl border border-white/60 text-center">No reviews yet. Be the first to share your experience!</div>
                        )}
                        {product.reviews && product.reviews.map((review) => (
                            <div key={review._id} className="bg-white/70 p-6 md:p-8 rounded-2xl shadow-sm border border-white/80 transition-all hover:bg-white/90">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200 uppercase">{review.name.charAt(0)}</div>
                                        <span className="font-bold text-gray-800">{review.name}</span>
                                    </div>
                                    <span className="text-[10px] md:text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-400 mb-4 bg-yellow-50/30 p-2 rounded-lg inline-flex">
                                    {[1,2,3,4,5].map(star => (
                                        <svg key={star} className={`w-4 h-4 md:w-5 md:h-5 ${review.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base border-l-2 border-green-200 pl-4">{review.comment}</p>
                            </div>
                        ))}
                    </div>

                    {/* Write a review */}
                    <div className="bg-white/50 backdrop-blur-sm p-6 md:p-10 rounded-3xl border border-white/60 w-full shadow-inner">
                        <h4 className="text-xl font-extrabold text-gray-800 mb-6 uppercase tracking-wider text-green-800/80">Write a Review</h4>
                        {user ? (
                            <form onSubmit={submitReview} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">Overall Rating</label>
                                    <div className="relative">
                                        <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-white/80 shadow-sm focus:ring-2 focus:ring-green-400 outline-none appearance-none font-bold text-gray-700" required>
                                            <option value="">Select your rating...</option>
                                            <option value="5">5 Stars - Exceptional</option>
                                            <option value="4">4 Stars - Very Good</option>
                                            <option value="3">3 Stars - Good</option>
                                            <option value="2">2 Stars - Fair</option>
                                            <option value="1">1 Star - Poor</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">Your Thoughts</label>
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows="4" className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-white/80 shadow-sm focus:ring-2 focus:ring-green-400 outline-none font-medium text-gray-700 placeholder-gray-400" placeholder="What did you like or dislike about this eco-friendly product?"></textarea>
                                </div>
                                {reviewError && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">{reviewError}</div>}
                                <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition transform hover:-translate-y-1 active:scale-95 shadow-xl">Post Review</button>
                            </form>
                        ) : (
                            <div className="text-center py-10 bg-white/40 rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium mb-4">You must be logged in to share a review.</p>
                                <a href="/login" className="inline-block px-8 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition shadow-lg">Login to Continue</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
