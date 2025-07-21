import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomePage from "../components/home";
import Question from "../components/question";
import Login from "../components/Login";
import Register from "../components/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminMajors from "../components/admin/AdminMajors";
import AdminUniversities from "../components/admin/AdminUniversities";
import AdminProvince from "../components/admin/AdminProvince";
import UniversityCategoryPage from "../components/admin/UniversityCategory";
import AdminExamSubject from "../components/admin/AdminExamSubject";
import AdminAdmissionMethod from "../components/admin/AdminAdmissionMethod";
import AdminSubjectCombination from "../components/admin/AdminSubjectCombination";
import AdminRole from "../components/admin/AdminRole";
import AdminAccount from "../components/admin/AdminAccount";
import UniversityPage from "../components/University";
import UniversityDetail from "../components/UniversityDetail";
import ForgotPassword from "../components/ForgotPassword";
import AdminBlock from "../components/admin/AdminBlock";
import AdminCampusType from "../components/admin/AdminCampusType";
import AdminCampuses from "../components/admin/AdminCampuses";
import NewsList from "../components/NewsList";
import NewsDetail from "../components/NewsDetail";
import AdminNews from "../components/admin/AdminNews";
import GraduationScoreCalculator from "../components/GraduationScoreCalculator";
import AdmissionMethodUniversitiesPage from "../components/AdmissionMethodUniversitiesPage";
import UniversityAdmissionMethodsPage from "../components/UniversityAdmissionMethodsPage";
import UniversityScoresPage from "../components/UniversityScoresPage";
import SubjectCombinationUniversitiesPage from "../components/SubjectCombinationUniversitiesPage";
import UniversitySubjectCombinationPage from "../components/UniversitySubjectCombinationPage";
import MajorUniversitiesPage from "../components/MajorUniversitiesPage";
import UniversityMajorPage from "../components/UniversityMajorPage";
import THPTScores from "../components/THPTScores";
import DGNLHCMScores from "../components/DGNLHCMScores";
import DGNLHanoiScores from "../components/DGNLHanoiScores";
import Majors from "../components/Majors";

import VisitChart from "../components/admin/VisitChart.tsx";
import SearchChart from "../components/admin/SearchChart.tsx";
import FAQs from "../components/admin/AdminFAQs.tsx";
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
          <Route path="visit-chart" element={<VisitChart />} />
          <Route path="search-charts" element={<SearchChart />} />
          <Route path="universities" element={<AdminUniversities />} />
          <Route path="majors" element={<AdminMajors />} />
          <Route path="provinces" element={<AdminProvince />} />
          <Route path="categories" element={<UniversityCategoryPage />} />
          <Route path="exam-subjects" element={<AdminExamSubject />} />
          <Route path="faqs" element={<FAQs />} />
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
          <Route path="/majors" element={<Majors />} />
          <Route path="/questions" element={<Question />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route
            path="/graduation-score"
            element={<GraduationScoreCalculator />}
          />
          <Route
            path="/admission-methods/:id"
            element={<AdmissionMethodUniversitiesPage />}
          />
          <Route
            path="/university-admission-methods/:universityId"
            element={<UniversityAdmissionMethodsPage />}
          />
          <Route
            path="/university-scores/:universityId"
            element={<UniversityScoresPage />}
          />
          <Route
            path="/subject-combination-universities/:subjectCombinationId"
            element={<SubjectCombinationUniversitiesPage />}
          />
          <Route
            path="/university-subject-combination/:universityId/:subjectCombinationId"
            element={<UniversitySubjectCombinationPage />}
          />
          <Route
            path="/major-universities/:majorId"
            element={<MajorUniversitiesPage />}
          />
          <Route
            path="/university-major/:universityId/:majorId"
            element={<UniversityMajorPage />}
          />
          <Route path="/thpt-scores" element={<THPTScores />} />
          <Route path="/dgnl-hcm-scores" element={<DGNLHCMScores />} />
          <Route path="/dgnl-hanoi-scores" element={<DGNLHanoiScores />} />
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
