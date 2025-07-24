import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "../src/components/admin/AdminLayout";
import AdminDashboard from "../src/components/admin/AdminDashboard";
import AdminAccount from "../src/components/admin/AdminAccount";
import AdminRole from "../src/components/admin/AdminRole";
import AdminConsultantProfiles from "../src/components/admin/AdminConsultantProfiles";
// ...import các page khác nếu cần

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="accounts" element={<AdminAccount />} />
        <Route path="roles" element={<AdminRole />} />
        <Route path="consultant-profiles" element={<AdminConsultantProfiles />} />
        {/* ...các route khác */}
      </Route>
      {/* ...các route ngoài admin nếu cần */}
    </Routes>
  </Router>
);

export default AppRouter;
