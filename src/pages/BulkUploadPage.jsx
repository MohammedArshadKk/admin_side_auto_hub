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
import { bulkCreateProducts } from '../services/productService';

const CATEGORIES = [
    'Engine', 'Transmission', 'Suspension', 'Brakes', 'Electrical',
    'Body Parts', 'Interior', 'Exterior', 'Cooling System', 'Exhaust',
    'Fuel System', 'Steering'
];

const CONDITIONS = ['New', 'Refurbished', 'Used - Like New', 'Used - Good', 'Used - Fair'];

const BulkUploadPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const parseExcelRow = (row) => {
        const product = {
            name: row.name?.trim(),
            description: row.description?.trim(),
            category: row.category?.trim(),
        };

        // Optional fields
        if (row.price !== undefined && row.price !== '') product.price = parseFloat(row.price);
        if (row.condition) product.condition = row.condition.trim();
        if (row.stock !== undefined && row.stock !== '') product.stock = parseInt(row.stock);
        if (row.originalPrice !== undefined && row.originalPrice !== '') product.originalPrice = parseFloat(row.originalPrice);
        if (row.currency) product.currency = row.currency.trim();
        if (row.partNumber) product.partNumber = row.partNumber.trim();
        if (row.brand) product.brand = row.brand.trim();
        if (row.subCategory) product.subCategory = row.subCategory.trim();
        if (row.warranty) product.warranty = row.warranty.trim();
        if (row.status) product.status = row.status.trim();

        // Weight
        if (row.weight_value !== undefined && row.weight_value !== '') {
            product.weight = {
                value: parseFloat(row.weight_value),
                unit: row.weight_unit || 'kg'
            };
        }

        // Dimensions
        if (row.dimensions_length !== undefined && row.dimensions_length !== '') {
            product.dimensions = {
                length: parseFloat(row.dimensions_length),
                width: parseFloat(row.dimensions_width || 0),
                height: parseFloat(row.dimensions_height || 0),
                unit: row.dimensions_unit || 'cm'
            };
        }

        // Vehicle compatibility
        const vehicles = [];
        for (let i = 1; i <= 5; i++) {
            const yearKey = `vehicle${i}_year`;
            const makeKey = `vehicle${i}_make`;
            const modelKey = `vehicle${i}_model`;
            const variantKey = `vehicle${i}_variant`;

            if (row[yearKey] && row[makeKey] && row[modelKey]) {
                const vehicle = {
                    year: parseInt(row[yearKey]),
                    make: row[makeKey].trim(),
                    model: row[modelKey].trim(),
                };
                if (row[variantKey]) vehicle.variant = row[variantKey].trim();
                vehicles.push(vehicle);
            }
        }
        if (vehicles.length > 0) product.compatibleVehicles = vehicles;

        // Specifications (spec_ prefix)
        const specifications = {};
        Object.keys(row).forEach(key => {
            if (key.startsWith('spec_')) {
                const specKey = key.replace('spec_', '').replace(/_/g, ' ');
                specifications[specKey] = row[key].toString().trim();
            }
        });
        if (Object.keys(specifications).length > 0) product.specifications = specifications;

        // Tags
        if (row.tags) {
            product.tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        return product;
    };

    const validateProduct = (product, rowIndex) => {
        const errors = [];

        // Required fields
        if (!product.name || product.name.length === 0) {
            errors.push(`Row ${rowIndex + 2}: Name is required`);
        } else if (product.name.length > 200) {
            errors.push(`Row ${rowIndex + 2}: Name must be 200 characters or less`);
        }

        if (!product.description || product.description.length === 0) {
            errors.push(`Row ${rowIndex + 2}: Description is required`);
        } else if (product.description.length > 5000) {
            errors.push(`Row ${rowIndex + 2}: Description must be 5000 characters or less`);
        }

        if (!product.category) {
            errors.push(`Row ${rowIndex + 2}: Category is required`);
        } else if (!CATEGORIES.includes(product.category)) {
            errors.push(`Row ${rowIndex + 2}: Invalid category "${product.category}"`);
        }

        // Optional field validation
        if (product.condition && !CONDITIONS.includes(product.condition)) {
            errors.push(`Row ${rowIndex + 2}: Invalid condition "${product.condition}"`);
        }

        if (product.price !== undefined && (isNaN(product.price) || product.price < 0)) {
            errors.push(`Row ${rowIndex + 2}: Price must be a valid positive number`);
        }

        if (product.stock !== undefined && (isNaN(product.stock) || product.stock < 0)) {
            errors.push(`Row ${rowIndex + 2}: Stock must be a valid non-negative number`);
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
                const products = [];
                const validationErrors = [];

                jsonData.forEach((row, index) => {
                    const product = parseExcelRow(row);
                    const rowErrors = validateProduct(product, index);

                    if (rowErrors.length > 0) {
                        validationErrors.push(...rowErrors);
                    } else {
                        products.push(product);
                    }
                });

                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                }

                setParsedData(products);
            } catch (error) {
                console.error('Error parsing Excel:', error);
                setErrors([`Failed to parse Excel file: ${error.message}`]);
            }
        };

        reader.readAsArrayBuffer(uploadedFile);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            setErrors(['No valid products to upload']);
            return;
        }

        setLoading(true);
        setUploadResult(null);

        try {
            const result = await bulkCreateProducts(parsedData);
            setUploadResult({
                success: result.success,
                message: result.message || `Successfully uploaded products`,
                data: result.data
            });
            // Clear form on full success
            if (result.data.failureCount === 0) {
                setParsedData([]);
                setFile(null);
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: error.message || 'Failed to upload products'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        // Create template data
        const templateData = [
            {
                name: 'Bosch High Output Alternator',
                description: 'Premium alternator with 150A output for high-performance vehicles',
                category: 'Electrical',
                price: 12500,
                condition: 'New',
                stock: 15,
                originalPrice: 15000,
                currency: 'INR',
                partNumber: 'ALT-BOSCH-150A',
                brand: 'Bosch',
                subCategory: 'Alternators',
                warranty: '1 year',
                weight_value: 5.2,
                weight_unit: 'kg',
                dimensions_length: 18,
                dimensions_width: 12,
                dimensions_height: 15,
                dimensions_unit: 'cm',
                vehicle1_year: 2018,
                vehicle1_make: 'Toyota',
                vehicle1_model: 'Camry',
                vehicle1_variant: 'LE',
                vehicle2_year: 2019,
                vehicle2_make: 'Honda',
                vehicle2_model: 'Accord',
                vehicle2_variant: 'Sport',
                spec_Output: '150 Amps',
                spec_Voltage: '12V',
                tags: 'alternator,bosch,electrical',
                status: 'PENDING_APPROVAL'
            },
            {
                name: 'Standard Brake Pad Set',
                description: 'Quality brake pads for front wheels',
                category: 'Brakes',
                price: 3500,
                condition: 'New',
                stock: 50
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);

        // Add data validation dropdowns for enum columns
        const range = XLSX.utils.decode_range(ws['!ref']);

        // Define dropdown options
        const statuses = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'];
        const currencies = ['INR', 'USD', 'EUR'];
        const weightUnits = ['kg', 'g', 'lbs'];
        const dimensionUnits = ['cm', 'in', 'm'];

        // Add validations for all rows (starting from row 2, as row 1 is header)
        for (let row = 1; row <= 100; row++) {
            // Category dropdown (column C)
            const categoryCell = XLSX.utils.encode_cell({ r: row, c: 2 });
            if (!ws[categoryCell]) ws[categoryCell] = { t: 's', v: '' };
            ws[categoryCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: false,
                    showDropDown: true,
                    formulae: [`"${CATEGORIES.join(',')}"`]
                }
            };

            // Condition dropdown (column E)
            const conditionCell = XLSX.utils.encode_cell({ r: row, c: 4 });
            if (!ws[conditionCell]) ws[conditionCell] = { t: 's', v: '' };
            ws[conditionCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: true,
                    showDropDown: true,
                    formulae: [`"${CONDITIONS.join(',')}"`]
                }
            };

            // Currency dropdown
            const currencyCol = Object.keys(templateData[0]).indexOf('currency');
            const currencyCell = XLSX.utils.encode_cell({ r: row, c: currencyCol });
            if (!ws[currencyCell]) ws[currencyCell] = { t: 's', v: '' };
            ws[currencyCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: true,
                    showDropDown: true,
                    formulae: [`"${currencies.join(',')}"`]
                }
            };

            // Weight unit dropdown
            const weightUnitCol = Object.keys(templateData[0]).indexOf('weight_unit');
            const weightUnitCell = XLSX.utils.encode_cell({ r: row, c: weightUnitCol });
            if (!ws[weightUnitCell]) ws[weightUnitCell] = { t: 's', v: '' };
            ws[weightUnitCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: true,
                    showDropDown: true,
                    formulae: [`"${weightUnits.join(',')}"`]
                }
            };

            // Dimension unit dropdown
            const dimUnitCol = Object.keys(templateData[0]).indexOf('dimensions_unit');
            const dimUnitCell = XLSX.utils.encode_cell({ r: row, c: dimUnitCol });
            if (!ws[dimUnitCell]) ws[dimUnitCell] = { t: 's', v: '' };
            ws[dimUnitCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: true,
                    showDropDown: true,
                    formulae: [`"${dimensionUnits.join(',')}"`]
                }
            };

            // Status dropdown
            const statusCol = Object.keys(templateData[0]).indexOf('status');
            const statusCell = XLSX.utils.encode_cell({ r: row, c: statusCol });
            if (!ws[statusCell]) ws[statusCell] = { t: 's', v: '' };
            ws[statusCell].s = {
                dataValidation: {
                    type: 'list',
                    allowBlank: true,
                    showDropDown: true,
                    formulae: [`"${statuses.join(',')}"`]
                }
            };
        }

        // Set column widths for better readability
        const colWidths = [
            { wch: 30 },  // name
            { wch: 50 },  // description
            { wch: 15 },  // category
            { wch: 10 },  // price
            { wch: 15 },  // condition
            { wch: 10 },  // stock
            { wch: 12 },  // originalPrice
            { wch: 10 },  // currency
            { wch: 18 },  // partNumber
            { wch: 15 },  // brand
            { wch: 15 },  // subCategory
            { wch: 20 },  // warranty
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'product_upload_template.xlsx');
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
                        Bulk Product Upload
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Upload multiple products using Excel file
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
                        {errors.map((error, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>{error}</li>
                        ))}
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
                                {parsedData.length} valid products ready to upload
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
                                    Upload {parsedData.length} Products
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Condition</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((product, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.75rem' }}>{product.name}</td>
                                        <td style={{ padding: '0.75rem' }}>{product.category}</td>
                                        <td style={{ padding: '0.75rem' }}>{product.price ? `₹${product.price}` : '-'}</td>
                                        <td style={{ padding: '0.75rem' }}>{product.condition || '-'}</td>
                                        <td style={{ padding: '0.75rem' }}>{product.stock !== undefined ? product.stock : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 10 && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                                Showing 10 of {parsedData.length} products
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                            <li>Only <strong>name</strong>, <strong>description</strong>, and <strong>category</strong> are required</li>
                            <li>Price, condition, and stock are optional (defaults will be applied)</li>
                            <li>Images are not supported in bulk upload - add them later via individual product edit</li>
                            <li>Valid categories: Engine, Transmission, Suspension, Brakes, Electrical, etc.</li>
                            <li>Maximum 100 products per upload recommended</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadPage;
