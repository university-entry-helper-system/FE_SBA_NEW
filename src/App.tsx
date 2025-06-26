import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider"; // Import AuthProvider
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/home";
import Login from "./components/login";
import Register from "./components/register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Other routes */}
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
