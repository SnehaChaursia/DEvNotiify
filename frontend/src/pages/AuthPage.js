import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useContext(AuthContext);

  // Get the path the user was trying to access before being redirected to auth
  const from = location.state?.from?.pathname || '/';

  // Check if we should show registration form by default
  useEffect(() => {
    const showRegister = location.state?.showRegister;
    if (showRegister) {
      setIsLoginView(false);
    }
  }, [location]);

  const handleAuthSuccess = () => {
    // Redirect the user back to the page they were trying to access
    navigate(from, { replace: true });
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setAdminError("");
  };

  const handleAdminLogin = () => {
    setIsAdminLogin(true);
    setAdminError("");
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    setAdminError("");
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();

    // Simple admin credentials check
    if (adminForm.email === "admin@devnotify.com" && adminForm.password === "admin123") {
      loginAdmin();
      navigate("/profile", { state: { showTab: "admin" } });
    } else {
      setAdminError("Invalid admin credentials");
    }
  };

  if (isAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Admin Login
            </Typography>

            {adminError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {adminError}
              </Alert>
            )}

            <form onSubmit={handleAdminSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={adminForm.email}
                onChange={handleAdminChange}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={adminForm.password}
                onChange={handleAdminChange}
                margin="normal"
                required
              />
              <Button 
                fullWidth 
                variant="contained" 
                color="primary" 
                type="submit" 
                sx={{ mt: 3, mb: 2 }}
              >
                Login as Admin
              </Button>
              <Button 
                fullWidth 
                variant="text" 
                onClick={() => setIsAdminLogin(false)}
              >
                Back to Login
              </Button>
            </form>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isLoginView ? (
          <>
            <LoginForm onToggleForm={toggleView} onSuccess={handleAuthSuccess} />
            <div className="text-center">
              <Button
                variant="text"
                onClick={handleAdminLogin}
                sx={{ mt: 2 }}
              >
                Login as Admin
              </Button>
            </div>
          </>
        ) : (
          <SignupForm onToggleForm={toggleView} onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthPage; 