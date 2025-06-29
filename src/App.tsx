import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/home";
import Login from "./components/login";
import Register from "./components/register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminMajors from "./components/admin/AdminMajors";
import AdminUniversities from "./components/admin/AdminUniversities";
import AdminProvince from "./components/admin/AdminProvince";
import UniversityCategoryPage from "./components/admin/UniversityCategory";
import AdminExamSubject from "./components/admin/AdminExamSubject";
import AdminAdmissionMethod from "./components/admin/AdminAdmissionMethod";
import AdminSubjectCombination from "./components/admin/AdminSubjectCombination";
import AdminRole from "./components/admin/AdminRole";
import "./App.css";

// User Layout component to wrap user routes with Navbar and Footer
const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            {/* Nested admin routes */}
            <Route path="universities" element={<AdminUniversities />} />
            <Route path="majors" element={<AdminMajors />} />
            <Route path="provinces" element={<AdminProvince />} />
            <Route path="categories" element={<UniversityCategoryPage />} />
            <Route path="exam-subjects" element={<AdminExamSubject />} />
            <Route
              path="admission-methods"
              element={<AdminAdmissionMethod />}
            />
            <Route
              path="subject-combinations"
              element={<AdminSubjectCombination />}
            />
            <Route path="roles" element={<AdminRole />} />
            <Route path="users" element={<div>Quản lý người dùng</div>} />
            <Route path="settings" element={<div>Cài đặt</div>} />
          </Route>

          {/* User Routes with UserLayout (Navbar + Footer) */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Other user routes */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
