import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, Loader2, X } from 'lucide-react';

const ModernAlertDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showInput = false,
    inputPlaceholder = 'Enter reason...',
    inputLabel = 'Reason',
    initialValue = '',
    loading = false,
    minInputLength = 0,
    apiError = ''
}) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue(initialValue);
            setLocalError('');
        }
    }, [isOpen, initialValue]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen || loading) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                if (showInput && document.activeElement === document.querySelector('textarea')) {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleConfirm();
                    }
                } else {
                    e.preventDefault();
                    handleConfirm();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, inputValue, showInput]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (showInput && inputValue.trim().length < minInputLength) {
            setLocalError(`${inputLabel} must be at least ${minInputLength} characters.`);
            return;
        }
        onConfirm(inputValue);
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle color="#ef4444" size={24} />,
                    accent: '#dc2626',
                    bgIcon: '#fef2f2',
                    btnColor: '#dc2626',
                    btnHover: '#b91c1c'
                };
            case 'success':
                return {
                    icon: <CheckCircle2 color="#22c55e" size={24} />,
                    accent: '#16a34a',
                    bgIcon: '#f0fdf4',
                    btnColor: '#16a34a',
                    btnHover: '#15803d'
                };
            case 'info':
                return {
                    icon: <Info color="#3b82f6" size={24} />,
                    accent: '#2563eb',
                    bgIcon: '#eff6ff',
                    btnColor: '#2563eb',
                    btnHover: '#1d4ed8'
                };
            default: // warning
                return {
                    icon: <AlertTriangle color="#f59e0b" size={24} />,
                    accent: '#d97706',
                    bgIcon: '#fffbeb',
                    btnColor: '#d97706',
                    btnHover: '#b45309'
                };
        }
    };

    const styles = getTypeStyles();
    const displayError = localError || apiError;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '1.25rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                    width: '100%',
                    maxWidth: '480px',
                    overflow: 'hidden',
                    position: 'relative',
                    animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual Accent Bar */}
                <div style={{ height: '6px', width: '100%', backgroundColor: styles.accent }} />

                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '1rem',
                            backgroundColor: styles.bgIcon,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {styles.icon}
                        </div>
                        <div style={{ paddingTop: '0.25rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a202c', margin: 0, lineHeight: 1.1 }}>{title}</h3>
                            <p style={{ fontSize: '1rem', color: '#4a5568', marginTop: '0.75rem', lineHeight: 1.6 }}>
                                {message}
                            </p>
                        </div>
                    </div>

                    {showInput && (
                        <div style={{ marginTop: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.075em' }}>
                                    {inputLabel}
                                </label>
                            </div>
                            <textarea
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    if (localError) setLocalError('');
                                }}
                                placeholder={inputPlaceholder}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    border: `2px solid ${displayError ? '#fc8181' : '#edf2f7'}`,
                                    outline: 'none',
                                    fontSize: '0.9375rem',
                                    backgroundColor: '#f8fafc',
                                    minHeight: '120px',
                                    resize: 'none',
                                    transition: 'all 0.2s',
                                    color: '#2d3748'
                                }}
                                onFocus={(e) => e.target.style.borderColor = displayError ? '#fc8181' : '#4299e1'}
                                onBlur={(e) => e.target.style.borderColor = displayError ? '#fc8181' : '#edf2f7'}
                                autoFocus
                            />
                        </div>
                    )}

                    {displayError && (
                        <div style={{
                            marginTop: '1.25rem',
                            padding: '1rem',
                            backgroundColor: '#fff5f5',
                            border: '1px solid #fed7d7',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            color: '#e53e3e',
                            fontSize: '0.8125rem',
                            fontWeight: 700
                        }}>
                            <AlertTriangle size={16} />
                            <span>{displayError}</span>
                        </div>
                    )}

                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '1rem',
                                border: '2px solid #edf2f7',
                                backgroundColor: 'white',
                                color: '#4a5568',
                                fontWeight: 800,
                                fontSize: '0.9375rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#f7fafc'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            style={{
                                flex: 1.5,
                                padding: '1rem',
                                borderRadius: '1rem',
                                border: 'none',
                                backgroundColor: styles.btnColor,
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '0.9375rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.625rem',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: `0 10px 15px -3px ${styles.btnColor}40`
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = styles.btnHover}
                            onMouseOut={(e) => e.target.style.backgroundColor = styles.btnColor}
                        >
                            {loading ? (
                                <Loader2 size={20} style={{ animation: 'ant-spin 1s linear infinite' }} />
                            ) : (
                                <CheckCircle2 size={20} />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes ant-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModernAlertDialog;
