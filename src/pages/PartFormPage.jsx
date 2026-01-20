import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, AlertCircle, Upload, X } from 'lucide-react';
import '../styles/part-form.css';

const CATEGORIES = [
    'Engine',
    'Transmission',
    'Suspension',
    'Brakes',
    'Electrical',
    'Body',
    'Interior',
    'Exterior',
    'Exhaust',
    'Cooling',
    'Fuel System',
    'Steering',
    'Wheels & Tires',
    'Lighting',
    'HVAC',
    'Other',
];

const PartFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        brand: [''],           // Array with initial empty string (required, 1-10)
        partNumbers: [''],     // Array with initial empty string (optional, 0-20)
        compatibleVehicles: []
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Brand handlers
    const handleBrandChange = (index, value) => {
        const newBrands = [...formData.brand];
        newBrands[index] = value;
        setFormData({ ...formData, brand: newBrands });
    };

    const addBrand = () => {
        if (formData.brand.length < 10) {
            setFormData({ ...formData, brand: [...formData.brand, ''] });
        }
    };

    const removeBrand = (index) => {
        if (formData.brand.length > 1) {
            const newBrands = formData.brand.filter((_, i) => i !== index);
            setFormData({ ...formData, brand: newBrands });
        }
    };

    // Part Number handlers
    const handlePartNumberChange = (index, value) => {
        const newPartNumbers = [...formData.partNumbers];
        newPartNumbers[index] = value;
        setFormData({ ...formData, partNumbers: newPartNumbers });
    };

    const addPartNumber = () => {
        if (formData.partNumbers.length < 20) {
            setFormData({ ...formData, partNumbers: [...formData.partNumbers, ''] });
        }
    };

    const removePartNumber = (index) => {
        const newPartNumbers = formData.partNumbers.filter((_, i) => i !== index);
        setFormData({ ...formData, partNumbers: newPartNumbers });
    };

    const addVehicle = () => {
        setFormData(prev => ({
            ...prev,
            compatibleVehicles: [
                ...prev.compatibleVehicles,
                { year: '', make: '', model: '', variant: '' }
            ]
        }));
    };

    const removeVehicle = (index) => {
        setFormData(prev => ({
            ...prev,
            compatibleVehicles: prev.compatibleVehicles.filter((_, i) => i !== index)
        }));
    };

    const handleVehicleChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            compatibleVehicles: prev.compatibleVehicles.map((vehicle, i) =>
                i === index ? { ...vehicle, [field]: value } : vehicle
            )
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Part name is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return false;
        }
        if (!formData.category) {
            setError('Category is required');
            return false;
        }

        // Validate brands (required, 1-10)
        const cleanedBrands = formData.brand.map(b => b.trim()).filter(b => b.length > 0);
        if (cleanedBrands.length === 0) {
            setError('At least one brand is required');
            return false;
        }
        if (cleanedBrands.length > 10) {
            setError('Maximum 10 brands allowed');
            return false;
        }

        // Validate part numbers (optional, max 20)
        const cleanedPartNumbers = formData.partNumbers.map(pn => pn.trim()).filter(pn => pn.length > 0);
        if (cleanedPartNumbers.length > 20) {
            setError('Maximum 20 part numbers allowed');
            return false;
        }

        // Validate vehicles if any are added
        for (const vehicle of formData.compatibleVehicles) {
            if (vehicle.year && (vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 2)) {
                setError('Invalid vehicle year');
                return false;
            }
            if (vehicle.year && (!vehicle.make || !vehicle.model)) {
                setError('Vehicle make and model are required when year is specified');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let imageUrl = '';

            // Step 1: Upload image to S3 if selected
            if (selectedFile) {
                const { uploadImage } = await import('../services/uploadService');
                imageUrl = await uploadImage(selectedFile);
            }

            // Step 2: Create part with image URL
            const { createPart } = await import('../services/partService');

            const cleanedData = {
                partName: formData.name,
                description: formData.description,
                category: formData.category,
                // Clean up brand array - remove empty entries
                brand: formData.brand
                    .map(b => b.trim())
                    .filter(b => b.length > 0),
                // Clean up part numbers array - remove empty entries
                partNumbers: formData.partNumbers
                    .map(pn => pn.trim())
                    .filter(pn => pn.length > 0),
                defaultImageUrl: imageUrl || '', // Single default image URL
                compatibleVehicles: formData.compatibleVehicles.filter(v =>
                    v.year && v.make && v.model
                ).map(v => ({
                    ...v,
                    year: parseInt(v.year)
                }))
            };

            await createPart(cleanedData);

            // Success - navigate back to products
            navigate('/products');
        } catch (err) {
            console.error('Error creating part:', err);
            setError(err.message || 'Failed to create part');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate('/products')} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h1>Add New Part</h1>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="part-form">
                {/* Required Fields Section */}
                <div className="form-section">
                    <h2>Basic Information <span className="required-mark">*</span></h2>

                    {/* Part Name */}
                    <div className="form-group">
                        <label htmlFor="name">
                            Part Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Bosch High Output Alternator - 150 Amp"
                            maxLength={200}
                            required
                        />
                        <small>{formData.name.length}/200 characters</small>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">
                            Description <span className="required">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detailed description of the part, specifications, features, etc."
                            rows={6}
                            maxLength={5000}
                            required
                        />
                        <small>{formData.description.length}/5000 characters</small>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label htmlFor="category">
                            Category <span className="required">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Optional Fields Section */}
                <div className="form-section">
                    <h2>Additional Information</h2>

                    {/* Brand - Multiple Brands (1-10 required) */}
                    <div className="form-group">
                        <label>
                            Brands <span className="required">*</span>
                            <small style={{ marginLeft: '8px', fontWeight: 'normal' }}>
                                (1-10 brands required)
                            </small>
                        </label>
                        {formData.brand.map((brandName, index) => (
                            <div key={index} className="dynamic-input-row">
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => handleBrandChange(index, e.target.value)}
                                    placeholder={`Brand ${index + 1} (e.g., Bosch, Denso, ACDelco)`}
                                    required={index === 0}
                                    maxLength={100}
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBrand(index)}
                                        className="btn-icon-danger"
                                        title="Remove brand"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.brand.length < 10 && (
                            <button
                                type="button"
                                onClick={addBrand}
                                className="btn-add-item"
                            >
                                <Plus size={16} />
                                Add Another Brand
                            </button>
                        )}
                    </div>

                    {/* Part Numbers - Multiple Part Numbers (0-20 optional) */}
                    <div className="form-group">
                        <label>
                            Part Numbers (Optional)
                            <small style={{ marginLeft: '8px', fontWeight: 'normal' }}>
                                (Max 20 part numbers)
                            </small>
                        </label>
                        <small style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                            OEM numbers, manufacturer codes, or alternative part numbers
                        </small>
                        {formData.partNumbers.map((partNum, index) => (
                            <div key={index} className="dynamic-input-row">
                                <input
                                    type="text"
                                    value={partNum}
                                    onChange={(e) => handlePartNumberChange(index, e.target.value)}
                                    placeholder={`Part Number ${index + 1} (e.g., BP-CERAMIC-2024, OEM-12345)`}
                                    maxLength={50}
                                />
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removePartNumber(index)}
                                        className="btn-icon-danger"
                                        title="Remove part number"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.partNumbers.length < 20 && (
                            <button
                                type="button"
                                onClick={addPartNumber}
                                className="btn-add-item"
                            >
                                <Plus size={16} />
                                Add Part Number
                            </button>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label>Part Image (Optional)</label>

                        {!imagePreview ? (
                            <div className="image-upload-zone">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="imageUpload" className="upload-label">
                                    <Upload size={32} />
                                    <span>Click to upload image</span>
                                    <small>Max 5MB • Auto-compressed to 1MB</small>
                                </label>
                            </div>
                        ) : (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Part preview" className="image-preview" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="remove-image-btn"
                                    title="Remove image"
                                >
                                    <X size={16} />
                                </button>
                                <div className="image-info">
                                    <span>{selectedFile?.name}</span>
                                    <span>{(selectedFile?.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vehicle Compatibility Section */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Vehicle Compatibility</h2>
                        <button
                            type="button"
                            onClick={addVehicle}
                            className="btn-secondary"
                        >
                            <Plus size={16} />
                            Add Vehicle
                        </button>
                    </div>

                    {formData.compatibleVehicles.length === 0 ? (
                        <p className="empty-state">
                            No vehicles added yet. Click "Add Vehicle" to specify compatible vehicles.
                        </p>
                    ) : (
                        <div className="vehicles-list">
                            {formData.compatibleVehicles.map((vehicle, index) => (
                                <div key={index} className="vehicle-item">
                                    <div className="vehicle-header">
                                        <span className="vehicle-number">Vehicle {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeVehicle(index)}
                                            className="btn-icon-danger"
                                            title="Remove vehicle"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="vehicle-fields">
                                        <div className="form-group">
                                            <label>Year</label>
                                            <input
                                                type="number"
                                                value={vehicle.year}
                                                onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                                                placeholder="2020"
                                                min="1900"
                                                max={new Date().getFullYear() + 2}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Make</label>
                                            <input
                                                type="text"
                                                value={vehicle.make}
                                                onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                                                placeholder="Toyota"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Model</label>
                                            <input
                                                type="text"
                                                value={vehicle.model}
                                                onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                                                placeholder="Camry"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Variant (Optional)</label>
                                            <input
                                                type="text"
                                                value={vehicle.variant}
                                                onChange={(e) => handleVehicleChange(index, 'variant', e.target.value)}
                                                placeholder="LE 2.5L"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
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
                        {loading ? 'Creating Part...' : 'Create Part'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PartFormPage;
