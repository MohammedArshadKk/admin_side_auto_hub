import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock, ArrowRight, BarChart3 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2332 50%, #0f1d30 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      }}></div>

      {/* Car Illustration Background */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        opacity: 0.05,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 800 400" fill="currentColor" style={{ width: '100%', height: '100%', color: '#ffffff' }}>
          <path d="M200,250 Q250,200 350,220 L450,220 Q500,200 550,230 L580,230 L580,280 Q580,300 560,300 L240,300 Q220,300 220,280 Z M280,300 Q280,320 300,320 Q320,320 320,300 M480,300 Q480,320 500,320 Q520,320 520,300" />
        </svg>
      </div>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={24} color="#3b82f6" />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
            Command Center
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>System Status</span>
          <button style={{
            padding: '0.625rem 1.5rem',
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Support
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(22, 32, 48, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.5rem',
              letterSpacing: '-0.5px',
            }}>
              Administrator Login
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}>
              Managed Second-Hand Vehicle Parts Marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Administrator Email */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '11px',
                fontWeight: 600,
                color: '#3b82f6',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                <User size={14} />
                Administrator Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Secure Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#3b82f6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <Lock size={14} />
                  Secure Password
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  Forgot?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Device */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '13px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.rememberDevice}
                onChange={(e) => setFormData({ ...formData, rememberDevice: e.target.checked })}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              Remember this device for 30 days
            </label>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#64748b' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = '#3b82f6';
              }}
            >
              {loading ? 'Authorizing...' : (
                <>
                  Authorize & Enter
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Warning Text */}
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '0.25rem' }}>
                This is a restricted access system
              </p>
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                Unauthorized access is strictly prohibited and subject to legal action
              </p>
            </div>
          </form>

          {/* New Administrator Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
            New administrator?{' '}
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Request Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#64748b',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>© 2026 Command Center Marketplace v2.4.0</span>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            Privacy Policy
          </button>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            Terms of Service
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#10b981',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }}></div>
          <span>All systems operational</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
