import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { RegisterFormValues } from "../types/auth";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  MenuItem,
} from "@mui/material";
import axios, { AxiosError } from "axios";

// 👇 Initial values
const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  dob: "",
  gender: "other",
};

// 👇 Yup validation schema
const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Username must be at least 4 characters")
    .max(100, "Username must be less than 100 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}:'"|,.<>/?[\]])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .required("Password is required"),
  fullName: Yup.string(),
  phone: Yup.string().matches(
    /^(0|\+84)\d{9}$/,
    "Phone number must start with 0 or +84 and have 10 digits"
  ),
  dob: Yup.string().matches(
    /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(19\d{2}|20\d{2})$/,
    "Date must be in MM-DD-YYYY format"
  ),
  gender: Yup.string(),
});

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/register",
        values
      );
      if (response.data.code === 1001) {
        setSuccess(
          "Registration successful. Please check your email for activation."
        );
        setError("");
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Registration failed");
      setSuccess("");
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
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
            {success}
          </Alert>
        )}

        <Formik<RegisterFormValues>
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange }) => (
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
                id="email"
                name="email"
                label="Email"
                margin="normal"
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
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
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                label="Full Name"
                margin="normal"
                onChange={handleChange}
              />
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone"
                margin="normal"
                onChange={handleChange}
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
              />
              <TextField
                fullWidth
                id="dob"
                name="dob"
                label="Date of Birth (MM-DD-YYYY)"
                margin="normal"
                onChange={handleChange}
                error={touched.dob && Boolean(errors.dob)}
                helperText={touched.dob && errors.dob}
              />
              <TextField
                fullWidth
                select
                id="gender"
                name="gender"
                label="Gender"
                margin="normal"
                onChange={handleChange}
                value={values.gender}
                error={touched.gender && Boolean(errors.gender)}
                helperText={touched.gender && errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Register;
