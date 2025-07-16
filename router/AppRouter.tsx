import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
import HomePage from "../src/components/home";
import Question from "../src/components/question";
import Login from "../src/components/login";
import Register from "../src/components/register";
import ProtectedRoute from "../src/components/ProtectedRoute";
import AdminLayout from "../src/components/admin/AdminLayout";
import AdminDashboard from "../src/components/admin/AdminDashboard";
import AdminMajors from "../src/components/admin/AdminMajors";
import AdminUniversities from "../src/components/admin/AdminUniversities";
import AdminProvince from "../src/components/admin/AdminProvince";
import UniversityCategoryPage from "../src/components/admin/UniversityCategory";
import AdminExamSubject from "../src/components/admin/AdminExamSubject";
import AdminAdmissionMethod from "../src/components/admin/AdminAdmissionMethod";
import AdminSubjectCombination from "../src/components/admin/AdminSubjectCombination";
import AdminRole from "../src/components/admin/AdminRole";
import AdminAccount from "../src/components/admin/AdminAccount";
import UniversityPage from "../src/components/University";
import UniversityDetail from "../src/components/UniversityDetail";
import ForgotPassword from "../src/components/ForgotPassword";
import AdminBlock from "../src/components/admin/AdminBlock";
import AdminCampusType from "../src/components/admin/AdminCampusType";
import AdminCampuses from "../src/components/admin/AdminCampuses";
import NewsList from "../src/components/NewsList";
import NewsDetail from "../src/components/NewsDetail";
import AdminNews from "../src/components/admin/AdminNews";

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

const AppRouter = () => {
  return (
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
          <Route path="admission-methods" element={<AdminAdmissionMethod />} />
          <Route
            path="subject-combinations"
            element={<AdminSubjectCombination />}
          />
          <Route path="roles" element={<AdminRole />} />
          <Route path="users" element={<div>Quản lý người dùng</div>} />
          <Route path="settings" element={<div>Cài đặt</div>} />
          <Route path="accounts" element={<AdminAccount />} />
          <Route path="blocks" element={<AdminBlock />} />
          <Route path="campus-types" element={<AdminCampusType />} />
          <Route path="campuses" element={<AdminCampuses />} />
          <Route path="news" element={<AdminNews />} />
        </Route>

        {/* User Routes with UserLayout (Navbar + Footer) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/universities" element={<UniversityPage />} />
          <Route path="/universities/:id" element={<UniversityDetail />} />
          <Route path="/questions" element={<Question />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          {/* Other user routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

// Page wrapper for ForgotPassword
const ForgotPasswordPage = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    }}
  >
    <ForgotPassword />
  </div>
);

export default AppRouter;
