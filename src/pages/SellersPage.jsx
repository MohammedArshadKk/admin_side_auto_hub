import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle, Ban, Unlock, Eye, Loader } from 'lucide-react';
import { getAllSellers, verifySeller, blockSeller, unblockSeller } from '../services/sellerService';

const STATUS_COLORS = {
    PENDING: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    VERIFIED: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    REJECTED: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    UNDER_REVIEW: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
};

const SellersPage = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    const [filters, setFilters] = useState({
        search: '',
        verificationStatus: '',
        isActive: ''
    });

    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchSellers();
    }, [pagination.page, filters]);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await getAllSellers({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            setSellers(response.data.sellers || []);
            setPagination(prev => ({
                ...prev,
                ...response.pagination
            }));
        } catch (error) {
            console.error('Error fetching sellers:', error);
            alert('Error loading sellers: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    const handleStatusFilterChange = (e) => {
        setFilters(prev => ({ ...prev, verificationStatus: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleActiveFilterChange = (e) => {
        setFilters(prev => ({ ...prev, isActive: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleVerify = async (sellerId) => {
        if (!confirm('Are you sure you want to verify this seller?')) return;

        setActionLoading(sellerId);
        try {
            await verifySeller(sellerId);
            alert('Seller verified successfully!');
            fetchSellers();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleBlock = async (sellerId) => {
        const reason = prompt('Enter reason for blocking this seller:');
        if (!reason) return;

        setActionLoading(sellerId);
        try {
            await blockSeller(sellerId, reason);
            alert('Seller blocked successfully!');
            fetchSellers();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnblock = async (sellerId) => {
        if (!confirm('Are you sure you want to unblock this seller?')) return;

        setActionLoading(sellerId);
        try {
            await unblockSeller(sellerId);
            alert('Seller unblocked successfully!');
            fetchSellers();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`
            }}>
                {status}
            </span>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Sellers Management
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Manage and monitor all sellers
                    </p>
                </div>
                <button
                    onClick={() => navigate('/sellers/create')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} />
                    Add Seller
                </button>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                {/* Search */}
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search by business name, email, or owner..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    />
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }} />
                </div>

                {/* Status Filter */}
                <select
                    value={filters.verificationStatus}
                    onChange={handleStatusFilterChange}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                {/* Active Filter */}
                <select
                    value={filters.isActive}
                    onChange={handleActiveFilterChange}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        minWidth: '120px'
                    }}
                >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem' }}>Loading sellers...</p>
                </div>
            )}

            {/* Sellers Table */}
            {!loading && sellers.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Business Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Owner</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Phone</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Location</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Active</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.map((seller, index) => (
                                    <tr key={seller._id} style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        backgroundColor: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)'
                                    }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{seller.businessName}</td>
                                        <td style={{ padding: '1rem' }}>{seller.ownerName}</td>
                                        <td style={{ padding: '1rem' }}>{seller.email}</td>
                                        <td style={{ padding: '1rem' }}>{seller.phone}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {seller.address?.city && seller.address?.state
                                                ? `${seller.address.city}, ${seller.address.state}`
                                                : '-'
                                            }
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <StatusBadge status={seller.verificationStatus} />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                background: seller.isActive ? '#d1fae5' : '#fee2e2',
                                                color: seller.isActive ? '#065f46' : '#991b1b'
                                            }}>
                                                {seller.isActive ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {seller.verificationStatus === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleVerify(seller._id)}
                                                        disabled={actionLoading === seller._id}
                                                        title="Verify Seller"
                                                        style={{
                                                            padding: '6px',
                                                            background: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}

                                                {seller.isBlocked ? (
                                                    <button
                                                        onClick={() => handleUnblock(seller._id)}
                                                        disabled={actionLoading === seller._id}
                                                        title="Unblock Seller"
                                                        style={{
                                                            padding: '6px',
                                                            background: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Unlock size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlock(seller._id)}
                                                        disabled={actionLoading === seller._id}
                                                        title="Block Seller"
                                                        style={{
                                                            padding: '6px',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sellers
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page === 1 ? 0.5 : 1,
                                    fontSize: '13px'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '13px',
                                color: 'var(--text-secondary)'
                            }}>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page === pagination.pages ? 0.5 : 1,
                                    fontSize: '13px'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && sellers.length === 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        No sellers found
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {filters.search || filters.verificationStatus || filters.isActive
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first seller'
                        }
                    </p>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SellersPage;
