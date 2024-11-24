import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  email: string;
  password2: string;
}

const LoginDialog = () => {
  const { login, register, error, isLoading, clearError } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState<LoginFormData | RegisterFormData>({
    username: '',
    password: '',
    email: '',
    password2: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const { username, email, password, password2 } = formData as RegisterFormData;
        await register(username, email, password, password2);
      } else {
        const { username, password } = formData as LoginFormData;
        await login(username, password);
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
  };

  return (
    <Dialog open={true} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h5" align="center">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              fullWidth
            />
            {isRegister && (
              <TextField
                name="email"
                label="Email"
                type="email"
                value={(formData as RegisterFormData).email}
                onChange={handleInputChange}
                required
                fullWidth
              />
            )}
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              fullWidth
            />
            {isRegister && (
              <TextField
                name="password2"
                label="Confirm Password"
                type="password"
                value={(formData as RegisterFormData).password2}
                onChange={handleInputChange}
                required
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
          >
            {isRegister ? 'Create Account' : 'Login'}
          </Button>
          <Button
            onClick={toggleMode}
            color="inherit"
            fullWidth
            disabled={isLoading}
          >
            {isRegister ? 'Already have an account?' : 'Need an account?'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoginDialog;
