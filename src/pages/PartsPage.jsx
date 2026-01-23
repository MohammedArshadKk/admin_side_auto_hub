import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    SlidersHorizontal,
    Package2,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    AlertTriangle,
    Eye,
    Upload
} from 'lucide-react';
import { getAllPartsAdmin, deletePart } from '../services/partService';

const StatCard = ({ title, value, icon: Icon, iconBg }) => (
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
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {value}
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

const PartsPage = () => {
    const navigate = useNavigate();

    // State for data
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        make: '',
        model: '',
        year: '',
        sort: '-createdAt'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    useEffect(() => {
        fetchParts();
    }, [pagination.page, pagination.limit, filters, searchQuery]);

    const fetchParts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await getAllPartsAdmin(params);
            if (response.status === 'success') {
                setParts(response.data.parts || []);
                setPagination(prev => ({
                    ...prev,
                    ...response.pagination
                }));
            }
        } catch (err) {
            console.error('Error fetching parts:', err);
            setError(err.message || 'Failed to load parts catalog');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (partId) => {
        if (!window.confirm('WARNING: Deleting this part will also archive all associated seller listings. Are you sure you want to proceed?')) {
            return;
        }

        try {
            await deletePart(partId);
            fetchParts(); // Refresh list
        } catch (err) {
            alert('Error deleting part: ' + err.message);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            make: '',
            model: '',
            year: '',
            sort: '-createdAt'
        });
        setSearchQuery('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div style={{ padding: '0.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Master Parts Catalog
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Manage the global database of automotive parts and track system-wide availability.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/parts/bulk-upload')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid var(--primary)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <Upload size={18} />
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => navigate('/parts/new')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={18} />
                        Add Global Part
                    </button>
                </div>
            </div>

            {/* Stats Summary (Optional) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard title="Total Catalog Items" value={pagination.total} icon={Package2} iconBg="#3b82f6" />
                <StatCard title="Categories" value="16+" icon={Filter} iconBg="#10b981" />
                <StatCard title="Active Brands" value="45+" icon={SlidersHorizontal} iconBg="#f59e0b" />
            </div>

            {/* Search & Main Controls */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by part name, brand, or part number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            backgroundColor: isFilterVisible ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                            color: isFilterVisible ? 'var(--primary)' : 'var(--text-primary)',
                            border: `1px solid ${isFilterVisible ? 'var(--primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        <SlidersHorizontal size={18} />
                        Filters
                    </button>
                    {(Object.values(filters).some(v => v !== '' && v !== '-createdAt') || searchQuery) && (
                        <button
                            onClick={clearFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.75rem',
                                color: 'var(--error)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <X size={16} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Advanced Filters Drawer */}
                {isFilterVisible && (
                    <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div className="filter-group">
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            >
                                <option value="">All Categories</option>
                                <option value="Engine">Engine</option>
                                <option value="Brakes">Brakes</option>
                                <option value="Transmission">Transmission</option>
                                <option value="Suspension">Suspension</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Body">Body</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Brand</label>
                            <input
                                type="text"
                                name="brand"
                                placeholder="Filter by brand..."
                                value={filters.brand}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Vehicle Make</label>
                            <input
                                type="text"
                                name="make"
                                placeholder="e.g. Toyota"
                                value={filters.make}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Sort By</label>
                            <select
                                name="sort"
                                value={filters.sort}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="createdAt">Oldest First</option>
                                <option value="partName">Name (A-Z)</option>
                                <option value="-partName">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Parts Table */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '400px'
            }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(2px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                            <div className="spinner"></div>
                            Loading Catalog...
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Failed to Load Parts</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
                        <button onClick={fetchParts} style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Retry</button>
                    </div>
                )}

                {!loading && !error && parts.length === 0 && (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <Package2 size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Parts Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</p>
                    </div>
                )}

                {!error && parts.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Part Details</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Manufacturer</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ color: 'var(--text-primary)' }}>
                            {parts.map((part) => (
                                <tr key={part._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
                                                {part.images?.[0] || part.defaultImageUrl ? (
                                                    <img src={part.images?.[0] || part.defaultImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                        <Package2 size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>{part.partName}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    PN: {part.partNumber}
                                                    {part.createdBy?.name && <span style={{ marginLeft: '8px' }}>• By {part.createdBy.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {Array.isArray(part.brand) ? part.brand.map((b, i) => (
                                                <span key={i} style={{ padding: '2px 6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '11px' }}>{b}</span>
                                            )) : part.brand}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '13px' }}>{part.category}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '99px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            backgroundColor: part.isDeleted ? 'var(--error-light)' : 'var(--success-light)',
                                            color: part.isDeleted ? 'var(--error)' : 'var(--success)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {part.isDeleted ? 'Deleted' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button
                                                title="Edit Part"
                                                onClick={() => navigate(`/parts/${part._id}/edit`)}
                                                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                                                className="action-btn"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                title="Delete Part"
                                                onClick={() => handleDelete(part._id)}
                                                style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', borderRadius: '4px' }}
                                                className="action-btn-danger"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!error && parts.length > 0 && (
                    <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(pagination.page - 1) * pagination.limit + 1}</span> to <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pagination.total}</span> parts
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: pagination.page === 1 ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                                    color: pagination.page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0 0.5rem', fontSize: '14px' }}>
                                Page <span style={{ fontWeight: 600 }}>{pagination.page}</span> of {pagination.pages}
                            </div>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: pagination.page === pagination.pages ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                                    color: pagination.page === pagination.pages ? 'var(--text-muted)' : 'var(--text-primary)',
                                    cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--primary-light);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .table-row-hover:hover {
                    background-color: var(--bg-tertiary);
                }
                .action-btn:hover {
                    background-color: var(--bg-secondary) !important;
                    color: var(--primary) !important;
                }
                .action-btn-danger:hover {
                    background-color: #fee2e2 !important;
                    color: var(--error) !important;
                }
            `}</style>
        </div>
    );
};

export default PartsPage;
