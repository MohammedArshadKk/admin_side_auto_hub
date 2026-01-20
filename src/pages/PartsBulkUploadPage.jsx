import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    ArrowLeft,
    Upload,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader
} from 'lucide-react';
import { bulkCreateParts } from '../services/partService';

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

const PartsBulkUploadPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const parseExcelRow = (row) => {
        const part = {
            partName: row.partName?.trim() || row['Part Name']?.trim(),
            description: row.description?.trim() || row['Description']?.trim(),
            category: row.category?.trim() || row['Category']?.trim(),
        };

        // Parse comma-separated brands into array
        const brandsInput = row.brand || row.brands || row['Brands'] || '';
        if (brandsInput) {
            part.brand = brandsInput
                .split(',')
                .map(b => b.trim())
                .filter(Boolean);
        } else {
            part.brand = [];
        }

        // Parse comma-separated part numbers into array
        const partNumbersInput = row.partNumbers || row['Part Numbers'] || '';
        if (partNumbersInput) {
            part.partNumbers = partNumbersInput
                .split(',')
                .map(pn => pn.trim())
                .filter(Boolean);
        } else {
            part.partNumbers = [];
        }

        // Optional fields
        if (row.subCategory || row['Sub Category']) {
            part.subCategory = (row.subCategory || row['Sub Category']).trim();
        }
        if (row.defaultImageUrl || row['Default Image URL']) {
            part.defaultImageUrl = (row.defaultImageUrl || row['Default Image URL']).trim();
        }
        if (row.warranty || row['Warranty']) {
            part.warranty = (row.warranty || row['Warranty']).trim();
        }

        // Weight
        const weightValue = row.weight_value || row['Weight Value'];
        if (weightValue !== undefined && weightValue !== '') {
            part.weight = {
                value: parseFloat(weightValue),
                unit: row.weight_unit || row['Weight Unit'] || 'kg'
            };
        }

        // Dimensions
        const dimLength = row.dimensions_length || row['Dimensions Length'];
        if (dimLength !== undefined && dimLength !== '') {
            part.dimensions = {
                length: parseFloat(dimLength),
                width: parseFloat(row.dimensions_width || row['Dimensions Width'] || 0),
                height: parseFloat(row.dimensions_height || row['Dimensions Height'] || 0),
                unit: row.dimensions_unit || row['Dimensions Unit'] || 'cm'
            };
        }

        // Vehicle compatibility
        const vehicles = [];
        for (let i = 1; i <= 5; i++) {
            const yearKey = `vehicle${i}_year`;
            const makeKey = `vehicle${i}_make`;
            const modelKey = `vehicle${i}_model`;
            const variantKey = `vehicle${i}_variant`;

            const year = row[yearKey] || row[`Vehicle ${i} Year`];
            const make = row[makeKey] || row[`Vehicle ${i} Make`];
            const model = row[modelKey] || row[`Vehicle ${i} Model`];
            const variant = row[variantKey] || row[`Vehicle ${i} Variant`];

            if (year && make && model) {
                const vehicle = {
                    year: parseInt(year),
                    make: make.trim(),
                    model: model.trim(),
                };
                if (variant) vehicle.variant = variant.trim();
                vehicles.push(vehicle);
            }
        }
        if (vehicles.length > 0) part.compatibleVehicles = vehicles;

        // Specifications (spec_ prefix)
        const specifications = {};
        Object.keys(row).forEach(key => {
            if (key.startsWith('spec_') || key.startsWith('Spec ')) {
                const specKey = key.replace(/^spec_/i, '').replace(/^Spec /i, '').replace(/_/g, ' ');
                specifications[specKey] = row[key].toString().trim();
            }
        });
        if (Object.keys(specifications).length > 0) part.specifications = specifications;

        // Tags
        const tagsInput = row.tags || row['Tags'];
        if (tagsInput) {
            part.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        return part;
    };

    const validatePart = (part, rowIndex) => {
        const errors = [];

        // Required fields
        if (!part.partName || part.partName.length === 0) {
            errors.push(`Row ${rowIndex + 2}: Part Name is required`);
        } else if (part.partName.length > 200) {
            errors.push(`Row ${rowIndex + 2}: Part Name must be 200 characters or less`);
        }

        if (!part.description || part.description.length === 0) {
            errors.push(`Row ${rowIndex + 2}: Description is required`);
        } else if (part.description.length > 5000) {
            errors.push(`Row ${rowIndex + 2}: Description must be 5000 characters or less`);
        }

        if (!part.category) {
            errors.push(`Row ${rowIndex + 2}: Category is required`);
        } else if (!CATEGORIES.includes(part.category)) {
            errors.push(`Row ${rowIndex + 2}: Invalid category "${part.category}". Must be one of: ${CATEGORIES.join(', ')}`);
        }

        // Brand validation (required, 1-10 items)
        if (!part.brand || part.brand.length === 0) {
            errors.push(`Row ${rowIndex + 2}: At least one brand is required`);
        } else if (part.brand.length > 10) {
            errors.push(`Row ${rowIndex + 2}: Maximum 10 brands allowed (found ${part.brand.length})`);
        } else {
            part.brand.forEach((brand, idx) => {
                if (brand.length > 100) {
                    errors.push(`Row ${rowIndex + 2}: Brand ${idx + 1} exceeds 100 characters`);
                }
            });
        }

        // Part numbers validation (optional, max 20)
        if (part.partNumbers && part.partNumbers.length > 20) {
            errors.push(`Row ${rowIndex + 2}: Maximum 20 part numbers allowed (found ${part.partNumbers.length})`);
        } else if (part.partNumbers) {
            part.partNumbers.forEach((pn, idx) => {
                if (pn.length > 50) {
                    errors.push(`Row ${rowIndex + 2}: Part Number ${idx + 1} exceeds 50 characters`);
                }
            });
        }

        return errors;
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setErrors([]);
        setParsedData([]);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setErrors(['Excel file is empty']);
                    return;
                }

                // Group rows by Part Name for multi-vehicle support
                const partsMap = new Map();
                const validationErrors = [];

                jsonData.forEach((row, index) => {
                    const partName = (row.partName || row['Part Name'] || '').trim();

                    if (!partName) {
                        validationErrors.push(`Row ${index + 2}: Part Name is required`);
                        return;
                    }

                    // Get vehicle info from current row
                    const year = row.year || row['Year'];
                    const make = row.make || row['Make'];
                    const model = row.model || row['Model'];
                    const variant = row.variant || row['Variant'];

                    const vehicle = (year && make && model) ? {
                        year: parseInt(year),
                        make: make.trim(),
                        model: model.trim(),
                        ...(variant && { variant: variant.trim() })
                    } : null;

                    if (!partsMap.has(partName)) {
                        // First row for this part - get all part details
                        const description = (row.description || row['Description'] || '').trim();
                        const category = (row.category || row['Category'] || '').trim();
                        const brandsInput = row.brand || row.brands || row['Brands'] || '';
                        const partNumbersInput = row.partNumbers || row['Part Numbers'] || '';

                        const part = {
                            partName,
                            description,
                            category,
                            brand: brandsInput ? brandsInput.split(',').map(b => b.trim()).filter(Boolean) : [],
                            partNumbers: partNumbersInput ? partNumbersInput.split(',').map(pn => pn.trim()).filter(Boolean) : [],
                            compatibleVehicles: []
                        };

                        if (vehicle) {
                            part.compatibleVehicles.push(vehicle);
                        }

                        partsMap.set(partName, part);
                    } else {
                        // Subsequent rows - just add vehicle if present
                        if (vehicle) {
                            partsMap.get(partName).compatibleVehicles.push(vehicle);
                        }
                    }
                });

                // Validate all parts
                const parts = [];
                let rowIndex = 0;

                partsMap.forEach((part) => {
                    const errors = validatePart(part, rowIndex);
                    if (errors.length > 0) {
                        validationErrors.push(...errors);
                    } else {
                        parts.push(part);
                    }
                    rowIndex++;
                });

                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                }

                setParsedData(parts);
            } catch (error) {
                console.error('Error parsing Excel:', error);
                setErrors([`Failed to parse Excel file: ${error.message}`]);
            }
        };

        reader.readAsArrayBuffer(uploadedFile);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            setErrors(['No valid parts to upload']);
            return;
        }

        setLoading(true);
        setUploadResult(null);

        try {
            const result = await bulkCreateParts(parsedData);
            setUploadResult({
                success: result.success,
                message: result.message || `Successfully uploaded parts`,
                data: result.data
            });
            // Clear form on full success
            if (result.data && result.data.failureCount === 0) {
                setParsedData([]);
                setFile(null);
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: error.message || 'Failed to upload parts'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        // Create simplified template with only essential fields
        const templateData = [
            // Example 1: Single vehicle
            {
                'Part Name': 'Premium Brake Pad Set',
                'Description': 'High-performance ceramic brake pads for superior stopping power and reduced brake dust',
                'Category': 'Brakes',
                'Brands': 'Brembo, Wagner, Raybestos',
                'Part Numbers': 'BP-CERAMIC-2024, OEM-12345, ALT-789',
                'Year': 2020,
                'Make': 'Toyota',
                'Model': 'Camry',
                'Variant': 'LE'
            },
            // Example 2: Multiple vehicles for same part
            {
                'Part Name': 'K&N High Flow Air Filter',
                'Description': 'Washable, reusable air filter for increased performance',
                'Category': 'Engine',
                'Brands': 'K&N',
                'Part Numbers': 'AF-100, 33-2304',
                'Year': 2018,
                'Make': 'Honda',
                'Model': 'Civic',
                'Variant': 'Sport'
            },
            // Additional vehicle for Air Filter (same Part Name, empty description/category/brands)
            {
                'Part Name': 'K&N High Flow Air Filter',
                'Description': '',
                'Category': '',
                'Brands': '',
                'Part Numbers': '',
                'Year': 2019,
                'Make': 'Honda',
                'Model': 'Civic',
                'Variant': 'EX'
            },
            // Another vehicle for Air Filter
            {
                'Part Name': 'K&N High Flow Air Filter',
                'Description': '',
                'Category': '',
                'Brands': '',
                'Part Numbers': '',
                'Year': 2020,
                'Make': 'Honda',
                'Model': 'Accord',
                'Variant': 'Sport'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);

        // Set column widths for better readability
        const colWidths = [
            { wch: 30 },  // Part Name
            { wch: 60 },  // Description
            { wch: 15 },  // Category
            { wch: 30 },  // Brands
            { wch: 30 },  // Part Numbers
            { wch: 8 },   // Year
            { wch: 15 },  // Make
            { wch: 15 },  // Model
            { wch: 12 },  // Variant
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Parts');
        XLSX.writeFile(wb, 'parts_bulk_upload_template.xlsx');
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
                        Bulk Parts Upload
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Upload multiple parts using Excel file
                    </p>
                </div>
            </div>

            {/* Template Download */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Download Template
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Download the Excel template with sample data and required column structure
                        </p>
                    </div>
                    <button
                        onClick={downloadTemplate}
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
                        <Download size={18} />
                        Download Template
                    </button>
                </div>
            </div>

            {/* File Upload */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    Upload Excel File
                </h3>

                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="excel-upload"
                />

                <label
                    htmlFor="excel-upload"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-primary)',
                        transition: 'all 0.2s',
                    }}
                >
                    <Upload size={32} color="var(--text-muted)" />
                    <p style={{ marginTop: '0.75rem', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {file ? file.name : 'Click to upload Excel file'}
                    </p>
                    <p style={{ marginTop: '0.25rem', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Supports .xlsx and .xls files
                    </p>
                </label>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <XCircle size={20} color="#dc2626" />
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>
                            Validation Errors ({errors.length})
                        </h4>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '13px', color: '#991b1b' }}>
                        {errors.slice(0, 10).map((error, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>{error}</li>
                        ))}
                        {errors.length > 10 && (
                            <li style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                                ... and {errors.length - 10} more errors
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Parsed Data Preview */}
            {parsedData.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Preview
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {parsedData.length} valid parts ready to upload
                            </p>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                backgroundColor: loading ? 'var(--border-color)' : 'var(--success)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Upload {parsedData.length} Parts
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Part Name</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Brands</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Part Numbers</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Vehicles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((part, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{part.partName}</td>
                                        <td style={{ padding: '0.75rem', maxWidth: '300px' }}>
                                            <div style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {part.description}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{part.category}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {part.brand.map((b, idx) => (
                                                    <span key={idx} style={{
                                                        display: 'inline-block',
                                                        padding: '2px 8px',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        color: 'var(--primary)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                                    }}>
                                                        {b}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {part.partNumbers && part.partNumbers.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {part.partNumbers.map((pn, idx) => (
                                                        <code key={idx} style={{
                                                            padding: '2px 6px',
                                                            background: '#f0f0f0',
                                                            borderRadius: '3px',
                                                            fontSize: '11px'
                                                        }}>
                                                            {pn}
                                                        </code>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {part.compatibleVehicles && part.compatibleVehicles.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {part.compatibleVehicles.map((v, idx) => (
                                                        <div key={idx} style={{
                                                            fontSize: '12px',
                                                            padding: '4px 8px',
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                                        }}>
                                                            {v.year} {v.make} {v.model}
                                                            {v.variant && ` ${v.variant}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 10 && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                                Showing 10 of {parsedData.length} parts
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
                <div style={{
                    backgroundColor: uploadResult.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${uploadResult.success ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: uploadResult.data ? '0.75rem' : 0 }}>
                        {uploadResult.success ? (
                            <CheckCircle size={20} color="#16a34a" />
                        ) : (
                            <XCircle size={20} color="#dc2626" />
                        )}
                        <p style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: uploadResult.success ? '#16a34a' : '#dc2626'
                        }}>
                            {uploadResult.message}
                        </p>
                    </div>
                    {uploadResult.data && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '0.5rem' }}>
                            <p>Total: {uploadResult.data.total} | Success: {uploadResult.data.successCount} | Failed: {uploadResult.data.failureCount}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>
                            Instructions
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '13px', color: '#1e40af' }}>
                            <li>Download the template to see the required column structure</li>
                            <li><strong>Part Name</strong>, <strong>Description</strong>, <strong>Category</strong>, and <strong>Brands</strong> are required</li>
                            <li><strong>Brands</strong>: Comma-separated (e.g., "Brembo, Wagner, ACDelco")</li>
                            <li><strong>Part Numbers</strong>: Comma-separated, optional (e.g., "BP-001, OEM-12345")</li>
                            <li><strong>Multiple Vehicles</strong>: Repeat Part Name in subsequent rows with only vehicle info filled</li>
                            <li>Example: Row 1 has full details + vehicle, Rows 2-3 have same Part Name + different vehicles</li>
                            <li>Min 1 brand, max 10 | Part numbers max 20</li>
                            <li>Valid categories: {CATEGORIES.slice(0, 5).join(', ')}, etc.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartsBulkUploadPage;
