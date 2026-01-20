import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { createSeller } from '../services/sellerService';

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

const CreateSellerPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
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
        // Handle empty string or NaN
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
        // Clear GSTIN error when user starts typing
        if (errors['kyc.gstin']) {
            setErrors(prev => ({ ...prev, ['kyc.gstin']: '' }));
        }
    };

    const handleGoogleMapsUrlChange = (url) => {
        // Extract coordinates from Google Maps URL
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
            // Pattern: https://maps.google.com/?q=13.0418,80.2341
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

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Business name validation
        if (!formData.businessName) {
            newErrors.businessName = 'Business name is required';
        } else if (formData.businessName.length < 3) {
            newErrors.businessName = 'Business name must be at least 3 characters';
        }

        // Owner name validation
        if (!formData.ownerName) {
            newErrors.ownerName = 'Owner name is required';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }

        // Address validation
        if (!formData.address.street) {
            newErrors['address.street'] = 'Street address is required';
        }
        if (!formData.address.city) {
            newErrors['address.city'] = 'City is required';
        }
        if (!formData.address.state) {
            newErrors['address.state'] = 'State is required';
        }
        if (!formData.address.postalCode) {
            newErrors['address.postalCode'] = 'Postal code is required';
        }

        // GSTIN validation (if provided)
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

        setLoading(true);

        try {
            await createSeller(formData);
            alert('Seller created successfully!');
            navigate('/sellers');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate('/sellers')} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h1>Create New Seller</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="part-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h2>Basic Information <span className="required-mark">*</span></h2>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="seller@example.com"
                        />
                        {errors.email && <small className="error-text">{errors.email}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password <span className="required">*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Minimum 8 characters"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <small className="error-text">{errors.password}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="businessName">
                            Business Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            placeholder="Auto Parts Store"
                            maxLength={200}
                        />
                        {errors.businessName && <small className="error-text">{errors.businessName}</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="ownerName">
                            Owner Name <span className="required">*</span>
                        </label>
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

                {/* Contact & Address */}
                <div className="form-section">
                    <h2>Contact & Address <span className="required-mark">*</span></h2>

                    <div className="form-group">
                        <label htmlFor="phone">
                            Phone <span className="required">*</span>
                        </label>
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
                        <label htmlFor="street">
                            Street Address <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="street"
                            value={formData.address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            placeholder="123 MG Road"
                        />
                        {errors['address.street'] && <small className="error-text">{errors['address.street']}</small>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="form-group">
                            <label htmlFor="city">
                                City <span className="required">*</span>
                            </label>
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
                            <label htmlFor="state">
                                State <span className="required">*</span>
                            </label>
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
                            <label htmlFor="postalCode">
                                Postal Code <span className="required">*</span>
                            </label>
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

                {/* Location */}
                <div className="form-section">
                    <h2>Location</h2>

                    <div className="form-group">
                        <label htmlFor="googleMapsUrl">Google Maps URL</label>
                        <input
                            type="url"
                            id="googleMapsUrl"
                            value={formData.location.googleMapsUrl}
                            onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                            placeholder="https://maps.google.com/?q=13.0418,80.2341"
                        />
                        <small>Coordinates will be auto-extracted from the URL</small>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="form-group">
                            <label htmlFor="latitude">Latitude (Optional)</label>
                            <input
                                type="number"
                                id="latitude"
                                step="0.000001"
                                value={formData.location.latitude === null ? '' : formData.location.latitude}
                                onChange={(e) => handleLocationChange('latitude', e.target.value)}
                                placeholder="13.0418"
                            />
                            <small>Leave empty or enter manually</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="longitude">Longitude (Optional)</label>
                            <input
                                type="number"
                                id="longitude"
                                step="0.000001"
                                value={formData.location.longitude === null ? '' : formData.location.longitude}
                                onChange={(e) => handleLocationChange('longitude', e.target.value)}
                                placeholder="80.2341"
                            />
                            <small>Leave empty or enter manually</small>
                        </div>
                    </div>
                </div>

                {/* KYC & Settings */}
                <div className="form-section">
                    <h2>KYC & Settings</h2>

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
                        <small>15-character GSTIN (optional)</small>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
                                placeholder="10"
                                min="0"
                                max="100"
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
                            <span>Active</span>
                        </label>
                        <small>Set seller as active immediately</small>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/sellers')}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        <Save size={16} />
                        {loading ? 'Creating...' : 'Create Seller'}
                    </button>
                </div>
            </form>

            <style jsx>{`
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

export default CreateSellerPage;
