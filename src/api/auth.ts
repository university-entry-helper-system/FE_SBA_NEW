// src/api/auth.ts
// Authentication API service for all auth-related endpoints
import axios from "./axios";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
}

export async function register(data: RegisterPayload) {
  const res = await axios.post("/auth/register", data);
  return res.data;
}

export async function activate(email: string, code: string) {
  const res = await axios.get(
    `/auth/activate?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`
  );
  return res.data;
}

export async function login(data: { username: string; password: string }) {
  const res = await axios.post("/auth/login", data);
  return res.data;
}

export async function refreshToken(refreshToken: string) {
  const res = await axios.post("/auth/refresh-token", { refreshToken });
  return res.data;
}

export async function forgotPassword(email: string) {
  const res = await axios.post(
    `/auth/forgot-password?email=${encodeURIComponent(email)}`
  );
  return res.data;
}

export async function resetPassword(
  email: string,
  token: string,
  password: string
) {
  const res = await axios.post(
    `/auth/reset-password?email=${encodeURIComponent(
      email
    )}&token=${encodeURIComponent(token)}`,
    { password }
  );
  return res.data;
}

export async function logout(refreshToken: string) {
  const res = await axios.post("/auth/logout", { refreshToken });
  return res.data;
}

export async function checkUsername(username: string) {
  const res = await axios.get(
    `/auth/check-username?username=${encodeURIComponent(username)}`
  );
  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(
    `/auth/check-email?email=${encodeURIComponent(email)}`
  );
  return res.data;
}

export async function resendActivation(email: string) {
  const res = await axios.post(
    `/auth/resend-activation?email=${encodeURIComponent(email)}`
  );
  return res.data;
}

export async function verifyToken(token: string) {
  const res = await axios.get(
    `/auth/verify-token?token=${encodeURIComponent(token)}`
  );
  return res.data;
}
