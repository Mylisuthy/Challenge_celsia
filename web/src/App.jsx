import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import BookingPage from './pages/BookingPage';
import SuccessPage from './pages/SuccessPage';

const ProtectedRoute = ({ children }) => {
  const customerData = localStorage.getItem('customer');
  if (!customerData) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route
            path="booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="success" element={<SuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
