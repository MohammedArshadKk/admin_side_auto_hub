import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    XCircle,
    Edit3,
    Save,
    X,
    Package,
    Truck,
    Tag,
    DollarSign,
    User,
    Clock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    ExternalLink,
    MapPin,
    Smartphone,
    Mail,
    ChevronRight,
    Search,
    Type
} from 'lucide-react';
import ModernAlertDialog from '../components/ModernAlertDialog';
import { getProductAdmin, verifyProduct, updateProduct } from '../services/productService';

const ProductVerificationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Field editing states
    const [editingField, setEditingField] = useState(null); // e.g., 'name', 'price', 'brand'
    const [fieldValue, setFieldValue] = useState('');
    const [fieldActionLoading, setFieldActionLoading] = useState(false);

    // Batch updates state
    const [pendingChanges, setPendingChanges] = useState({});

    // Status Dialog State
    const [statusDialog, setStatusDialog] = useState({
        isOpen: false,
        newStatus: null,
        currentStatus: null
    });

    // Derived state for display
    const displayProduct = product ? { ...product, ...pendingChanges } : null;

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getProductAdmin(id);
            setProduct(response.data.product);
            setPendingChanges({}); // Clear pending changes on fresh fetch
        } catch (err) {
            console.error('Error fetching product:', err);
            setError(err.message || 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldStart = (fieldName, currentVal) => {
        setEditingField(fieldName);

        let initialValue = currentVal || '';
        if (Array.isArray(currentVal)) {
            initialValue = currentVal.join('\n');
        }

        setFieldValue(initialValue);
    };

    const handleFieldCancel = () => {
        setEditingField(null);
        setFieldValue('');
    };

    const handleFieldSave = async (fieldName) => {
        setFieldActionLoading(true);
        try {
            let processedValue = fieldValue;
            let finalFieldName = fieldName;

            // Cast to numbers for specific fields
            if (['price', 'originalPrice', 'stock'].includes(fieldName)) {
                processedValue = Number(fieldValue);
            }

            // Handle complex objects if edited via text
            if (fieldName === 'dimensions') {
                const newDimensions = {
                    ...displayProduct.dimensions,
                    ...fieldValue,
                    length: Number(fieldValue.length),
                    width: Number(fieldValue.width),
                    height: Number(fieldValue.height),
                };
                setPendingChanges(prev => ({
                    ...prev,
                    dimensions: newDimensions
                }));
                finalFieldName = null;
            } else if (fieldName === 'weight') {
                const newWeight = {
                    ...displayProduct.weight,
                    ...fieldValue,
                    value: Number(fieldValue.value),
                };

                setPendingChanges(prev => ({
                    ...prev,
                    weight: newWeight
                }));
                finalFieldName = null;
            } else if (fieldName === 'features') {
                const featuresArray = fieldValue.split('\n').filter(line => line.trim() !== '');
                setPendingChanges(prev => ({
                    ...prev,
                    features: featuresArray
                }));
                finalFieldName = null;
            }

            // Standard field update
            if (finalFieldName) {
                setPendingChanges(prev => ({
                    ...prev,
                    [finalFieldName]: processedValue
                }));
            }

            setEditingField(null);
        } catch (err) {
            alert('Error updating field: ' + err.message);
        } finally {
            setFieldActionLoading(false);
        }
    };

    const handleGlobalSave = async () => {
        if (Object.keys(pendingChanges).length === 0) return;

        setActionLoading(true);
        try {
            console.log('Saving changes:', pendingChanges);
            const response = await updateProduct(id, pendingChanges);

            if (response.status === 'success' || response.data?.status === 'success' || response.data?.product) {
                await fetchProduct();
                setPendingChanges({});
                alert('Changes saved successfully!');
            } else {
                throw new Error(response.message || 'Update failed');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert(`Failed to save changes: ${err.message || 'Unknown error'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChangeRequest = (newStatus) => {
        setStatusDialog({
            isOpen: true,
            newStatus,
            currentStatus: product.status
        });
    };

    const confirmStatusChange = async (reason) => {
        const { newStatus } = statusDialog;
        try {
            const payload = { status: newStatus };
            if (newStatus === 'RESUBMIT') {
                payload.resubmitNote = reason;
            } else if (newStatus === 'REJECTED') {
                payload.rejectionReason = reason;
            }

            // Status updates are immediate, not buffered
            setActionLoading(true);
            const response = await updateProduct(id, payload);

            if (response.status === 'success' || response.data?.status === 'success' || response.data?.product) {
                await fetchProduct();
                setStatusDialog(prev => ({ ...prev, isOpen: false }));
                alert('Status updated successfully!');
            } else {
                throw new Error(response.message || 'Status update failed');
            }
        } catch (err) {
            console.error('Status update error:', err);
            alert(`Failed to update status: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-text-secondary">Loading product details...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-text-secondary">Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-12 text-center max-w-2xl mx-auto mt-12 bg-bg-card border border-border-color rounded-2xl">
                <AlertCircle className="mx-auto text-error mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p className="text-text-secondary mb-6">{error}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    return (
        <div className="verification-container">
            {/* Sticky Top Bar - Enhanced with Glassmorphism */}
            <div className="sticky-header">
                <div className="header-content">
                    <div className="header-left">
                        <button
                            onClick={() => navigate('/products')}
                            className="back-btn"
                            title="Back to Inventory"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div className="title-group">
                            <div className="status-badge-container">
                                <h1 className="header-title">{displayProduct.name}</h1>
                                <select
                                    className={`status-pill ${displayProduct.status.toLowerCase()} cursor-pointer appearance-none border-0 outline-none ring-0 focus:ring-2 focus:ring-offset-1`}
                                    value={displayProduct.status}
                                    onChange={(e) => handleStatusChangeRequest(e.target.value)}
                                    style={{
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="REJECTED">REJECTED</option>
                                    <option value="SUSPENDED">SUSPENDED</option>
                                    <option value="SOLD">SOLD</option>
                                    <option value="RESUBMIT">RESUBMIT</option>
                                </select>
                            </div>
                            <p className="product-id">SKU: {displayProduct.sku || displayProduct.partNumber || 'N/A'} • ID: {displayProduct._id}</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={handleGlobalSave}
                            disabled={actionLoading || Object.keys(pendingChanges).length === 0}
                            className={`action-btn ${Object.keys(pendingChanges).length > 0 ? 'primary' : 'secondary'}`}
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>Save Changes {Object.keys(pendingChanges).length > 0 ? `(${Object.keys(pendingChanges).length})` : ''}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="main-layout">

                {/* Left Column: Core Data */}
                <div className="content-column main">

                    {/* Media Gallery - Premium Layout */}
                    <div className="glass-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Package size={18} />
                                Media Gallery
                            </h3>
                            <button className="text-link">Edit Media</button>
                        </div>
                        <div className="media-grid">
                            {displayProduct.images?.map((img, i) => (
                                <div key={i} className="image-wrapper group">
                                    <img src={img} alt="" className="product-img" />
                                    <div className="img-overlay">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                            ))}
                            {(!displayProduct.images || displayProduct.images.length === 0) && (
                                <div className="empty-media">
                                    <Package size={40} className="empty-icon" />
                                    <p>No images provided by seller</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Identity Section - High Information Density */}
                    <Section
                        title="Product Identity"
                        icon={Tag}
                    >
                        <div className="info-display-grid">
                            <div className="col-span-full mb-4">
                                <DataBlock
                                    label="Marketplace Title"
                                    value={displayProduct.name}
                                    hero
                                    field="name"
                                    currentEditingField={editingField}
                                    onStartEdit={handleFieldStart}
                                    onSave={handleFieldSave}
                                    onCancel={handleFieldCancel}
                                    fieldValue={fieldValue}
                                    setFieldValue={setFieldValue}
                                    loading={fieldActionLoading}
                                />
                            </div>
                            <div className="col-span-full mb-6">
                                <DataBlock
                                    label="Detailed Description"
                                    value={displayProduct.description}
                                    wrap
                                    textarea
                                    field="description"
                                    currentEditingField={editingField}
                                    onStartEdit={handleFieldStart}
                                    onSave={handleFieldSave}
                                    onCancel={handleFieldCancel}
                                    fieldValue={fieldValue}
                                    setFieldValue={setFieldValue}
                                    loading={fieldActionLoading}
                                />
                            </div>
                            <DataBlock
                                label="Manufacturer Brand"
                                value={displayProduct.brand}
                                pill
                                field="brand"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                            />
                            <DataBlock
                                label="Listing Category"
                                value={displayProduct.category}
                                field="category"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                            />
                            <DataBlock
                                label="Reference SKU"
                                value={displayProduct.partNumber || displayProduct.sku}
                                secondary
                                field="partNumber"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                            />
                            <DataBlock
                                label="Stock Condition"
                                value={displayProduct.condition}
                                field="condition"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                            />
                        </div>
                        <div className="col-span-full h-12"></div>
                        <div className="col-span-full pt-4 border-t border-border-color">
                            <DataBlock
                                label="Product Remarks"
                                value={displayProduct.remarks || 'No remarks provided'}
                                field="remarks"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                editValue={displayProduct.remarks || ''}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                                textarea
                                wrap
                            />
                        </div>
                    </Section>

                    {/* Technical Specifications - Refined Grid */}
                    <Section
                        title="Technical Specifications"
                        icon={Truck}
                    >
                        <div className="specs-container">
                            <div className="spec-group">
                                <h4 className="group-label">Compatible Vehicles</h4>
                                <div className="tag-cloud">
                                    {displayProduct.compatibleVehicles?.map((v, i) => (
                                        <div key={i} className="vehicle-tag">
                                            <span className="year">{v.year}</span>
                                            <span className="make-model">{v.make} {v.model}</span>
                                        </div>
                                    ))}
                                    {(!displayProduct.compatibleVehicles || displayProduct.compatibleVehicles.length === 0) && (
                                        <div className="empty-state-small">No vehicle compatibility data</div>
                                    )}
                                </div>
                            </div>

                            <div className="metrics-row">
                                <DataBlock
                                    label="Dimensions (L x W x H)"
                                    value={displayProduct.dimensions?.length ? `${displayProduct.dimensions.length} x ${displayProduct.dimensions.width} x ${displayProduct.dimensions.height} ${displayProduct.dimensions.unit}` : 'Not Specified'}
                                    field="dimensions"
                                    currentEditingField={editingField}
                                    onStartEdit={handleFieldStart}
                                    onSave={handleFieldSave}
                                    onCancel={handleFieldCancel}
                                    fieldValue={fieldValue}
                                    setFieldValue={setFieldValue}
                                    editValue={displayProduct.dimensions || { length: '', width: '', height: '', unit: 'cm' }}
                                    loading={fieldActionLoading}
                                    dimensionsMode
                                />
                                <DataBlock
                                    label="Total Shipping Weight"
                                    value={displayProduct.weight?.value ? `${displayProduct.weight.value} ${displayProduct.weight.unit}` : 'Not Specified'}
                                    field="weight"
                                    currentEditingField={editingField}
                                    onStartEdit={handleFieldStart}
                                    onSave={handleFieldSave}
                                    onCancel={handleFieldCancel}
                                    fieldValue={fieldValue}
                                    setFieldValue={setFieldValue}
                                    editValue={displayProduct.weight || { value: '', unit: 'kg' }}
                                    loading={fieldActionLoading}
                                    weightMode
                                />
                            </div>

                            <div className="features-section">
                                <h4 className="group-label">Key Features & Highlights</h4>
                                <DataBlock
                                    label=""
                                    value={(
                                        <div className="feature-list">
                                            {displayProduct.features?.map((f, i) => (
                                                <div key={i} className="feature-item">
                                                    <div className="check-icon"><CheckCircle2 size={14} /></div>
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    textarea
                                    field="features"
                                    currentEditingField={editingField}
                                    onStartEdit={handleFieldStart}
                                    onSave={handleFieldSave}
                                    onCancel={handleFieldCancel}
                                    fieldValue={fieldValue}
                                    editValue={displayProduct.features}
                                    setFieldValue={setFieldValue}
                                    loading={fieldActionLoading}
                                    wrap
                                />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Column: Pricing & Meta */}
                <div className="content-column sidebar-col">

                    {/* Inventory & Pricing Glass Card */}
                    <div className="glass-card accent">
                        <div className="card-header border-none">
                            <h3 className="card-title">
                                <DollarSign size={18} className="text-primary" />
                                Commercials
                            </h3>
                        </div>
                        <div className="price-display">
                            <DataBlock
                                label="Asking Price"
                                value={`${displayProduct.currency} ${displayProduct.price.toLocaleString()}`}
                                field="price"
                                currentEditingField={editingField}
                                onStartEdit={handleFieldStart}
                                onSave={handleFieldSave}
                                onCancel={handleFieldCancel}
                                fieldValue={fieldValue}
                                setFieldValue={setFieldValue}
                                loading={fieldActionLoading}
                                hero
                            />
                            {displayProduct.originalPrice && (
                                <div className="mrp-display">
                                    <DataBlock
                                        label="Original List Price"
                                        value={displayProduct.originalPrice}
                                        field="originalPrice"
                                        currentEditingField={editingField}
                                        onStartEdit={handleFieldStart}
                                        onSave={handleFieldSave}
                                        onCancel={handleFieldCancel}
                                        fieldValue={fieldValue}
                                        setFieldValue={setFieldValue}
                                        loading={fieldActionLoading}
                                        secondary
                                    />
                                </div>
                            )}

                            <div className="inventory-status">
                                <div className="status-item">
                                    <Package size={16} />
                                    <DataBlock
                                        label="Inventory Count"
                                        value={displayProduct.stock}
                                        field="stock"
                                        currentEditingField={editingField}
                                        onStartEdit={handleFieldStart}
                                        onSave={handleFieldSave}
                                        onCancel={handleFieldCancel}
                                        fieldValue={fieldValue}
                                        setFieldValue={setFieldValue}
                                        loading={fieldActionLoading}
                                    />
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${Math.min(displayProduct.stock, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Intelligence Card */}
                    <div className="glass-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <User size={18} />
                                Seller Profile
                            </h3>
                        </div>
                        <div className="seller-profile-body">
                            <div className="seller-hero">
                                <div className="seller-avatar">
                                    {displayProduct.seller?.businessName?.[0]}
                                </div>
                                <div className="seller-info">
                                    <h4 className="seller-name">{displayProduct.seller?.businessName}</h4>
                                    <div className="verification-status">
                                        <ShieldCheck size={12} className="text-success" />
                                        <span>Verified Merchant</span>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-list">
                                <div className="contact-item">
                                    <User size={14} />
                                    <span>{displayProduct.seller?.ownerName}</span>
                                </div>
                                <div className="contact-item">
                                    <Mail size={14} />
                                    <span>{displayProduct.seller?.email}</span>
                                </div>
                                <div className="contact-item">
                                    <Smartphone size={14} />
                                    <span>{displayProduct.seller?.phone}</span>
                                </div>
                            </div>

                            <button className="secondary-action-btn">
                                <Search size={16} />
                                Full Inventory Audit
                            </button>
                        </div>
                    </div>

                    {/* Submission Context */}
                    <div className="context-card">
                        <div className="card-header tiny">
                            <Clock size={14} />
                            Timeline & Logistics
                        </div>
                        <div className="timeline">
                            <div className="timeline-event">
                                <div className="dot active"></div>
                                <div className="event-details">
                                    <span className="event-label">Initial Submission</span>
                                    <span className="event-time">{new Date(displayProduct.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="timeline-event">
                                <div className="dot pulse"></div>
                                <div className="event-details">
                                    <span className="event-label">Audit Required</span>
                                    <span className="event-status">{displayProduct.status}</span>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
            {/* Styles are inherited from the global system or defined via tailwind/inline */}
            <style>{`
                .verification-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 5rem;
                }

                .sticky-header {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(10, 22, 40, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border-color);
                    margin: 0 -1.5rem 2.5rem;
                    padding: 1.25rem 2rem;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .back-btn {
                    padding: 0.75rem;
                    border-radius: 12px;
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }

                .back-btn:hover {
                    background: var(--bg-elevated);
                    color: var(--text-primary);
                    transform: translateX(-2px);
                }

                .title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .status-badge-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                }

                .product-id {
                    font-family: var(--font-mono);
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .status-pill {
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-pill.pending, .status-pill.pending_approval {
                    background: rgba(245, 158, 11, 0.15);
                    color: var(--warning);
                }

                .status-pill.active {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .action-btn.primary {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
                }

                .action-btn.primary:hover:not(:disabled) {
                    background: #2563eb;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
                }

                .action-btn.secondary {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                }

                .action-btn.secondary.error {
                    color: var(--error);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .action-btn.secondary.error:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                .action-btn.secondary.warning {
                    color: var(--warning);
                    border-color: rgba(245, 158, 11, 0.2);
                }

                .action-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .main-layout {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 2.5rem;
                }

                .content-column.main {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .glass-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                }

                .glass-card.accent {
                    background: linear-gradient(135deg, var(--bg-card) 0%, #1e3a52 100%);
                    border-color: rgba(59, 130, 246, 0.2);
                }

                .card-header {
                    padding: 1.25rem 2rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .card-header.border-none { border-bottom: none; }
                .card-header.tiny { padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); gap: 0.75rem; justify-content: flex-start;}

                .card-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .text-link {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .media-grid {
                    padding: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1.25rem;
                }

                .image-wrapper {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 16px;
                    overflow: hidden;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                }

                .product-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .image-wrapper:hover .product-img {
                    transform: scale(1.08);
                }

                .img-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    color: white;
                }

                .image-wrapper:hover .img-overlay {
                    opacity: 1;
                }

                .empty-media {
                    grid-column: 1 / -1;
                    padding: 4rem 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    color: var(--text-muted);
                }

                .empty-icon {
                    margin-bottom: 1.25rem;
                    opacity: 0.2;
                }

                .info-display-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .col-span-full {
                    grid-column: 1 / -1;
                }

                .sidebar-col {
                    display: flex;
                    flex-direction: column;
                    gap: 3rem; 
                }

                /* Data Block Styles */
                .data-block { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 0.5rem; 
                    min-height: 5rem; 
                    padding: 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background: var(--bg-card);
                    transition: all 0.2s ease;
                }
                .data-block:hover {
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .data-block.hero { 
                    background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%);
                    border-color: var(--primary-light);
                }
                .block-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }
                .block-value { font-size: 1rem; font-weight: 600; color: var(--text-primary); line-height: 1.5; word-break: break-word; }
                .block-value.hero { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
                .block-value.secondary { font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-secondary); }
                .data-block.wrap .block-value { font-size: 0.95rem; font-weight: 400; line-height: 1.6; }
                .pill-value { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; background: var(--primary-light); color: var(--primary); border-radius: 6px; font-size: 0.85rem; font-weight: 700; }

                /* Specs Styles */
                .specs-container { display: flex; flex-direction: column; gap: 2.5rem; }
                .group-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
                .tag-cloud { display: flex; flex-wrap: wrap; gap: 0.75rem; }
                .vehicle-tag { padding: 0.6rem 1.25rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 14px; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s ease; }
                .vehicle-tag:hover { border-color: var(--primary); transform: translateY(-2px); }
                .vehicle-tag .year { font-weight: 800; color: var(--primary); font-size: 0.85rem; }
                .vehicle-tag .make-model { font-weight: 600; color: var(--text-primary); font-size: 0.85rem; }
                .metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
                .feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .feature-item { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; color: var(--text-secondary); }
                .check-icon { color: var(--success); padding-top: 2px; }

                /* Commercials Sidebar */
                /* Commercials Sidebar */
                .price-display { padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
                .main-price { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 0.5rem; 
                    padding: 1.5rem; 
                    background: var(--bg-primary); 
                    border-radius: 16px; 
                    border: 1px solid var(--border-color);
                    text-align: center;
                }
                .main-price .currency { 
                    font-size: 1rem; 
                    font-weight: 700; 
                    color: var(--text-muted); 
                    text-transform: uppercase; 
                    letter-spacing: 0.1em;
                }
                .inventory-status { 
                    margin-top: 0.5rem; 
                    background: var(--bg-tertiary); 
                    padding: 1.5rem; 
                    border-radius: 16px; 
                    border: 1px solid var(--border-color); 
                }
                .status-item { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    margin-bottom: 1rem; 
                }
                .progress-track { 
                    height: 8px; 
                    background: var(--bg-primary); 
                    border-radius: 100px; 
                    overflow: hidden; 
                    border: 1px solid var(--border-color);
                }
                .progress-fill { 
                    height: 100%; 
                    background: linear-gradient(90deg, var(--primary) 0%, #60a5fa 100%); 
                    border-radius: 100px; 
                }

                /* Seller Styles */
                .seller-profile-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
                .seller-hero { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 1rem; 
                    text-align: center; 
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .seller-avatar { 
                    width: 80px; 
                    height: 80px; 
                    border-radius: 24px; 
                    background: linear-gradient(135deg, var(--primary) 0%, #2563eb 100%); 
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 2rem; 
                    font-weight: 800; 
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); 
                }
                .seller-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); }
                .verification-status { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    padding: 0.4rem 1rem; 
                    background: rgba(16, 185, 129, 0.1); 
                    border: 1px solid rgba(16, 185, 129, 0.2); 
                    border-radius: 100px; 
                    font-size: 0.75rem; 
                    font-weight: 700; 
                    color: var(--success); 
                    text-transform: uppercase; 
                }
                .contact-list { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 1rem; 
                    padding: 0; 
                    background: transparent; 
                    border: none; 
                    margin: 0;
                }
                .contact-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    padding: 1rem; 
                    background: var(--bg-tertiary); 
                    border: 1px solid var(--border-color); 
                    border-radius: 12px; 
                    color: var(--text-primary); 
                    font-weight: 600; 
                    font-size: 0.9rem; 
                    transition: all 0.2s ease;
                }
                .contact-item:hover {
                    border-color: var(--primary);
                    background: var(--bg-elevated);
                    transform: translateX(4px);
                }

                /* Timeline Styles */
                .context-card { padding: 1.25rem; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid var(--border-color); }
                .timeline { display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem 0.5rem; }
                .timeline-event { display: flex; gap: 1.25rem; position: relative; }
                .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); margin-top: 0.4rem; z-index: 2; position: relative; }
                .dot.active { background: var(--primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); }
                .dot.pulse { background: var(--warning); animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
                .timeline-event::after { content: ''; position: absolute; left: 4px; top: 1.5rem; bottom: -1rem; width: 2px; background: var(--border-color); opacity: 0.5; }
                .timeline-event:last-child::after { display: none; }
                .event-details { display: flex; flex-direction: column; gap: 0.15rem; }
                .event-label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
                .event-time { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
                .event-status { font-size: 0.85rem; font-weight: 800; color: var(--warning); }

                /* Form Controls Refinement */
                .input-field-container { display: flex; flex-direction: column; gap: 0.75rem; }
                .field-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); padding-left: 0.5rem; }
                .input-wrapper { position: relative; }
                .icon-prefix { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.2s ease; }
                .input-wrapper:focus-within .icon-prefix { color: var(--primary); }
                .custom-input { 
                    width: 100%; 
                    padding: 0.85rem 1.25rem; 
                    background: var(--bg-tertiary); 
                    border: 2px solid var(--border-color); 
                    border-radius: 12px; 
                    color: var(--text-primary); 
                    font-weight: 600; 
                    font-size: 0.95rem; 
                    transition: all 0.2s ease; 
                }
                .custom-input:focus { 
                    border-color: var(--primary); 
                    outline: none; 
                    background: var(--bg-primary);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); 
                }
                .custom-textarea { 
                    width: 100%; 
                    padding: 1rem; 
                    background: var(--bg-tertiary); 
                    border: 2px solid var(--border-color); 
                    border-radius: 14px; 
                    color: var(--text-primary); 
                    font-weight: 500; 
                    font-size: 0.95rem; 
                    line-height: 1.6; 
                    min-height: 120px; 
                    transition: all 0.2s ease; 
                    resize: vertical; 
                }
                .custom-textarea:focus { 
                    border-color: var(--primary); 
                    outline: none; 
                    background: var(--bg-primary);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); 
                }

                .edit-trigger-btn {
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-tertiary);
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Status Pill Styles - Updated for Select */
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.2s;
                }
                select.status-pill {
                    cursor: pointer;
                    border: none;
                }
                select.status-pill:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }
                .edit-trigger-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--primary-light);
                }

                .action-confirm-btn {
                    padding: 0.6rem;
                    border-radius: 10px;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                }
                .action-confirm-btn.save {
                    background: var(--success);
                    color: white;
                }
                .action-confirm-btn.cancel {
                    background: var(--bg-tertiary);
                    border-color: var(--border-color);
                    color: var(--text-secondary);
                }
                .action-confirm-btn:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.1);
                }
            `}</style>
            <ModernAlertDialog
                isOpen={statusDialog.isOpen}
                onClose={() => setStatusDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusChange}
                title={`Change Status to ${statusDialog.newStatus}`}
                message={`Are you sure you want to change the status of this product to ${statusDialog.newStatus}?`}
                type={statusDialog.newStatus === 'RESUBMIT' || statusDialog.newStatus === 'REJECTED' ? 'warning' : 'info'}
                confirmText="Update Status"
                showInput={statusDialog.newStatus === 'RESUBMIT' || statusDialog.newStatus === 'REJECTED'}
                inputLabel="Reason / Remarks"
                inputPlaceholder={statusDialog.newStatus === 'RESUBMIT' ? "Explain what needs to be fixed..." : "Reason for rejection..."}
                minInputLength={3}
                loading={actionLoading}
            />
        </div>
    );
};

// --- Sub-components ---

const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-bg-card border border-border-color rounded-2xl shadow-sm">
        <div className="p-4 border-b border-border-color bg-bg-tertiary/50 flex items-center justify-between rounded-t-2xl">
            <h3 className="font-bold flex items-center gap-3 text-text-primary">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <Icon size={16} />
                </div>
                {title}
            </h3>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const DataBlock = ({ label, value, field, currentEditingField, onStartEdit, onSave, onCancel, fieldValue, setFieldValue, loading, hero, pill, secondary, wrap, textarea, editValue, statusMode, dimensionsMode, weightMode }) => {
    const isEditing = currentEditingField === field;

    return (
        <div className={`data-block ${hero ? 'hero' : ''} ${wrap ? 'wrap' : ''} ${pill ? 'pill-mode' : ''} group relative`}>
            {label && <span className="block-label">{label}</span>}

            {isEditing ? (
                <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {textarea ? (
                        <textarea
                            className="custom-textarea flex-1"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            autoFocus
                        />
                    ) : statusMode ? (
                        <div className="relative flex-1">
                            <select
                                className="custom-input flex-1 appearance-none cursor-pointer"
                                value={fieldValue}
                                onChange={(e) => setFieldValue(e.target.value)}
                                autoFocus
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="REJECTED">REJECTED</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                                <option value="SOLD">SOLD</option>
                                <option value="RESUBMIT">RESUBMIT</option>
                            </select>
                        </div>
                    ) : dimensionsMode ? (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="L"
                                className="custom-input w-16 text-center"
                                value={fieldValue.length || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, length: e.target.value })}
                            />
                            <span className="self-center text-text-muted">x</span>
                            <input
                                type="number"
                                placeholder="W"
                                className="custom-input w-16 text-center"
                                value={fieldValue.width || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, width: e.target.value })}
                            />
                            <span className="self-center text-text-muted">x</span>
                            <input
                                type="number"
                                placeholder="H"
                                className="custom-input w-16 text-center"
                                value={fieldValue.height || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, height: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Unit"
                                className="custom-input w-16 text-center"
                                value={fieldValue.unit || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, unit: e.target.value })}
                            />
                        </div>
                    ) : weightMode ? (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Val"
                                className="custom-input flex-1"
                                value={fieldValue.value || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, value: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Unit"
                                className="custom-input w-20 text-center"
                                value={fieldValue.unit || ''}
                                onChange={(e) => setFieldValue({ ...fieldValue, unit: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="relative flex-1">
                            <input
                                className="custom-input flex-1"
                                value={fieldValue}
                                onChange={(e) => setFieldValue(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => onSave(field)}
                            disabled={loading}
                            className="action-confirm-btn save"
                            title="Save"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="action-confirm-btn cancel"
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4">
                    {pill ? (
                        <span className="pill-value">{value || 'N/A'}</span>
                    ) : (
                        <div className={`block-value ${secondary ? 'secondary' : ''} ${hero ? 'hero' : ''}`}>
                            {value || <span className="empty-val">Not provided</span>}
                        </div>
                    )}
                    <button
                        onClick={() => onStartEdit(field, editValue !== undefined ? editValue : value)}
                        className="edit-trigger-btn opacity-0 group-hover:opacity-100"
                        title={`Edit ${label}`}
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};


export default ProductVerificationPage;

/* Add styling for select arrow removal if needed or trust appearance-none */
