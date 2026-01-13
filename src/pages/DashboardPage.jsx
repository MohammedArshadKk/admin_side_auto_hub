import React from 'react';
import { Package, CheckCircle2, Clock, ShoppingCart, Upload, Printer, AlertTriangle, ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, iconBg }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', color: change.startsWith('+') ? 'var(--success)' : 'var(--error)' }}>
          {change}
        </div>
      </div>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={22} color="#ffffff" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const stats = [
    { title: 'Total Listings', value: '1,248', change: '+5%', icon: Package, iconBg: '#3b82f6' },
    { title: 'Approved Products', value: '856', change: '+12%', icon: CheckCircle2, iconBg: '#10b981' },
    { title: 'Pending Approvals', value: '42', change: '-2%', icon: Clock, iconBg: '#f59e0b' },
    { title: 'Orders to Fulfill', value: '15', change: '8 Urgent', icon: ShoppingCart, iconBg: '#ef4444' },
  ];

  const quickShortcuts = [
    { label: 'Bulk Upload CSV', icon: Upload, color: '#8b5cf6' },
    { label: 'Print Shipping Labels', icon: Printer, color: '#3b82f6' },
    { label: 'View Rejected Items', icon: AlertTriangle, color: '#f59e0b' },
  ];

  const recentOrders = [
    {
      id: '#ORD-2485',
      part: 'Honda Civic 2018 Alternator',
      sku: 'ALT-HC18-002',
      customer: 'Michael R.',
      date: 'Oct 24, 2023',
      status: 'Pending Ship',
      total: '$125.00',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Sales Performance */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Sales Performance
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Revenue analytics for the last 30 days
              </p>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              $12,450
              <span style={{ fontSize: '14px', color: 'var(--success)', marginLeft: '0.5rem' }}>+8.5%</span>
            </div>
          </div>
          <div style={{
            height: '200px',
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '2rem',
          }}>
            <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%' }}>
              <path
                d="M 0 100 Q 50 80 100 60 T 200 40 T 300 50 T 400 20"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* CTA Card */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            color: '#ffffff',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>
              Grow Your Business
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '1rem' }}>
              Upload new inventory to reach more customers today.
            </p>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              background: '#ffffff',
              color: '#3b82f6',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              <Upload size={18} />
              Add New Listing
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Quick Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quickShortcuts.map((shortcut, i) => (
                <button
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${shortcut.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <shortcut.icon size={16} color={shortcut.color} />
                    </div>
                    <span>{shortcut.label}</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        marginTop: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Orders
          </h3>
          <button style={{
            color: 'var(--primary)',
            fontSize: '14px',
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            View All Orders
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <thead style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Part Info</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 500 }}>{order.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text-primary)' }}>{order.part}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.sku}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{order.customer}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{order.date}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: 'var(--warning-light)',
                      color: 'var(--warning)',
                    }}>
                      <Clock size={12} />
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{order.total}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}>⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
