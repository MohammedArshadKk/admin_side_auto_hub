import React, { useState, useEffect } from 'react';
import {
    Save,
    Settings,
    Truck,
    CreditCard,
    Phone,
    Mail,
    AlertCircle,
    CheckCircle,
    MapPin,
    Package,
    RefreshCw,
    ShieldCheck,
    ChevronRight,
    Globe
} from 'lucide-react';
import { fetchWithCredentials } from '../services/api';
import './ConfigPage.css';

const ConfigPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetchWithCredentials('/config');
            setConfig(response.data.config);
        } catch (error) {
            console.error('Failed to load config:', error);
            setMessage({ type: 'error', text: 'Failed to synchronize settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            await fetchWithCredentials('/config', {
                method: 'PATCH',
                body: JSON.stringify(config)
            });

            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (error) {
            console.error('Failed to save config:', error);
            setMessage({ type: 'error', text: 'Failed to deploy changes' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        setConfig(prev => {
            if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <RefreshCw size={32} className="text-primary animate-spin mb-4" />
                <p className="text-text-secondary text-sm">Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '0.5rem' }}>
                        Settings <ChevronRight size={12} /> Global Configuration
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '0.25rem' }}>
                        Manage system-wide parameters and marketplace rules.
                    </p>
                </div>

                <button
                    onClick={fetchConfig}
                    style={{
                        padding: '0.6rem 1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Shipping Configuration Card */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Truck size={18} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Shipping & Logistics</h3>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                CALCULATION MODE
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleChange('shipping', 'mode', 'DISTANCE')}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: `2px solid ${config.shipping.mode === 'DISTANCE' ? 'var(--primary)' : 'var(--border-color)'}`,
                                        backgroundColor: config.shipping.mode === 'DISTANCE' ? 'var(--primary-light)' : 'var(--bg-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{ color: config.shipping.mode === 'DISTANCE' ? 'var(--primary)' : 'var(--text-muted)' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Distance Based</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calculate fees based on GPS coordinates.</div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => handleChange('shipping', 'mode', 'FLAT')}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: `2px solid ${config.shipping.mode === 'FLAT' ? 'var(--primary)' : 'var(--border-color)'}`,
                                        backgroundColor: config.shipping.mode === 'FLAT' ? 'var(--primary-light)' : 'var(--bg-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{ color: config.shipping.mode === 'FLAT' ? 'var(--primary)' : 'var(--text-muted)' }}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Flat Rate</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Apply a fixed fee for all deliveries.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="form-label">Base Delivery Fee (₹)</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="e.g. 40"
                                    value={config.shipping.baseCharge}
                                    onChange={(e) => handleChange('shipping', 'baseCharge', Number(e.target.value))}
                                />
                                <p className="form-help">Minimum cost applied to every order.</p>
                            </div>

                            <div>
                                <label className="form-label">Free Shipping Threshold (₹)</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="e.g. 1000"
                                    value={config.shipping.freeShippingThreshold}
                                    onChange={(e) => handleChange('shipping', 'freeShippingThreshold', Number(e.target.value))}
                                />
                                <p className="form-help">Minimum order value for free shipping.</p>
                            </div>

                            {config.shipping.mode === 'DISTANCE' && (
                                <>
                                    <div>
                                        <label className="form-label">Per Kilometer Charge (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            placeholder="e.g. 10"
                                            value={config.shipping.perKmCharge}
                                            onChange={(e) => handleChange('shipping', 'perKmCharge', Number(e.target.value))}
                                        />
                                        <p className="form-help">Rate charged after free distance is exceeded.</p>
                                    </div>

                                    <div>
                                        <label className="form-label">Free Distance Radius (KM)</label>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            placeholder="e.g. 5"
                                            value={config.shipping.freeShippingDistance}
                                            onChange={(e) => handleChange('shipping', 'freeShippingDistance', Number(e.target.value))}
                                        />
                                        <p className="form-help">Distance included in the base fee.</p>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="form-label">Handling Fee (₹)</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="e.g. 20"
                                    value={config.shipping.handlingCharge || 0}
                                    onChange={(e) => handleChange('shipping', 'handlingCharge', Number(e.target.value))}
                                />
                                <p className="form-help">Fixed processing fee per order (displayed as handling).</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Payments Card */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-xl)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CreditCard size={18} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Payment Options</h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div
                                onClick={() => handleChange(null, 'codEnabled', !config.codEnabled)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: config.codEnabled ? 'var(--success)' : 'var(--text-muted)' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Cash on Delivery</span>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    backgroundColor: config.codEnabled ? 'var(--success)' : 'var(--bg-tertiary)',
                                    position: 'relative',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        position: 'absolute',
                                        top: '2px',
                                        left: config.codEnabled ? '22px' : '2px',
                                        transition: 'all 0.3s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></div>
                                </div>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.75rem', paddingLeft: '0.5rem' }}>
                                Enable or disable Cash on Delivery for all buyers globally.
                            </p>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-xl)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Globe size={18} color="var(--success)" />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Customer Support</h3>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Support Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="email"
                                        className="form-input w-full"
                                        style={{ paddingLeft: '2.75rem' }}
                                        value={config.supportEmail}
                                        onChange={(e) => handleChange(null, 'supportEmail', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Support Hotline</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        style={{ paddingLeft: '2.75rem' }}
                                        value={config.supportPhone}
                                        onChange={(e) => handleChange(null, 'supportPhone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px dashed var(--primary)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <ShieldCheck size={20} color="var(--primary)" />
                        These changes will affect all users across the platform immediately.
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.75rem 2.5rem',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                        }}
                        onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
                        onMouseLeave={e => !saving && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
                    >
                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Updating...' : 'Save All Settings'}
                    </button>
                </div>
            </form>

            {/* Notification Toast */}
            {message.text && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    padding: '1rem 1.5rem',
                    backgroundColor: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    zIndex: 1000,
                    animation: 'slideIn 0.3s ease-out forwards'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontWeight: 600 }}>{message.text}</span>
                </div>
            )}
        </div>
    );
};

export default ConfigPage;
