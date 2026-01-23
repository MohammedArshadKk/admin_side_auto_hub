import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, AlertCircle, Upload, X } from 'lucide-react';
import { getPartById, createPart, updatePart } from '../services/partService';
import { uploadImage } from '../services/uploadService';
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
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
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
    const [existingImageUrl, setExistingImageUrl] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchPartData();
        }
    }, [id]);

    const fetchPartData = async () => {
        setFetching(true);
        try {
            const response = await getPartById(id);
            if (response.status === 'success') {
                const part = response.data.part;
                setFormData({
                    name: part.partName || '',
                    description: part.description || '',
                    category: part.category || '',
                    brand: part.brand && part.brand.length > 0 ? part.brand : [''],
                    partNumbers: part.partNumbers && part.partNumbers.length > 0 ? part.partNumbers : [''],
                    compatibleVehicles: part.compatibleVehicles || []
                });
                if (part.defaultImageUrl || (part.images && part.images[0])) {
                    setExistingImageUrl(part.defaultImageUrl || part.images[0]);
                    setImagePreview(part.defaultImageUrl || part.images[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching part:', err);
            setError(err.message || 'Failed to load part data');
        } finally {
            setFetching(false);
        }
    };

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
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
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
        setExistingImageUrl('');
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

        const cleanedBrands = formData.brand.map(b => b.trim()).filter(b => b.length > 0);
        if (cleanedBrands.length === 0) {
            setError('At least one brand is required');
            return false;
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
            let imageUrl = existingImageUrl;

            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);
            }

            const cleanedData = {
                partName: formData.name,
                description: formData.description,
                category: formData.category,
                brand: formData.brand.map(b => b.trim()).filter(b => b.length > 0),
                partNumbers: formData.partNumbers.map(pn => pn.trim()).filter(pn => pn.length > 0),
                defaultImageUrl: imageUrl || '',
                compatibleVehicles: formData.compatibleVehicles.filter(v =>
                    v.year && v.make && v.model
                ).map(v => ({
                    ...v,
                    year: parseInt(v.year)
                }))
            };

            if (isEditMode) {
                await updatePart(id, cleanedData);
            } else {
                await createPart(cleanedData);
            }

            navigate('/parts');
        } catch (err) {
            console.error('Error saving part:', err);
            setError(err.message || 'Failed to save part');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="page-container flex items-center justify-center">
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p>Loading part details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <button onClick={() => navigate('/parts')} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h1>{isEditMode ? 'Edit Global Part' : 'Add New Global Part'}</h1>
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
                <div className="form-section">
                    <h2>Basic Information <span className="required-mark">*</span></h2>

                    <div className="form-group">
                        <label htmlFor="name">Part Name <span className="required">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., High Performance Brake Pads"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description <span className="required">*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detailed technical description..."
                            rows={6}
                            maxLength={5000}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category <span className="required">*</span></label>
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

                <div className="form-section">
                    <h2>Additional Information</h2>

                    <div className="form-group">
                        <label>Brands <span className="required">*</span></label>
                        {formData.brand.map((brandName, index) => (
                            <div key={index} className="dynamic-input-row">
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => handleBrandChange(index, e.target.value)}
                                    placeholder="e.g., Brembo"
                                    required={index === 0}
                                />
                                {index > 0 && (
                                    <button type="button" onClick={() => removeBrand(index)} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.brand.length < 10 && (
                            <button type="button" onClick={addBrand} className="btn-add-item">
                                <Plus size={16} /> Add Another Brand
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Part Numbers (OEM, etc.)</label>
                        {formData.partNumbers.map((partNum, index) => (
                            <div key={index} className="dynamic-input-row">
                                <input
                                    type="text"
                                    value={partNum}
                                    onChange={(e) => handlePartNumberChange(index, e.target.value)}
                                    placeholder="e.g., BP-7788"
                                />
                                {index > 0 && (
                                    <button type="button" onClick={() => removePartNumber(index)} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.partNumbers.length < 20 && (
                            <button type="button" onClick={addPartNumber} className="btn-add-item">
                                <Plus size={16} /> Add Part Number
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Part Image</label>
                        {!imagePreview ? (
                            <div className="image-upload-zone">
                                <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                <label htmlFor="imageUpload" className="upload-label">
                                    <Upload size={32} />
                                    <span>Click to upload image</span>
                                </label>
                            </div>
                        ) : (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                                <button type="button" onClick={removeImage} className="remove-image-btn"><X size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h2>Vehicle Compatibility</h2>
                        <button type="button" onClick={addVehicle} className="btn-secondary"><Plus size={16} /> Add Vehicle</button>
                    </div>

                    {formData.compatibleVehicles.length === 0 ? (
                        <p className="empty-state">No vehicles added yet.</p>
                    ) : (
                        <div className="vehicles-list">
                            {formData.compatibleVehicles.map((vehicle, index) => (
                                <div key={index} className="vehicle-item">
                                    <div className="vehicle-header">
                                        <span>Vehicle {index + 1}</span>
                                        <button type="button" onClick={() => removeVehicle(index)} className="btn-icon-danger"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="vehicle-fields">
                                        <input type="number" value={vehicle.year} onChange={(e) => handleVehicleChange(index, 'year', e.target.value)} placeholder="Year" />
                                        <input type="text" value={vehicle.make} onChange={(e) => handleVehicleChange(index, 'make', e.target.value)} placeholder="Make" />
                                        <input type="text" value={vehicle.model} onChange={(e) => handleVehicleChange(index, 'model', e.target.value)} placeholder="Model" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/parts')} className="btn-secondary" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        <Save size={16} />
                        {loading ? 'Saving...' : (isEditMode ? 'Update Part' : 'Create Part')}
                    </button>
                </div>
            </form>
            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border-color);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PartFormPage;
