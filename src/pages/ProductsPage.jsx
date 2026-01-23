import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, Package2, CheckCircle2, Clock, AlertTriangle, Edit2, X, Upload, ArrowLeft } from 'lucide-react';
import { getProducts, deleteProduct } from '../services/productService';
import { getSellerById } from '../services/sellerService';

const StatCard = ({ title, value, change, icon: Icon, iconBg }) => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {title}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {value}
                    </span>
                    <span style={{ fontSize: '12px', color: change?.includes('-') ? 'var(--error)' : 'var(--success)' }}>
                        {change}
                    </span>
                </div>
            </div>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: `${iconBg}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon size={20} color={iconBg} />
            </div>
        </div>
    </div>
);

const ProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sellerId = searchParams.get('sellerId');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [sellerId, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (sellerId) filters.seller = sellerId;
            if (statusFilter !== 'all') filters.status = statusFilter.toUpperCase();

            const response = await getProducts(filters);
            setProducts(response.data.products || []);

            if (sellerId) {
                const sellerResponse = await getSellerById(sellerId);
                setSellerInfo(sellerResponse.data.seller);
            } else {
                setSellerInfo(null);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(productId);
            fetchData();
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const stats = [
        { title: 'Total Items', value: products.length.toString(), change: '+0%', icon: Package2, iconBg: '#3b82f6' },
        {
            title: 'Live Listings',
            value: products.filter(p => p.status === 'ACTIVE' || p.status === 'approved').length.toString(),
            change: '+0%',
            icon: CheckCircle2,
            iconBg: '#10b981'
        },
        {
            title: 'Pending Review',
            value: products.filter(p => p.status === 'PENDING').length.toString(),
            change: 'Avg. 24h wait',
            icon: Clock,
            iconBg: '#f59e0b'
        },
        {
            title: 'Action Required',
            value: products.filter(p => p.status === 'REJECTED').length.toString(),
            change: 'Rejected listings',
            icon: AlertTriangle,
            iconBg: '#ef4444'
        },
    ];

    const getStatusConfig = (status) => {
        const configs = {
            ACTIVE: { label: 'Active', bg: 'var(--success-light)', color: 'var(--success)', icon: CheckCircle2 },
            approved: { label: 'Approved', bg: 'var(--success-light)', color: 'var(--success)', icon: CheckCircle2 },
            PENDING: { label: 'Pending', bg: 'var(--warning-light)', color: 'var(--warning)', icon: Clock },
            pending: { label: 'Pending', bg: 'var(--warning-light)', color: 'var(--warning)', icon: Clock },
            REJECTED: { label: 'Rejected', bg: 'var(--error-light)', color: 'var(--error)', icon: X },
            rejected: { label: 'Rejected', bg: 'var(--error-light)', color: 'var(--error)', icon: X },
        };
        const normalizedStatus = status?.toUpperCase() || 'PENDING';
        return configs[normalizedStatus] || configs.PENDING;
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {sellerId && (
                    <button
                        onClick={() => navigate('/sellers')}
                        style={{
                            padding: '8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {sellerId ? `Products: ${sellerInfo?.businessName || 'Loading...'}` : 'Inventory Management'}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {sellerId
                            ? `Showing all catalog items added by ${sellerInfo?.ownerName || 'the seller'}.`
                            : 'Manage all platform listings, track stock levels, and monitor approval status.'
                        }
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Filters & Search */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by part name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <option value="all">Status: All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                {sellerId && (
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-lg)',
                            color: '#dc2626',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <X size={14} />
                        Clear Seller Filter
                    </button>
                )}

                {/* Add Button */}
                <button
                    onClick={() => navigate('/products/new')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginLeft: 'auto'
                    }}
                >
                    <Plus size={18} />
                    Add New Product
                </button>
            </div>

            {/* Products Table */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div className="flex items-center gap-3 font-semibold text-primary">
                            <SlidersHorizontal className="animate-spin" />
                            Loading Products...
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Error Loading Data</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{error}</p>
                        <button
                            onClick={fetchData}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <Package2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Products Found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {searchQuery ? 'No listings match your search criteria.' : 'This seller hasn\'t added any products yet.'}
                        </p>
                    </div>
                )}

                {!error && filteredProducts.length > 0 && (
                    <table style={{ width: '100%', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Product Details</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Stock</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const statusConfig = getStatusConfig(product.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={product._id || product.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: 'var(--radius-md)',
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <Package2 size={24} color="var(--text-muted)" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.125rem' }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        SKU: {product.sku || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {product.category}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                            ${product.price?.toFixed(2) || '0.00'}
                                        </td>
                                        <td style={{ padding: '1rem', color: (product.stock === 0 || product.stock === undefined) ? 'var(--error)' : 'var(--text-primary)' }}>
                                            {product.stock || 0}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                backgroundColor: statusConfig.bg,
                                                color: statusConfig.color,
                                                textTransform: 'uppercase'
                                            }}>
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => navigate(`/products/${product._id}/edit`)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-md)',
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--error)',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-md)',
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Pagination Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                }}>
                    <div>
                        Showing {filteredProducts.length} results
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ProductsPage;
