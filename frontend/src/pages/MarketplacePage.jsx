import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import { getSafeImageUrl } from '../utils/imageUtils';

const MarketplacePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [submittedSearch, setSubmittedSearch] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/products?keyword=${submittedSearch}&pageNumber=${page}`);
                const data = await res.json();
                if (res.ok) {
                    setProducts(data.products || []);
                    setPage(data.page || 1);
                    setPages(data.pages || 1);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, submittedSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        setSubmittedSearch(searchQuery);
    };

    return (
        <div className="space-y-8 px-4 sm:px-0 animate-fade-in-up pb-12">
            {/* Hero Section */}
            <div className="glass p-8 md:p-14 text-center rounded-3xl mt-6 relative overflow-hidden border border-white/40 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                    <h2 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-6 tracking-tight leading-tight">
                        Verified Sustainable Goods
                    </h2>
                    <p className="text-sm md:text-xl text-green-800/80 max-w-2xl mx-auto mb-10 font-bold leading-relaxed">
                        Every product on EcoMarketPlus is AI-verified to combat greenwashing. Shop with transparency and confidence.
                    </p>
                    <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search verified products..."
                            className="w-full pl-6 pr-14 py-4 rounded-2xl glass border border-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/95 text-gray-800 placeholder-gray-400 transition-all duration-300 font-bold text-sm md:text-base"
                        />
                        <button type="submit" className="absolute right-2 top-2 bg-gradient-to-r from-green-600 to-teal-700 text-white p-2.5 rounded-xl hover:from-green-700 hover:to-teal-800 transition shadow-lg transform active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Product Grid Area */}
            <div className="pt-4">
                <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-8 border-l-4 border-green-500 pl-4 uppercase tracking-widest text-[10px] md:text-base">Discovery Feed</h3>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass rounded-3xl overflow-hidden p-3 border border-white/40">
                                <div className="h-48 md:h-56 bg-gray-100/50 rounded-2xl animate-pulse"></div>
                                <div className="p-4 mt-2 space-y-3">
                                    <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="h-8 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                        <div className="h-10 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border border-white/40 shadow-sm flex flex-col items-center px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-gray-500 font-bold text-lg mb-2">No Verified Products Found</p>
                        <p className="text-gray-400 text-sm max-w-xs mb-8">We couldn't find anything matching "{submittedSearch}". Try different keywords or browse all.</p>
                        {submittedSearch && (
                            <button onClick={() => { setSearchQuery(''); setSubmittedSearch(''); }} className="bg-white border border-gray-200 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition active:scale-95">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
                            {products.map((product, idx) => (
                            <div key={product._id} className="glass p-3 rounded-3xl overflow-hidden group border border-white/40 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="h-52 md:h-56 bg-white/50 rounded-2xl flex items-center justify-center overflow-hidden relative">
                                    {/* Verification Badge Float */}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-lg z-10 border border-white/60">
                                        <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span className="text-[9px] font-black text-green-700 uppercase tracking-widest leading-none">AI VERIFIED</span>
                                    </div>

                                    {product.images && product.images.length > 0 ? (
                                        <img src={getSafeImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h4 className="font-black text-gray-800 text-lg truncate mb-1 leading-tight">{product.name}</h4>
                                    <p className="text-gray-400 text-xs font-bold line-clamp-2 mb-4 h-9 leading-relaxed">{product.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">Price</span>
                                            <span className="text-xl font-black text-gray-900 leading-none">GH₵{product.price.toFixed(2)}</span>
                                        </div>
                                        <Link to={`/product/${product._id}`} className="bg-gradient-to-r from-green-600 to-teal-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transform active:scale-90 transition-all hover:translate-y-[-2px] hover:shadow-green-500/20">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-3 mt-12 pb-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${page === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-transparent' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100 active:scale-95'}`}
                                >
                                    Prev
                                </button>
                                {[...Array(pages).keys()].map(x => (
                                    <button
                                        key={x + 1}
                                        onClick={() => setPage(x + 1)}
                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all flex items-center justify-center ${x + 1 === page ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white shadow-lg scale-110' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                                    >
                                        {x + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${page === pages ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-transparent' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100 active:scale-95'}`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplacePage;
