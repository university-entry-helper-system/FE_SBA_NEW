import NewsList from "../src/components/NewsList";
import NewsDetail from "../src/components/NewsDetail";
import AdminNews from "../src/components/admin/AdminNews";

<Route path="/news" element={<NewsList />} />
<Route path="/news/:id" element={<NewsDetail />} />
<Route path="/admin/news" element={<ProtectedRoute roles={["ADMIN"]}><AdminNews /></ProtectedRoute>} /> 