import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, Package2, CheckCircle2, Clock, AlertTriangle, Edit2, X, Upload } from 'lucide-react';

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
                    <span style={{ fontSize: '12px', color: change.includes('-') ? 'var(--error)' : 'var(--success)' }}>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const stats = [
        { title: 'Total Items', value: '142', change: '+12%', icon: Package2, iconBg: '#3b82f6' },
        { title: 'Live Listings', value: '89', change: '+5%', icon: CheckCircle2, iconBg: '#10b981' },
        { title: 'Pending Review', value: '12', change: 'Avg. 24h wait', icon: Clock, iconBg: '#f59e0b' },
        { title: 'Action Required', value: '5', change: 'Rejected listings', icon: AlertTriangle, iconBg: '#ef4444' },
    ];

    const products = [
        {
            id: 1,
            name: '2018 Toyota Camry Alternator',
            sku: 'ALT-TC-18',
            image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=60&h=60&fit=crop',
            category: 'Engine Parts',
            price: 85.00,
            stock: 4,
            status: 'approved',
            feedback: '-',
        },
        {
            id: 2,
            name: 'Honda Civic Side Mirror (Left)',
            sku: 'SM-HC-20',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop',
            category: 'Body Parts',
            price: 45.00,
            stock: 2,
            status: 'pending',
            feedback: 'Awaiting technical review...',
        },
        {
            id: 3,
            name: 'Ford F-150 Brake Caliper',
            sku: 'BC-FF-15',
            image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=60&h=60&fit=crop',
            category: 'Brakes',
            price: 120.00,
            stock: 0,
            status: 'rejected',
            feedback: 'Photos blurry. Re-upload.',
        },
        {
            id: 4,
            name: 'BMW 3 Series Headlight',
            sku: 'HL-B3-19',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=60&h=60&fit=crop',
            category: 'Lighting',
            price: 350.00,
            stock: 1,
            status: 'approved',
            feedback: '-',
        },
        {
            id: 5,
            name: 'Nissan Altima Radiator',
            sku: 'RAD-NA-17',
            image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=60&h=60&fit=crop',
            category: 'Cooling',
            price: 95.00,
            stock: 3,
            status: 'pending',
            feedback: 'Queue pos: 5',
        },
    ];

    const getStatusConfig = (status) => {
        const configs = {
            approved: { label: 'Approved', bg: 'var(--success-light)', color: 'var(--success)', icon: CheckCircle2 },
            pending: { label: 'Pending', bg: 'var(--warning-light)', color: 'var(--warning)', icon: Clock },
            rejected: { label: 'Rejected', bg: 'var(--error-light)', color: 'var(--error)', icon: X },
        };
        return configs[status] || configs.pending;
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Inventory Management
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Manage your listings, track stock levels, and monitor approval status.
                </p>
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
                        placeholder="Search by part name, SKU, or VIN..."
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                {/* Category Filter */}
                <select
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
                    <option>Category: All</option>
                    <option>Engine Parts</option>
                    <option>Body Parts</option>
                    <option>Brakes</option>
                    <option>Lighting</option>
                </select>

                {/* More Filters */}
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                }}>
                    <SlidersHorizontal size={16} />
                    More Filters
                </button>

                {/* Bulk Upload Button */}
                <button
                    onClick={() => navigate('/products/bulk-upload')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--primary)',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginLeft: 'auto',
                    }}
                >
                    <Upload size={18} />
                    Bulk Upload
                </button>

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
                    }}
                >
                    <Plus size={18} />
                    Add New Part
                </button>
            </div>

            {/* Products Table */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
            }}>
                <table style={{ width: '100%', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Product Details</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Stock</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Admin Feedback</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const statusConfig = getStatusConfig(product.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <tr key={product.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: 'var(--radius-md)',
                                                    objectFit: 'cover',
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                }}
                                            />
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.125rem' }}>
                                                    {product.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                    SKU: {product.sku}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {product.category}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', color: product.stock === 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                                        {product.stock}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            backgroundColor: statusConfig.bg,
                                            color: statusConfig.color,
                                        }}>
                                            <StatusIcon size={12} />
                                            {statusConfig.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {product.status === 'rejected' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--error)',
                                                }}></div>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                                    {product.feedback}
                                                </span>
                                            </div>
                                        ) : product.status === 'pending' ? (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                                {product.feedback}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button style={{
                                                padding: '0.5rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: product.status === 'rejected' ? 'var(--primary)' : 'var(--text-muted)',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                            }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button style={{
                                                padding: '0.5rem',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                            }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
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
                        Showing 1 to 5 of 142 results
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}>
                            Previous
                        </button>
                        <button style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
