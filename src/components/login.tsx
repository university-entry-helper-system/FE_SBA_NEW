import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
} from "@mui/material";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const [error, setError] = useState("");

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
        localStorage.setItem("accessToken", response.data.result.accessToken);
        localStorage.setItem("refreshToken", response.data.result.refreshToken);
        window.location.href = "/home";
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Login failed");
    }
  }; // ✅ đóng function tại đây

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
