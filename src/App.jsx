import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PartFormPage from './pages/PartFormPage';
import BulkUploadPage from './pages/BulkUploadPage';
import PartsBulkUploadPage from './pages/PartsBulkUploadPage';
import SellersPage from './pages/SellersPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import CreateSellerPage from './pages/CreateSellerPage';
import EditSellerPage from './pages/EditSellerPage';
import PartsPage from './pages/PartsPage';
import ProductVerificationPage from './pages/ProductVerificationPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-primary">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Placeholder Pages for now
const PlaceholderPage = ({ title }) => (
  <div className="card p-8 text-center text-text-secondary">
    <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute>
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/parts" element={
            <ProtectedRoute>
              <MainLayout>
                <PartsPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/parts/new" element={
            <ProtectedRoute>
              <MainLayout>
                <PartFormPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/parts/:id/edit" element={
            <ProtectedRoute>
              <MainLayout>
                <PartFormPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/products/new" element={
            <ProtectedRoute>
              <MainLayout>
                <PartFormPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/parts/bulk-upload" element={
            <ProtectedRoute>
              <MainLayout>
                <PartsBulkUploadPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/products/:id/edit" element={
            <ProtectedRoute>
              <MainLayout>
                <PartFormPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/products/:id/verify" element={
            <ProtectedRoute>
              <MainLayout>
                <ProductVerificationPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <MainLayout>
                <SellerOrdersPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/vendors" element={
            <ProtectedRoute>
              <MainLayout>
                <PlaceholderPage title="Vendor Management" />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/sellers" element={
            <ProtectedRoute>
              <MainLayout>
                <SellersPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/sellers/create" element={
            <ProtectedRoute>
              <MainLayout>
                <CreateSellerPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/sellers/:id/edit" element={
            <ProtectedRoute>
              <MainLayout>
                <EditSellerPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <MainLayout>
                <PlaceholderPage title="Settings" />
              </MainLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

