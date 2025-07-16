import React, { useEffect, useState } from "react";
import * as newsApi from "../../api/news";
import * as universityApi from "../../api/university";
import type { NewsResponse, NewsRequest, NewsFormMode } from "../../types/news";
import type { University } from "../../types/university";
import TiptapEditor from "./TiptapEditor";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, InputLabel, FormControl, Alert,
  Typography, CircularProgress
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../css/AdminMajor.css";

const PAGE_SIZE = 8;

// Validation schema
const NewsSchema = Yup.object().shape({
  universityId: Yup.string().required("Chọn trường là bắt buộc"),
  title: Yup.string().max(255).required("Tiêu đề là bắt buộc"),
  summary: Yup.string().max(500).required("Tóm tắt là bắt buộc"),
  content: Yup.string().required("Nội dung là bắt buộc"),
  category: Yup.string().required("Danh mục là bắt buộc"),
  newsStatus: Yup.string().required("Trạng thái là bắt buộc"),
});

// Default form values
const defaultForm: NewsRequest = {
  universityId: 0, // <-- use 0 (or another default number)
  title: "",
  summary: "",
  content: "",
  category: "Tin tức",
  image: null,
  imageUrl: "",
  newsStatus: "Published",
  publishedAt: "",
};

const AdminNews: React.FC = () => {
  // State
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);
  const [mode, setMode] = useState<NewsFormMode>("create");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch universities
  useEffect(() => {
    setUniversitiesLoading(true);
    universityApi.searchUniversities({ page: 0, size: 100 })
      .then(res => setUniversities(res.data.result?.items || []))
      .catch(() => setUniversities([]))
      .finally(() => setUniversitiesLoading(false));
  }, []);

  // Fetch news
  const fetchNews = async (pageNum = 0, searchQuery = "") => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (searchQuery) {
        res = await newsApi.searchNews({ query: searchQuery, page: pageNum, size: PAGE_SIZE });
      } else {
        res = await newsApi.getNewsPaginated({ page: pageNum, size: PAGE_SIZE });
      }
      setNews(res.data.result.items);
      setTotalPages(res.data.result.totalPages);
    } catch {
      setError("Không thể tải danh sách tin tức.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page, search);
    // eslint-disable-next-line
  }, [page, search]);

  // Formik for form
  const formik = useFormik<NewsRequest>({
    initialValues: defaultForm,
    validationSchema: NewsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setError("");
      setLoading(true);
      try {
        const submitValues = {
          ...values,
          universityId: Number(values.universityId) || 0,
          publishedAt: values.publishedAt
            ? new Date(values.publishedAt).toISOString()
            : undefined,
        };
        // Debug: check what is being sent
        // console.log("Submitting:", submitValues);
        if (mode === "create") {
          await newsApi.createNews(submitValues);
          setSuccess("Tạo tin tức thành công!");
        } else if (mode === "edit" && selectedNews) {
          await newsApi.updateNews(selectedNews.id, submitValues);
          setSuccess("Cập nhật tin tức thành công!");
        }
        setShowForm(false);
        resetForm();
        setImagePreview(null);
        fetchNews(page, search);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    },
  });

  // Handlers
  const openCreateForm = () => {
    setMode("create");
    setShowForm(true);
    setImagePreview(null);
    setSelectedNews(null);
    formik.resetForm();
  };
  const openEditForm = (item: NewsResponse) => {
    setMode("edit");
    setShowForm(true);
    setSelectedNews(item);
    setImagePreview(item.imageUrl || null);
    formik.setValues({
      universityId: item.university?.id ?? 0,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      image: null,
      imageUrl: item.imageUrl,
      newsStatus: item.newsStatus,
      publishedAt: item.publishedAt,
    });
  };
  const closeForm = () => {
    setShowForm(false);
    setImagePreview(null);
    setSelectedNews(null);
    formik.resetForm();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    formik.setFieldValue("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  const handleContentChange = (value: string) => {
    formik.setFieldValue("content", value);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };
  const handleDelete = async (item: NewsResponse) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tin này?")) return;
    setLoading(true);
    setError("");
    try {
      await newsApi.deleteNews(item.id);
      setSuccess("Đã xóa tin tức.");
      fetchNews(page, search);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi xóa.");
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <Box className="admin-news-page" sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">
        Quản lý Tin tức
      </Typography>
      <Box component="form" onSubmit={handleSearch} mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm tin tức..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="outlined" color="primary">
          Tìm kiếm
        </Button>
        <Button variant="contained" color="primary" onClick={openCreateForm} sx={{ ml: "auto" }}>
          + Thêm tin mới
        </Button>
      </Box>
      {loading && <CircularProgress sx={{ my: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box className="admin-news-list" mt={2}>
        <Box component="table" className="admin-table" width="100%">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Trường</th>
              <th>Ngày đăng</th>
              <th>Lượt xem</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.imageUrl || "https://placehold.co/80x50?text=No+Image"}
                    alt={item.title}
                    style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4 }}
                  />
                </td>
                <td>{item.title}</td>
                <td>{item.university?.shortName || item.university?.name || ""}</td>
                <td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ""}</td>
                <td>{item.viewCount}</td>
                <td>{item.newsStatus}</td>
                <td>
                  <Button size="small" variant="outlined" color="warning" onClick={() => openEditForm(item)} sx={{ mr: 1 }}>
                    Sửa
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(item)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
        {/* Pagination */}
        {totalPages > 1 && (
          <Box className="admin-pagination" mt={2} display="flex" gap={1} justifyContent="center">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Button
                key={idx}
                variant={idx === page ? "contained" : "outlined"}
                color="primary"
                onClick={() => setPage(idx)}
                disabled={idx === page}
                sx={{ minWidth: 36 }}
              >
                {idx + 1}
              </Button>
            ))}
          </Box>
        )}
      </Box>
      {/* Form Dialog */}
      <Dialog open={showForm} onClose={closeForm} maxWidth="md" fullWidth>
        <DialogTitle>{mode === "create" ? "Thêm tin mới" : "Sửa tin tức"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} className="admin-form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="universityId-label">Trường</InputLabel>
              <Select
                labelId="universityId-label"
                name="universityId"
                value={formik.values.universityId}
                onChange={formik.handleChange}
                required
                label="Trường"
                error={!!formik.touched.universityId && !!formik.errors.universityId}
                disabled={universitiesLoading}
              >
                <MenuItem value="">-- Chọn trường --</MenuItem>
                {universities.map(u => (
                  <MenuItem key={u.id} value={u.id.toString()}>{u.shortName || u.name}</MenuItem>
                ))}
              </Select>
              {formik.touched.universityId && formik.errors.universityId && (
                <Typography color="error" variant="caption">{formik.errors.universityId}</Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Tiêu đề"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={!!formik.touched.title && !!formik.errors.title}
              helperText={formik.touched.title && formik.errors.title}
              inputProps={{ maxLength: 255 }}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Tóm tắt"
              name="summary"
              value={formik.values.summary}
              onChange={formik.handleChange}
              error={!!formik.touched.summary && !!formik.errors.summary}
              helperText={formik.touched.summary && formik.errors.summary}
              inputProps={{ maxLength: 500 }}
              required
            />
            <Box marginY={2}>
              <Typography fontWeight={600} mb={1}>Nội dung</Typography>
              <TiptapEditor
                value={formik.values.content}
                onChange={handleContentChange}
                minHeight={180}
              />
              {formik.touched.content && formik.errors.content && (
                <Typography color="error" variant="caption">{formik.errors.content}</Typography>
              )}
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Danh mục"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              error={!!formik.touched.category && !!formik.errors.category}
              helperText={formik.touched.category && formik.errors.category}
              required
            />
            <Box marginY={2}>
              <Typography fontWeight={600} mb={1}>Ảnh</Typography>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 4, marginLeft: 8, marginTop: 8 }}
                />
              )}
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Ngày đăng"
              name="publishedAt"
              type="date"
              value={formik.values.publishedAt ? formik.values.publishedAt.slice(0, 10) : ""}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="newsStatus-label">Trạng thái</InputLabel>
              <Select
                labelId="newsStatus-label"
                name="newsStatus"
                value={formik.values.newsStatus}
                onChange={formik.handleChange}
                required
                label="Trạng thái"
                error={!!formik.touched.newsStatus && !!formik.errors.newsStatus}
              >
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
              {formik.touched.newsStatus && formik.errors.newsStatus && (
                <Typography color="error" variant="caption">{formik.errors.newsStatus}</Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} color="secondary">Hủy</Button>
          <Button onClick={formik.submitForm} color="primary" variant="contained" disabled={loading}>
            {mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNews; 