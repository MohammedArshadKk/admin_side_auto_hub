import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { getSellerById, updateSellerAdmin } from '../services/sellerService';

const BUSINESS_TYPES = [
    'Individual',
    'Sole Proprietorship',
    'Partnership',
    'Private Limited',
    'LLP'
];

const VERIFICATION_STATUSES = [
    'PENDING',
    'VERIFIED',
    'UNDER_REVIEW',
    'REJECTED'
];

const EditSellerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        businessType: 'Individual',
        description: '',
        phone: '',
        alternatePhone: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India'
        },
        location: {
            googleMapsUrl: '',
            latitude: null,
            longitude: null
        },
        kyc: {
            gstin: ''
        },
        verificationStatus: 'PENDING',
        isActive: false,
        commissionRate: 10
    });

    useEffect(() => {
        fetchSellerData();
    }, [id]);

    const fetchSellerData = async () => {
        try {
            const response = await getSellerById(id);
            const seller = response.data.seller;

            setFormData({
                businessName: seller.businessName || '',
                ownerName: seller.ownerName || '',
                businessType: seller.businessType || 'Individual',
                description: seller.description || '',
                phone: seller.phone || '',
                alternatePhone: seller.alternatePhone || '',
                address: {
                    street: seller.address?.street || '',
                    city: seller.address?.city || '',
                    state: seller.address?.state || '',
                    postalCode: seller.address?.postalCode || '',
                    country: seller.address?.country || 'India'
                },
                location: {
                    googleMapsUrl: seller.location?.googleMapsUrl || '',
                    latitude: seller.location?.latitude || null,
                    longitude: seller.location?.longitude || null
                },
                kyc: {
                    gstin: seller.kyc?.gstin || ''
                },
                verificationStatus: seller.verificationStatus || 'PENDING',
                isActive: seller.isActive !== undefined ? seller.isActive : false,
                commissionRate: seller.commissionRate || 10
            });
        } catch (error) {
            console.error('Error fetching seller data:', error);
            alert('Failed to load seller data: ' + error.message);
            navigate('/sellers');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
        if (errors[`address.${field}`]) {
            setErrors(prev => ({ ...prev, [`address.${field}`]: '' }));
        }
    };

    const handleLocationChange = (field, value) => {
        const numValue = value === '' || isNaN(value) ? null : parseFloat(value);
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location, [field]: numValue }
        }));
    };

    const handleGSTINChange = (value) => {
        setFormData(prev => ({
            ...prev,
            kyc: { ...prev.kyc, gstin: value.toUpperCase() }
        }));
        if (errors['kyc.gstin']) {
            setErrors(prev => ({ ...prev, ['kyc.gstin']: '' }));
        }
    };

    const handleGoogleMapsUrlChange = (url) => {
        const coords = extractCoordinatesFromUrl(url);
        setFormData(prev => ({
            ...prev,
            location: {
                googleMapsUrl: url,
                latitude: coords?.latitude || null,
                longitude: coords?.longitude || null
            }
        }));
    };

    const extractCoordinatesFromUrl = (url) => {
        try {
            const regex = /q=([-\d.]+),([-\d.]+)/;
            const match = url.match(regex);
            if (match) {
                return {
                    latitude: parseFloat(match[1]),
                    longitude: parseFloat(match[2])
                };
            }
        } catch (error) {
            console.error('Error extracting coordinates:', error);
        }
        return null;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.address.street) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city) newErrors['address.city'] = 'City is required';
        if (!formData.address.state) newErrors['address.state'] = 'State is required';
        if (!formData.address.postalCode) newErrors['address.postalCode'] = 'Postal code is required';

        if (formData.kyc.gstin && formData.kyc.gstin.length > 0) {
            const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
            if (!gstinRegex.test(formData.kyc.gstin)) {
                newErrors['kyc.gstin'] = 'Invalid GSTIN format';
            }
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);
        try {
            await updateSellerAdmin(id, formData);
            alert('Seller updated successfully!');
            navigate('/sellers');
        } catch (error) {
            alert('Error updating seller: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary text-primary">
                <Loader2 className="animate-spin" size={48} />
                <span className="ml-4 text-xl">Loading seller profile...</span>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <button onClick={() => navigate('/sellers')} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h1>Edit Seller Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="part-form">
                <div className="form-section">
                    <h2>Business Information</h2>
                    <div className="form-group">
                        <label htmlFor="businessName">Business Name <span className="required">*</span></label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            placeholder="Auto Parts Store"
                        />
                        {errors.businessName && <small className="error-text">{errors.businessName}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="ownerName">Owner Name <span className="required">*</span></label>
                        <input
                            type="text"
                            id="ownerName"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                        />
                        {errors.ownerName && <small className="error-text">{errors.ownerName}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="businessType">Business Type</label>
                        <select
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleInputChange}
                        >
                            {BUSINESS_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of the business..."
                            rows={4}
                            maxLength={1000}
                        />
                        <small>{formData.description.length}/1000 characters</small>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Contact & Address</h2>
                    <div className="form-group">
                        <label htmlFor="phone">Phone <span className="required">*</span></label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 9876543210"
                        />
                        {errors.phone && <small className="error-text">{errors.phone}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="alternatePhone">Alternate Phone</label>
                        <input
                            type="tel"
                            id="alternatePhone"
                            name="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={handleInputChange}
                            placeholder="+91 9876543211"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street Address <span className="required">*</span></label>
                        <input
                            type="text"
                            id="street"
                            value={formData.address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            placeholder="123 MG Road"
                        />
                        {errors['address.street'] && <small className="error-text">{errors['address.street']}</small>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="city">City <span className="required">*</span></label>
                            <input
                                type="text"
                                id="city"
                                value={formData.address.city}
                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                placeholder="Chennai"
                            />
                            {errors['address.city'] && <small className="error-text">{errors['address.city']}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State <span className="required">*</span></label>
                            <input
                                type="text"
                                id="state"
                                value={formData.address.state}
                                onChange={(e) => handleAddressChange('state', e.target.value)}
                                placeholder="Tamil Nadu"
                            />
                            {errors['address.state'] && <small className="error-text">{errors['address.state']}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="postalCode">Postal Code <span className="required">*</span></label>
                            <input
                                type="text"
                                id="postalCode"
                                value={formData.address.postalCode}
                                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                placeholder="600017"
                            />
                            {errors['address.postalCode'] && <small className="error-text">{errors['address.postalCode']}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <input
                                type="text"
                                id="country"
                                value={formData.address.country}
                                onChange={(e) => handleAddressChange('country', e.target.value)}
                                placeholder="India"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Location Details</h2>
                    <div className="form-group">
                        <label htmlFor="googleMapsUrl">Google Maps URL</label>
                        <input
                            type="url"
                            id="googleMapsUrl"
                            value={formData.location.googleMapsUrl}
                            onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                            placeholder="https://maps.google.com/?q=13.0418,80.2341"
                        />
                        <small>Coordinates auto-extracted from URL</small>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="latitude">Latitude</label>
                            <input
                                type="number"
                                id="latitude"
                                step="0.000001"
                                value={formData.location.latitude === null ? '' : formData.location.latitude}
                                onChange={(e) => handleLocationChange('latitude', e.target.value)}
                                placeholder="13.0418"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="longitude">Longitude</label>
                            <input
                                type="number"
                                id="longitude"
                                step="0.000001"
                                value={formData.location.longitude === null ? '' : formData.location.longitude}
                                onChange={(e) => handleLocationChange('longitude', e.target.value)}
                                placeholder="80.2341"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>KYC & Admin Settings</h2>
                    <div className="form-group">
                        <label htmlFor="gstin">GSTIN</label>
                        <input
                            type="text"
                            id="gstin"
                            value={formData.kyc.gstin}
                            onChange={(e) => handleGSTINChange(e.target.value)}
                            placeholder="33AAAAA0000A1Z5"
                            maxLength={15}
                        />
                        {errors['kyc.gstin'] && <small className="error-text">{errors['kyc.gstin']}</small>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="verificationStatus">Verification Status</label>
                            <select
                                id="verificationStatus"
                                name="verificationStatus"
                                value={formData.verificationStatus}
                                onChange={handleInputChange}
                            >
                                {VERIFICATION_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="commissionRate">Commission Rate (%)</label>
                            <input
                                type="number"
                                id="commissionRate"
                                name="commissionRate"
                                value={formData.commissionRate}
                                onChange={handleInputChange}
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                            />
                            <span>Account Active</span>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/sellers')}
                        className="btn-secondary"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Updating...' : 'Update Seller Profile'}
                    </button>
                </div>
            </form>

            <style>{`
                .error-text {
                    color: var(--error);
                    font-size: 12px;
                    margin-top: 4px;
                    display: block;
                }
            `}</style>
        </div>
    );
};

export default EditSellerPage;
