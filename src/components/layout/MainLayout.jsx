import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, pageTitle, showSearch }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />

      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Header title={pageTitle} showSearch={showSearch} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
