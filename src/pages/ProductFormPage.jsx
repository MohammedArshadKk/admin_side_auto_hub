import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Engine',
  'Transmission',
  'Suspension',
  'Brakes',
  'Electrical',
  'Body Parts',
  'Interior',
  'Exterior',
  'Cooling System',
  'Exhaust',
  'Fuel System',
  'Steering',
];

const CONDITIONS = [
  'New',
  'Refurbished',
  'Used - Like New',
  'Used - Good',
  'Used - Fair',
];

const STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'REJECTED',
  'ARCHIVED',
];

const CURRENCIES = ['INR', 'USD', 'EUR'];
const WEIGHT_UNITS = ['kg', 'g', 'lbs'];
const DIMENSION_UNITS = ['cm', 'in', 'm'];

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id) && id !== 'new';

  // Development mode test data
  const isDevelopment = import.meta.env.DEV;

  const [formData, setFormData] = useState({
    // Required
    name: isDevelopment ? 'Bosch High Output Alternator - 150 Amp' : '',
    description: isDevelopment
      ? 'Premium quality alternator from Bosch, delivering reliable 150 amp output for high-performance vehicles. Features advanced cooling technology and superior durability. Perfect replacement for worn-out alternators. Includes all necessary mounting hardware and detailed installation instructions.\n\nKey Features:\n- 150A high output capacity\n- OEM quality construction\n- Advanced thermal management\n- Corrosion-resistant housing\n- Pre-tested for reliability'
      : '',
    price: isDevelopment ? '12500' : '',
    category: isDevelopment ? 'Electrical' : '',
    condition: isDevelopment ? 'New' : '',
    stock: isDevelopment ? '15' : '1',
    images: [],

    // Optional - Pricing
    originalPrice: isDevelopment ? '15000' : '',
    currency: 'INR',

    // Optional - Product Details
    partNumber: isDevelopment ? 'ALT-BOSCH-150A' : '',
    brand: isDevelopment ? 'Bosch' : '',
    subCategory: isDevelopment ? 'Alternators' : '',
    warranty: isDevelopment ? '1 year manufacturer warranty' : '',

    // Optional - Vehicle Compatibility
    compatibleVehicles: isDevelopment ? [
      { year: '2018', make: 'Toyota', model: 'Camry', variant: 'LE' },
      { year: '2019', make: 'Honda', model: 'Accord', variant: 'Sport' },
    ] : [],

    // Optional - Physical Specs
    weight: { value: isDevelopment ? '5.2' : '', unit: 'kg' },
    dimensions: {
      length: isDevelopment ? '18' : '',
      width: isDevelopment ? '12' : '',
      height: isDevelopment ? '15' : '',
      unit: 'cm'
    },
    specifications: isDevelopment ? {
      'Output': '150 Amps',
      'Voltage': '12V',
      'Pulley Type': 'Serpentine',
      'Mount Type': 'Bolt-on',
      'Cooling': 'Internal Fan',
    } : {},

    // Optional - SEO
    tags: isDevelopment ? ['alternator', 'bosch', 'electrical', 'high-output', '150amp'] : [],
    slug: '',

    // Admin
    status: 'PENDING_APPROVAL',
    isFeatured: false,
  });

  // Store File objects and previews before upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updated = [...formData.compatibleVehicles];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, compatibleVehicles: updated }));
  };

  const [uploadProgress, setUploadProgress] = useState({});

  // Handle image selection (no upload yet)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    setErrors(prev => ({ ...prev, images: null }));

    // Store File objects
    setSelectedFiles(prev => [...prev, ...files]);

    // Create preview URLs for display
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      compatibleVehicles: [...prev.compatibleVehicles, { year: '', make: '', model: '', variant: '' }]
    }));
  };

  const removeVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      compatibleVehicles: prev.compatibleVehicles.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    else if (formData.name.length > 200) newErrors.name = 'Name must be 200 characters or less';

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length > 5000) newErrors.description = 'Description must be 5000 characters or less';

    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = 'Valid price is required';

    if (!formData.category) newErrors.category = 'Category is required';

    if (!formData.condition) newErrors.condition = 'Condition is required';

    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';

    if (selectedFiles.length === 0) newErrors.images = 'At least 1 image is required';
    if (selectedFiles.length > 10) newErrors.images = 'Maximum 10 images allowed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Step 1: Upload images to S3 if there are selected files
      let uploadedImageUrls = [];
      if (selectedFiles.length > 0) {
        const { uploadMultipleImages } = await import('../services/imageService');

        console.log(`Uploading ${selectedFiles.length} images to S3...`);
        uploadedImageUrls = await uploadMultipleImages(selectedFiles, (progress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress.percentage}%`);
        });


        console.log('Images uploaded successfully:', uploadedImageUrls);
      }

      // Step 2: Prepare product data with uploaded image URLs
      const { createProduct, updateProduct } = await import('../services/productService');

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        stock: parseInt(formData.stock),
        images: uploadedImageUrls, // Use newly uploaded URLs

        // Optional fields
        ...(formData.partNumber && { partNumber: formData.partNumber }),
        ...(formData.brand && { brand: formData.brand }),
        ...(formData.subCategory && { subCategory: formData.subCategory }),
        ...(formData.warranty && { warranty: formData.warranty }),
        ...(formData.originalPrice && { originalPrice: parseFloat(formData.originalPrice) }),
        ...(formData.currency && { currency: formData.currency }),

        // Vehicle compatibility
        compatibleVehicles: formData.compatibleVehicles
          .filter(v => v.year && v.make && v.model)
          .map(v => ({
            year: parseInt(v.year),
            make: v.make,
            model: v.model,
            ...(v.variant && { variant: v.variant })
          })),

        // Physical specs
        ...(formData.weight.value && {
          weight: {
            value: parseFloat(formData.weight.value),
            unit: formData.weight.unit
          }
        }),
        ...(formData.dimensions.length && {
          dimensions: {
            length: parseFloat(formData.dimensions.length),
            width: parseFloat(formData.dimensions.width),
            height: parseFloat(formData.dimensions.height),
            unit: formData.dimensions.unit
          }
        }),

        // Specifications
        ...(Object.keys(formData.specifications).length > 0 && {
          specifications: formData.specifications
        }),

        // Tags
        ...(formData.tags.length > 0 && { tags: formData.tags }),

        // Admin fields
        ...(formData.status && { status: formData.status }),
        ...(formData.isFeatured !== undefined && { isFeatured: formData.isFeatured }),
      };

      // Step 3: Create/Update product
      let response;
      if (isEditing) {
        response = await updateProduct(id, productData);
      } else {
        response = await createProduct(productData);
      }

      console.log('Product saved:', response);
      alert(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save product'
      }));
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isEditing ? 'Update product information' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Basic Information */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Basic Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Product Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Bosch High Output Alternator - 150 Amp"
                    maxLength={200}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: `1px solid ${errors.name ? 'var(--error)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                      <AlertCircle size={14} />
                      {errors.name}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {formData.name.length}/200 characters
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Description <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the product, its features, condition, and any important details..."
                    maxLength={5000}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                  {errors.description && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                      <AlertCircle size={14} />
                      {errors.description}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {formData.description.length}/5000 characters
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Category <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: `1px solid ${errors.category ? 'var(--error)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                        <AlertCircle size={14} />
                        {errors.category}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Sub-Category
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => handleChange('subCategory', e.target.value)}
                      placeholder="e.g., Alternators, Starters"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Condition <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleChange('condition', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: `1px solid ${errors.condition ? 'var(--error)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                    {errors.condition && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                        <AlertCircle size={14} />
                        {errors.condition}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Part Number
                    </label>
                    <input
                      type="text"
                      value={formData.partNumber}
                      onChange={(e) => handleChange('partNumber', e.target.value.toUpperCase())}
                      placeholder="e.g., ALT-TC-18"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      placeholder="e.g., Bosch, Denso"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Warranty
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => handleChange('warranty', e.target.value)}
                      placeholder="e.g., 6 months, 1 year"
                      maxLength={200}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section - Continued in next message due to length */}
            {/* Images */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Product Images <span style={{ color: 'var(--error)' }}>*</span>
              </h3>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />

              <label
                htmlFor="image-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  border: `2px dashed ${errors.images ? 'var(--error)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={32} color="var(--text-muted)" />
                <p style={{ marginTop: '0.75rem', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Drop images here or click to upload
                </p>
                <p style={{ marginTop: '0.25rem', fontSize: '12px', color: 'var(--text-muted)' }}>
                  1-10 images, PNG, JPG up to 5MB each
                </p>
              </label>

              {errors.images && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                  <AlertCircle size={14} />
                  {errors.images}
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                      <img src={preview} alt={`Product ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {index === 0 && (
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          padding: '0.25rem',
                          backgroundColor: 'var(--error)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compatible Vehicles */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Vehicle Compatibility
              </h3>

              {formData.compatibleVehicles.map((vehicle, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem' }}>
                    <input
                      type="number"
                      value={vehicle.year}
                      onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                      placeholder="Year"
                      min="1900"
                      max={new Date().getFullYear() + 2}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={vehicle.make}
                      onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                      placeholder="Make"
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={vehicle.model}
                      onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                      placeholder="Model"
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--error)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--error)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={vehicle.variant}
                    onChange={(e) => handleVehicleChange(index, 'variant', e.target.value)}
                    placeholder="Variant (optional)"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginTop: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addVehicle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Plus size={16} />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status & Pricing */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Pricing & Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Price <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: `1px solid ${errors.price ? 'var(--error)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                  {errors.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                      <AlertCircle size={14} />
                      {errors.price}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleChange('originalPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    For displaying discounts
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Stock Quantity <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    placeholder="1"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: `1px solid ${errors.stock ? 'var(--error)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.stock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--error)', fontSize: '12px' }}>
                      <AlertCircle size={14} />
                      {errors.stock}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleChange('isFeatured', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Mark as Featured
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <Save size={18} />
                {isEditing ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
