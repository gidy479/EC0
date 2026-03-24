import React, { useState, useEffect } from 'react';

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
                const res = await fetch(`http://localhost:5000/api/products?keyword=${submittedSearch}&pageNumber=${page}`);
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
        <div className="space-y-8 animate-fade-in-up">
            {/* Hero Section */}
            <div className="glass p-8 md:p-14 text-center rounded-3xl mt-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-700 mb-6 tracking-tight">
                        Shop Verified Sustainable Goods
                    </h2>
                    <p className="text-lg md:text-xl text-green-800 max-w-2xl mx-auto mb-10 font-medium">
                        Every product on EcoMarketPlus is AI-verified to combat greenwashing. Shop with confidence.
                    </p>
                    <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search eco-friendly products..."
                            className="w-full pl-5 pr-14 py-4 rounded-full glass border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/90 text-gray-800 placeholder-gray-500 transition-all duration-300"
                        />
                        <button type="submit" className="absolute right-2 top-2 bg-gradient-to-r from-green-500 to-teal-500 text-white p-2 rounded-full hover:from-green-600 hover:to-teal-600 transition shadow-md transform group-hover:scale-105">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 m-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Product Grid Area */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Trending Products</h3>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-card rounded-2xl overflow-hidden p-3 block">
                                <div className="h-48 bg-white/40 rounded-xl animate-pulse"></div>
                                <div className="p-4 mt-2">
                                    <div className="h-5 bg-white/60 rounded w-3/4 mb-3 animate-pulse"></div>
                                    <div className="h-4 bg-white/50 rounded w-1/2 mb-5 animate-pulse"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-7 bg-white/60 rounded w-1/4 animate-pulse"></div>
                                        <div className="h-9 glass rounded-lg w-1/3 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <p className="text-gray-500 text-lg">No verified products found matching your search.</p>
                        {submittedSearch && (
                            <button onClick={() => { setSearchQuery(''); setSubmittedSearch(''); }} className="mt-4 text-green-600 font-bold hover:underline">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                            {products.map((product, idx) => (
                            <div key={product._id} className="glass-card rounded-2xl overflow-hidden p-3 block animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="h-48 bg-white/50 rounded-xl flex items-center justify-center overflow-hidden relative">
                                    {/* Verification Badge Float */}
                                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-sm z-10 border border-white/50">
                                        <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">AI Verified</span>
                                    </div>

                                    {product.images && product.images.length > 0 ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition duration-500 hover:scale-105" />
                                    ) : (
                                        <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    )}
                                </div>
                                <div className="p-4 mt-2">
                                    <h4 className="font-bold text-gray-800 text-lg truncate mb-1">{product.name}</h4>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-2xl font-black text-gray-900">GH₵{product.price.toFixed(2)}</span>
                                        <a href={`/product/${product._id}`} className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition shadow-md transform hover:-translate-y-0.5">
                                            View
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`px-4 py-2 rounded-xl font-bold transition ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'}`}
                                >
                                    Previous
                                </button>
                                {[...Array(pages).keys()].map(x => (
                                    <button
                                        key={x + 1}
                                        onClick={() => setPage(x + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold transition flex items-center justify-center ${x + 1 === page ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'}`}
                                    >
                                        {x + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    className={`px-4 py-2 rounded-xl font-bold transition ${page === pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'}`}
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
