import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [error, setError] = useState("");
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
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        values
      );

      if (response.data.code === 1000) {
        const { accessToken, refreshToken } = response.data.result;

        // Use the login function from AuthContext
        login(accessToken, refreshToken);

        // Redirect based on user role
        const decoded = JSON.parse(atob(accessToken.split(".")[1]));

        if (decoded.roleId === 1) {
          navigate("/admin");
        } else if (decoded.roleId === 2) {
          navigate("/home");
        } else {
          navigate(from);
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Login failed");
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
                type="password"
                margin="normal"
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
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
