import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

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
                const res = await fetch(`/api/products/${id}`);
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
            const res = await fetch(`/api/products/${id}/reviews`, {
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
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="glass rounded-3xl overflow-hidden relative shadow-lg">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                <div className="md:flex relative z-10">
                    {/* Image */}
                    <div className="md:w-1/2 bg-white/30 flex items-center justify-center min-h-[350px] p-6 backdrop-blur-sm border-r border-white/40">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-2xl shadow-sm" />
                        ) : (
                            <svg className="w-24 h-24 text-green-200/60 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-8 md:p-10 md:w-1/2 flex flex-col justify-between bg-white/20 backdrop-blur-md">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight pr-4">{product.name}</h2>
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700">GH₵{product.price.toFixed(2)}</span>
                            </div>

                            {/* Ratings Summary */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-yellow-400">
                                    {[1,2,3,4,5].map(star => (
                                        <svg key={star} className={`w-5 h-5 ${product.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{product.numReviews} review{product.numReviews !== 1 && 's'}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${product.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                    {product.verificationStatus === 'verified' ? (
                                        <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> AI VERIFIED</span>
                                    ) : (
                                        <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> UNVERIFIED</span>
                                    )}
                                </span>
                                {(product.stock !== undefined) && (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${product.stock > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                        {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                                    </span>
                                )}
                                <span className="text-sm bg-white/40 px-3 py-1.5 rounded-full border border-white/50 text-gray-600 font-medium">By: <span className="font-bold text-gray-800">{product.seller?.name || 'Unknown'}</span></span>
                            </div>

                            <div className="mb-8 p-5 bg-white/40 rounded-2xl border border-white/50 shadow-sm relative">
                                <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-widest text-green-800/70">About this product</h3>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>

                            {product.ecoLabels && product.ecoLabels.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-widest text-green-800/70">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.ecoLabels.map((label, idx) => (
                                            <span key={idx} className="bg-white/60 backdrop-blur-sm text-green-800 font-medium border border-green-200/50 px-4 py-2 rounded-xl text-sm shadow-sm flex items-center">
                                                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                                    <div className="flex items-center justify-between mb-4 bg-white/40 p-4 rounded-xl shadow-sm border border-white/50">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-700 font-medium">Quantity:</span>
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" disabled={product.stock < 1}>-</button>
                                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 1, parseInt(e.target.value) || 1)))} className="w-12 text-center py-1 outline-none text-gray-800" min="1" max={product.stock || 1} disabled={product.stock < 1} />
                                                <button onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" disabled={product.stock < 1}>+</button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500 uppercase tracking-widest block">Total</span>
                                            <span className="text-2xl font-black text-green-700">GH₵{(product.price * quantity).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock < 1}
                                        className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-[0_4px_15px_rgba(34,197,94,0.3)] transition-all duration-300 flex justify-center items-center transform ${product.stock < 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:-translate-y-1 hover:shadow-lg'}`}
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
                    <div className="bg-white/30 backdrop-blur-md border-t border-white/50 p-6 md:p-8 relative z-10">
                        <h3 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm border border-green-200">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            AI Verification Report
                        </h3>
                        <div className="glass-card p-6 rounded-2xl block hover:transform-none">
                            <p className="text-gray-700 leading-relaxed"><strong className="text-gray-900">Analysis:</strong> {product.verificationReasoning}</p>
                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center bg-white/40 p-4 rounded-xl border border-white/50">
                                <span className="text-sm text-gray-600 uppercase tracking-widest font-bold mb-2 sm:mb-0 sm:mr-4">AI Confidence</span>
                                <div className="flex-grow w-full bg-gray-200/50 rounded-full h-3 shadow-inner overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${(product.aiConfidenceScore || 0) * 100}%` }}>
                                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse-slow"></div>
                                    </div>
                                </div>
                                <span className="text-lg font-black ml-0 sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">{(product.aiConfidenceScore * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white/40 backdrop-blur-md border-t border-white/50 p-6 md:p-8 relative z-10 w-full">
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
                        Customer Reviews
                    </h3>
                    
                    {/* Review List */}
                    <div className="space-y-6 mb-8 w-full">
                        {(!product.reviews || product.reviews.length === 0) && (
                            <div className="text-gray-500 italic bg-white/50 p-6 rounded-xl border border-white/60">No reviews yet. Be the first to review this!</div>
                        )}
                        {product.reviews && product.reviews.map((review) => (
                            <div key={review._id} className="bg-white/60 p-5 rounded-2xl shadow-sm border border-white/70">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-800">{review.name}</span>
                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-400 mb-3">
                                    {[1,2,3,4,5].map(star => (
                                        <svg key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>

                    {/* Write a review */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/60 w-full">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Write a Customer Review</h4>
                        {user ? (
                            <form onSubmit={submitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                    <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required>
                                        <option value="">Select a rating...</option>
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="Share your thoughts about this product..."></textarea>
                                </div>
                                {reviewError && <div className="text-red-500 text-sm font-medium">{reviewError}</div>}
                                <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-md">Submit Review</button>
                            </form>
                        ) : (
                            <div className="text-gray-500 bg-white p-4 rounded-xl shadow-sm border border-gray-100">Please <a href="/login" className="text-green-600 font-bold hover:underline">log in</a> to write a review.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
