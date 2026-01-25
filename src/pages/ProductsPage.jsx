import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, Package2, CheckCircle2, Clock, AlertTriangle, Edit2, X, Upload, ArrowLeft, ShieldCheck, RotateCcw, Eye, ExternalLink } from 'lucide-react';
import { getAllProductsAdmin, deleteProduct, verifyProduct, updateProduct } from '../services/productService';
import { getSellerById, getAllSellers } from '../services/sellerService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModernAlertDialog from '../components/ModernAlertDialog';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const sellerIdFromUrl = searchParams.get('sellerId');
    const storeBaseUrl = import.meta.env.VITE_STORE_BASE_URL;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [sellers, setSellers] = useState([]);

    // Filters and Pagination State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [selectedSellerId, setSelectedSellerId] = useState(sellerIdFromUrl || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [order, setOrder] = useState(searchParams.get('order') || 'desc');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [limit] = useState(20);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        hasNext: false,
        hasPrev: false
    });

    const [statusDialog, setStatusDialog] = useState({
        isOpen: false,
        productId: null,
        newStatus: null,
        currentStatus: null,
        productName: ''
    });

    useEffect(() => {
        fetchSellers();
    }, []);

    useEffect(() => {
        fetchData();

        // Sync URL with state
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (selectedSellerId !== 'all') params.seller = selectedSellerId;
        if (sortBy !== 'createdAt') params.sortBy = sortBy;
        if (order !== 'desc') params.order = order;
        if (page > 1) params.page = page;
        setSearchParams(params);
    }, [selectedSellerId, statusFilter, page, searchQuery, sortBy, order]);

    const fetchSellers = async () => {
        try {
            const response = await getAllSellers({ limit: 1000 }); // Get all sellers for dropdown
            setSellers(response.data.sellers || []);
        } catch (err) {
            console.error('Error fetching sellers:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                page,
                limit,
                search: searchQuery,
            };
            if (selectedSellerId !== 'all') filters.seller = selectedSellerId;
            if (statusFilter !== 'all') filters.status = statusFilter.toUpperCase();
            if (sortBy) filters.sortBy = sortBy;
            if (order) filters.order = order;

            const response = await getAllProductsAdmin(filters);
            setProducts(response.data.products || []);
            setPagination(response.pagination || { total: 0, pages: 1, hasNext: false, hasPrev: false });

            if (selectedSellerId !== 'all') {
                const sellerResponse = await getSellerById(selectedSellerId);
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleSellerChange = (e) => {
        setSelectedSellerId(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleVerify = (productId) => {
        navigate(`/products/${productId}/verify`);
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

    const handleStatusUpdate = (product, newStatus) => {
        setStatusDialog({
            isOpen: true,
            productId: product._id,
            newStatus,
            currentStatus: product.status,
            productName: product.name
        });
    };

    const confirmStatusUpdate = async (reason) => {
        const { productId, newStatus } = statusDialog;
        try {
            const payload = { status: newStatus };
            if (newStatus === 'RESUBMIT') {
                payload.resubmitNote = reason;
            } else if (newStatus === 'REJECTED') {
                payload.rejectionReason = reason;
            }

            await updateProduct(productId, payload);
            fetchData();
            setStatusDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status: ' + err.message);
        }
    };

    const stats = [
        { title: 'Total Items', value: pagination.total.toString(), change: '+0%', icon: Package2, iconBg: '#3b82f6' },
        {
            title: 'Live Listings',
            value: products.filter(p => p.status === 'ACTIVE' || p.status === 'approved').length.toString(),
            change: '+0%',
            icon: CheckCircle2,
            iconBg: '#10b981'
        },
        {
            title: 'Pending Review',
            value: products.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length.toString(),
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
            PENDING_APPROVAL: { label: 'Pending Approval', bg: 'var(--warning-light)', color: 'var(--warning)', icon: Clock },
            REJECTED: { label: 'Rejected', bg: 'var(--error-light)', color: 'var(--error)', icon: X },
            rejected: { label: 'Rejected', bg: 'var(--error-light)', color: 'var(--error)', icon: X },
            SUSPENDED: { label: 'Suspended', bg: 'var(--bg-tertiary)', color: 'var(--text-muted)', icon: AlertTriangle },
            SOLD: { label: 'Sold', bg: 'var(--primary-light)', color: 'var(--primary)', icon: CheckCircle2 },
            RESUBMIT: { label: 'Resubmit', bg: 'var(--warning-light)', color: 'var(--warning)', icon: RotateCcw },
        };
        const normalizedStatus = status?.toUpperCase() || 'PENDING_APPROVAL';
        return configs[normalizedStatus] || configs.PENDING_APPROVAL;
    };

    const filteredProducts = products;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {selectedSellerId !== 'all' && (
                    <button
                        onClick={() => setSelectedSellerId('all')}
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
                        {selectedSellerId !== 'all' ? `Products: ${sellerInfo?.businessName || 'Loading...'}` : 'Sellers Inventory'}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {selectedSellerId !== 'all'
                            ? `Showing all catalog items added by ${sellerInfo?.ownerName || 'the seller'}.`
                            : 'Manage all platform listings from various sellers, track stock levels, and monitor approval status.'
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
                        placeholder="Search by name, brand or part number..."
                        value={searchQuery}
                        onChange={handleSearchChange}
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

                {/* Seller Filter */}
                <select
                    value={selectedSellerId}
                    onChange={handleSellerChange}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: '180px'
                    }}
                >
                    <option value="all">All Sellers</option>
                    {sellers.map(seller => (
                        <option key={seller._id} value={seller._id}>
                            {seller.businessName}
                        </option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
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
                    <option value="PENDING_APPROVAL">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                </select>

                {/* Sort Filter */}
                <select
                    value={`${sortBy}:${order}`}
                    onChange={(e) => {
                        const [newSort, newOrder] = e.target.value.split(':');
                        setSortBy(newSort);
                        setOrder(newOrder);
                        setPage(1);
                    }}
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
                    <option value="createdAt:desc">Newest First</option>
                    <option value="createdAt:asc">Oldest First</option>
                    <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option>
                    <option value="name:asc">Name: A-Z</option>
                    <option value="stock:asc">Stock: Low to High</option>
                </select>

                {(selectedSellerId !== 'all' || statusFilter !== 'all' || searchQuery || sortBy !== 'createdAt' || order !== 'desc') && (
                    <button
                        onClick={() => {
                            setSelectedSellerId('all');
                            setStatusFilter('all');
                            setSearchQuery('');
                            setSortBy('createdAt');
                            setOrder('desc');
                            setPage(1);
                        }}
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
                        Clear Filters
                    </button>
                )}

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
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Seller</th>
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
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {product.seller?.businessName || 'Unknown Seller'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {product.category}
                                            </div>
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
                                                    onClick={() => handleVerify(product._id)}
                                                    title="View Details"
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() => window.open(`${storeBaseUrl}/product/${product._id}`, '_blank')}
                                                    title="View in Store"
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <ExternalLink size={16} />
                                                </button>

                                                {(product.status === 'PENDING' || product.status === 'PENDING_APPROVAL') && (
                                                    <button
                                                        onClick={() => handleVerify(product._id)}
                                                        title="Verify Product"
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--success)',
                                                            cursor: 'pointer',
                                                            borderRadius: 'var(--radius-md)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <ShieldCheck size={18} />
                                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Verify</span>
                                                    </button>
                                                )}
                                                {!(product.status === 'PENDING' || product.status === 'PENDING_APPROVAL') && (
                                                    <select
                                                        value={product.status}
                                                        onChange={(e) => handleStatusUpdate(product, e.target.value)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--border-color)',
                                                            fontSize: '11px',
                                                            backgroundColor: 'var(--bg-card)',
                                                            color: 'var(--text-primary)',
                                                            cursor: 'pointer',
                                                            outline: 'none'
                                                        }}
                                                    >
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="SUSPENDED">Suspended</option>
                                                        <option value="SOLD">Sold</option>
                                                        <option value="REJECTED">Rejected</option>
                                                        <option value="RESUBMIT">Resubmit</option>
                                                    </select>
                                                )}
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
                        Showing {products.length} of {pagination.total} results
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)' }}>
                            Page {page} of {pagination.pages}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={!pagination.hasPrev || loading}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: (pagination.hasPrev && !loading) ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: (pagination.hasPrev && !loading) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={!pagination.hasNext || loading}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: (pagination.hasNext && !loading) ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: (pagination.hasNext && !loading) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
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

            <ModernAlertDialog
                isOpen={statusDialog.isOpen}
                onClose={() => setStatusDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusUpdate}
                title={`Change Status to ${statusDialog.newStatus}`}
                message={`Are you sure you want to change the status of "${statusDialog.productName}" to ${statusDialog.newStatus}?`}
                type={statusDialog.newStatus === 'RESUBMIT' || statusDialog.newStatus === 'REJECTED' ? 'warning' : 'info'}
                confirmText="Update Status"
                showInput={statusDialog.newStatus === 'RESUBMIT' || statusDialog.newStatus === 'REJECTED'}
                inputLabel="Reason / Remarks"
                inputPlaceholder={statusDialog.newStatus === 'RESUBMIT' ? "Explain what needs to be fixed..." : "Reason for rejection..."}
                minInputLength={3}
            />
        </div>
    );
};

export default ProductsPage;
