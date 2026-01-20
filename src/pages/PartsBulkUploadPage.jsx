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

                // Parse and validate
                const parts = [];
                const validationErrors = [];

                jsonData.forEach((row, index) => {
                    const part = parseExcelRow(row);
                    const rowErrors = validatePart(part, index);

                    if (rowErrors.length > 0) {
                        validationErrors.push(...rowErrors);
                    } else {
                        parts.push(part);
                    }
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
        // Create template data
        const templateData = [
            {
                'Part Name': 'Premium Brake Pad Set',
                'Description': 'High-performance ceramic brake pads for superior stopping power and reduced brake dust',
                'Category': 'Brakes',
                'Brands': 'Brembo, Wagner, Raybestos',
                'Part Numbers': 'BP-CERAMIC-2024, OEM-12345, ALT-789',
                'Sub Category': 'Brake Pads',
                'Warranty': '2 years or 50,000 km',
                'Weight Value': 2.5,
                'Weight Unit': 'kg',
                'Dimensions Length': 25,
                'Dimensions Width': 15,
                'Dimensions Height': 5,
                'Dimensions Unit': 'cm',
                'Vehicle 1 Year': 2020,
                'Vehicle 1 Make': 'Toyota',
                'Vehicle 1 Model': 'Camry',
                'Vehicle 1 Variant': 'LE',
                'Vehicle 2 Year': 2021,
                'Vehicle 2 Make': 'Toyota',
                'Vehicle 2 Model': 'Camry',
                'Vehicle 2 Variant': 'SE',
                'Spec Material': 'Ceramic',
                'Spec Position': 'Front',
                'Tags': 'brake, ceramic, toyota, front'
            },
            {
                'Part Name': 'K&N High Flow Air Filter',
                'Description': 'Washable, reusable air filter for increased performance',
                'Category': 'Engine',
                'Brands': 'K&N',
                'Part Numbers': 'AF-100, 33-2304',
                'Sub Category': 'Air Filters',
                'Warranty': '10 years / 1 million miles',
                'Vehicle 1 Year': 2018,
                'Vehicle 1 Make': 'Honda',
                'Vehicle 1 Model': 'Civic',
                'Tags': 'air filter, performance, reusable'
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
            { wch: 15 },  // Sub Category
            { wch: 20 },  // Warranty
            { wch: 12 },  // Weight Value
            { wch: 12 },  // Weight Unit
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
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Brands</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Part Numbers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((part, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{part.partName}</td>
                                        <td style={{ padding: '0.75rem' }}>{part.category}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {part.brand.join(', ')}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {part.partNumbers && part.partNumbers.length > 0
                                                ? part.partNumbers.join(', ')
                                                : '-'}
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
                            <li>For <strong>Brands</strong>: Use comma-separated values (e.g., "Brembo, Wagner, ACDelco")</li>
                            <li>For <strong>Part Numbers</strong>: Use comma-separated values (e.g., "BP-001, OEM-12345")</li>
                            <li>Minimum 1 brand required, maximum 10 brands allowed</li>
                            <li>Part numbers are optional, maximum 20 allowed</li>
                            <li>Valid categories: {CATEGORIES.slice(0, 5).join(', ')}, etc.</li>
                            <li>Maximum 100 parts per upload recommended</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartsBulkUploadPage;
