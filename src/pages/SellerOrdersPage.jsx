import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ArrowLeft,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    BadgeIndianRupee
} from 'lucide-react';
import { getAllOrders, updateAdminOrderStatus } from '../services/adminOrderService';
import { getAllSellers } from '../services/sellerService';
import ModernAlertDialog from '../components/ModernAlertDialog';

const STATUS_CONFIG = {
    payment_pending: { label: 'Payment Pending', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
    payment_failed: { label: 'Payment Failed', color: '#ef4444', bg: '#fee2e2', icon: XCircle },
    pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
    confirmed: { label: 'Confirmed', color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
    processing: { label: 'Processing', color: '#3b82f6', bg: '#dbeafe', icon: Package },
    shipped: { label: 'Shipped', color: '#6366f1', bg: '#e0e7ff', icon: Truck },
    delivered: { label: 'Delivered', color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: '#9ca3af', bg: '#f3f4f6', icon: XCircle },
    returned: { label: 'Returned', color: '#7c3aed', bg: '#f3e8ff', icon: AlertTriangle }
};

const SellerOrdersPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sellerIdFromUrl = searchParams.get('sellerId');

    const [orders, setOrders] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Filters & Pagination
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [sellerId, setSellerId] = useState(sellerIdFromUrl || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const [statusDialog, setStatusDialog] = useState({
        isOpen: false,
        orderId: null,
        newStatus: '',
        orderNumber: ''
    });

    useEffect(() => {
        fetchSellers();
    }, []);

    useEffect(() => {
        fetchOrders();

        // Update URL
        const params = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (sellerId) params.sellerId = sellerId;
        if (page > 1) params.page = page;
        setSearchParams(params);
    }, [page, status, sellerId, search]);

    const fetchSellers = async () => {
        try {
            const response = await getAllSellers({ limit: 1000 });
            setSellers(response.data.sellers || []);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrders({
                page,
                limit: 20,
                status,
                sellerId,
                search
            });
            setOrders(response.data.orders || []);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (orderId, newStatus, orderNumber) => {
        setStatusDialog({
            isOpen: true,
            orderId,
            newStatus,
            orderNumber
        });
    };

    const confirmStatusUpdate = async (note) => {
        setActionLoading(statusDialog.orderId);
        try {
            await updateAdminOrderStatus(statusDialog.orderId, statusDialog.newStatus, note);
            setStatusDialog(prev => ({ ...prev, isOpen: false }));
            fetchOrders();
        } catch (error) {
            alert('Error updating status: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.color}30`
            }}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {sellerId && (
                        <button onClick={() => setSellerId('')} style={{ padding: '8px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Orders Management
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Monitor and manage all seller orders across the platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'var(--bg-card)',
                padding: '1rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search Order #..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                </div>

                <select
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    style={{ padding: '10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minWidth: '180px' }}
                >
                    <option value="">All Sellers</option>
                    {sellers.map(s => <option key={s._id} value={s._id}>{s.businessName}</option>)}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ padding: '10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minWidth: '150px' }}
                >
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Order Details</th>
                            <th style={{ padding: '1rem' }}>Seller</th>
                            <th style={{ padding: '1rem' }}>Buyer</th>
                            <th style={{ padding: '1rem' }}>Total</th>
                            <th style={{ padding: '1rem' }}>Payment</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</td>
                            </tr>
                        ) : orders.map(order => (
                            <tr key={order._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{order.orderNumber}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 500 }}>{order.seller?.businessName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Owner: {order.seller?.ownerName}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 500 }}>{order.buyer?.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.buyer?.email}</div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{order.totalAmount}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                                        {order.paymentMethod === 'online' ? <CreditCard size={14} /> : <BadgeIndianRupee size={14} />}
                                        {order.paymentMethod}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{order.paymentStatus}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <StatusBadge status={order.orderStatus} />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value, order.orderNumber)}
                                            style={{ fontSize: '11px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirm</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Ship</option>
                                            <option value="delivered">Deliver</option>
                                            <option value="cancelled">Cancel</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '13px' }}>
                <div>Showing {orders.length} orders</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span>Page {page} of {pagination.pages}</span>
                    <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: page === pagination.pages ? 'not-allowed' : 'pointer' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <ModernAlertDialog
                isOpen={statusDialog.isOpen}
                onClose={() => setStatusDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusUpdate}
                title={`Update Order Status`}
                message={`Are you sure you want to change Order #${statusDialog.orderNumber} to ${statusDialog.newStatus?.toUpperCase()}?`}
                confirmText="Update Status"
                showInput={true}
                inputPlaceholder="Add a note for this status change..."
            />
        </div>
    );
};

export default SellerOrdersPage;
