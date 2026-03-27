import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

export default GuestRoute;
