import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import * as authApi from "../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMsg(
        res.message ||
          "Nếu email đã đăng ký, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
      );
    } catch {
      setMsg("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "60vh",
          justifyContent: "center",
        }}
      >
        <Card sx={{ width: "100%", p: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" mb={2}>
              Quên mật khẩu
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                autoFocus
                margin="normal"
                id="forgot-email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {msg && (
                <Typography sx={{ mt: 2 }} color="primary">
                  {msg}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={!email || loading}
              >
                Gửi
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
