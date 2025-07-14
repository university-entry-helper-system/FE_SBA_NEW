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
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAuth } from "../hooks/useAuth";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface RegisterFormWithConfirm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  dob: Dayjs | null;
  gender: string;
}

const initialValues: RegisterFormWithConfirm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phone: "",
  dob: null,
  gender: "other",
};

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Username must be at least 4 characters")
    .max(100, "Username must be less than 100 characters")
    .required("Username is required"),
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .min(8, "Password phải có ít nhất 8 ký tự")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}:'"|,.<>/?[\]])/,
      "Password phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
    )
    .required("Password là bắt buộc"),
  confirmPassword: Yup.string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp"),
  fullName: Yup.string(),
  phone: Yup.string()
    .required("Số điện thoại là bắt buộc")
    .matches(
      /^\+84\d{9}$/,
      "Số điện thoại phải ở dạng +84xxxxxxxxx và có 12 ký tự"
    ),
  dob: Yup.mixed()
    .test("is-date", "Date of birth is required", (value) => !!value)
    .test("format", "Date must be in MM-DD-YYYY format", (value) => {
      if (!value) return false;
      const date =
        typeof value === "string" ? dayjs(value, "MM-DD-YYYY", true) : value;
      return date.isValid();
    })
    .test("past", "Ngày sinh phải trong quá khứ", (value) => {
      if (!value) return false;
      const date =
        typeof value === "string" ? dayjs(value, "MM-DD-YYYY", true) : value;
      return date.isBefore(dayjs(), "day");
    })
    .test("min-age", "Bạn phải ít nhất 3 tuổi", (value) => {
      if (!value) return false;
      const date =
        typeof value === "string" ? dayjs(value, "MM-DD-YYYY", true) : value;
      return dayjs().diff(date, "year") >= 3;
    }),
  gender: Yup.string().oneOf(["male", "female", "other"]),
});

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values: RegisterFormWithConfirm) => {
    try {
      // Format dob as MM-DD-YYYY
      let dob = values.dob;
      let dobStr = "";
      if (dob && typeof dob !== "string") {
        dobStr = dob.format("MM-DD-YYYY");
      }
      // Lowercase gender for API
      const gender = values.gender.toLowerCase();
      // Auto-format phone: if starts with 0, convert to +84
      let phone = values.phone;
      if (/^0\d{9}$/.test(phone)) {
        phone = "+84" + phone.substring(1);
      }
      // Only send fields required by API
      const { confirmPassword, ...apiValues } = values;
      const response = await register({
        ...apiValues,
        dob: dobStr,
        gender,
        phone,
      });
      if (response.code === 1001) {
        setSuccess(
          "Bạn đã đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản."
        );
        setError("");
        setDialogType("success");
        setOpenDialog(true);
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          setOpenDialog(false);
          navigate("/login");
        }, 2000);
      } else {
        setError(
          `Mã lỗi: ${response.code || "500"} - ${
            response.message || "Đăng ký thất bại"
          }`
        );
        setSuccess("");
        setDialogType("error");
        setOpenDialog(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Đăng ký thất bại";
      setError(`Lỗi hệ thống (500): ${errorMsg}`);
      setSuccess("");
      setDialogType("error");
      setOpenDialog(true);
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

        <Formik<RegisterFormWithConfirm>
          initialValues={initialValues}
          validationSchema={registerSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
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
                type={showPassword ? "text" : "password"}
                margin="normal"
                onChange={handleChange}
                value={values.password}
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
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                margin="normal"
                onChange={handleChange}
                value={values.confirmPassword}
                error={
                  touched.confirmPassword && Boolean(errors.confirmPassword)
                }
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((show) => !show)}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                onChange={(e) => {
                  let val = e.target.value;
                  // Auto-format: if starts with 0 and 10 digits, convert to +84
                  if (/^0\d{9}$/.test(val)) {
                    val = "+84" + val.substring(1);
                  }
                  setFieldValue("phone", val);
                }}
                value={values.phone}
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
              />
              {/* NOTE: Requires @mui/x-date-pickers and dayjs. Install with:
              npm install @mui/x-date-pickers dayjs */}
              <DatePicker
                label="Date of Birth"
                value={values.dob}
                onChange={(date: Dayjs | null) => setFieldValue("dob", date)}
                format="MM-DD-YYYY"
                maxDate={dayjs().subtract(3, "year")}
                minDate={dayjs("1900-01-01")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: touched.dob && Boolean(errors.dob),
                    helperText: touched.dob && errors.dob,
                  },
                }}
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

        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            if (dialogType === "success") navigate("/login");
          }}
        >
          <DialogTitle>
            {dialogType === "success"
              ? "Đăng ký thành công"
              : "Đăng ký thất bại"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {dialogType === "success" ? success : error}
            </Typography>
          </DialogContent>
          <DialogActions>
            {dialogType === "success" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenDialog(false);
                  navigate("/login");
                }}
              >
                Đăng nhập
              </Button>
            )}
            {dialogType === "error" && (
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Đóng
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Register;
