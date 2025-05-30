"use client"

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";

const AdminLogin = () => {
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple admin credentials check
    if (form.email === "admin@devnotify.com" && form.password === "admin123") {
      loginAdmin();
      navigate("/profile", { state: { showTab: "admin" } });
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      bgcolor: "background.default",
      p: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 400, 
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
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
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin; 