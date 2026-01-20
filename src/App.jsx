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
import CreateSellerPage from './pages/CreateSellerPage';

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

          <Route path="/products/new" element={
            <ProtectedRoute>
              <MainLayout>
                <PartFormPage />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/products/bulk-upload" element={
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

          <Route path="/orders" element={
            <ProtectedRoute>
              <MainLayout>
                <PlaceholderPage title="Order Management" />
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

