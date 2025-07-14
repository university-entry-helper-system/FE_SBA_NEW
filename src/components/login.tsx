import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import * as authApi from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import "../css/Login.css";
import GoogleLogo from "../assets/google-logo.png";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/home";

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const response = await authApi.login(values);
      if (response.code === 1000) {
        const { accessToken, refreshToken } = response.result;
        login(accessToken, refreshToken);
        const decoded = JSON.parse(atob(accessToken.split(".")[1]));
        if (decoded.roleName === "ROLE_ADMIN") {
          navigate("/admin");
        } else if (decoded.roleName === "ROLE_CONSULTANT") {
          navigate("/consultant");
        } else {
          navigate(from);
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Typography component="h1" className="login-title">
            Đăng nhập
          </Typography>
          <Typography className="login-subtitle">
            Chào mừng bạn trở lại với EduPath
          </Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange }) => (
            <Form>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Tên đăng nhập"
                margin="normal"
                onChange={handleChange}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                margin="normal"
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <div className="login-actions">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/forgot-password")}
                >
                  Quên mật khẩu?
                </Button>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <Button variant="text" size="small">
                    Đăng ký
                  </Button>
                </Link>
              </div>

              {/* Main Login Button - Now first */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1, mb: 2 }}
              >
                Đăng nhập
              </Button>

              {/* Separator */}
              <div className="login-separator">
                <span className="login-separator-text">
                  hoặc đăng nhập bằng
                </span>
              </div>

              {/* Google Login Button - Now second */}
              <Tooltip title="Tính năng đang được cập nhật" arrow>
                <span>
                  <Button
                    fullWidth
                    variant="outlined"
                    className="google-login-btn"
                    disabled
                    startIcon={
                      <img
                        src={GoogleLogo}
                        alt="Google logo"
                        style={{ width: 28, height: 28 }}
                      />
                    }
                  >
                    Đăng nhập với Google
                  </Button>
                </span>
              </Tooltip>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
