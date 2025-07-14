import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../hooks/useAuth";
import * as authApi from "../api/auth";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect location from state or default to home
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
        // Decode token to get roleName
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
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange }) => (
            <Form style={{ width: "100%", marginTop: "1rem" }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                margin="normal"
                onChange={handleChange}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Login;
