import React, { useEffect, useState } from "react";
import * as newsApi from "../../api/news";
import * as universityApi from "../../api/university";
import type { NewsResponse, NewsRequest, NewsFormMode } from "../../types/news";
import type { University } from "../../types/university";
import TiptapEditor from "./TiptapEditor";
import { filterNews } from "../../api/news";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../css/AdminUniversities.css";

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
  category: "ADMISSION_INFO", // Sửa thành enum name
  image: null,
  imageUrl: "",
  newsStatus: "PUBLISHED",
  publishedAt: "",
  releaseDate: "",
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
  const [searchInput, setSearchInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minViews, setMinViews] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [newsStatus, setNewsStatus] = useState("");

  // Fetch universities
  useEffect(() => {
    setUniversitiesLoading(true);
    universityApi
      .searchUniversities({ page: 0, size: 100 })
      .then((res) => setUniversities(res.data.result?.items || []))
      .catch(() => setUniversities([]))
      .finally(() => setUniversitiesLoading(false));
  }, []);

  // Fetch news
  const fetchNews = async (pageNum = 0, searchQuery = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await filterNews({
        category: category || undefined,
        search: searchQuery || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        minViews: minViews ? Number(minViews) : undefined,
        maxViews: maxViews ? Number(maxViews) : undefined,
        newsStatus: newsStatus || undefined,
        page: pageNum,
        size: PAGE_SIZE,
      });
      setNews(res.data.result.items);
      setTotalPages(res.data.result.totalPages);
    } catch {
      setError("Không thể tải danh sách tin tức.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect gọi fetchNews mỗi khi filter thay đổi
  useEffect(() => {
    fetchNews(page, searchInput);
    // eslint-disable-next-line
  }, [
    page,
    searchInput,
    category,
    fromDate,
    toDate,
    minViews,
    maxViews,
    newsStatus,
  ]);

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
          releaseDate: values.releaseDate
            ? new Date(values.releaseDate).toISOString()
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
        fetchNews(page, searchInput);
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
      releaseDate: item.releaseDate ? item.releaseDate.slice(0, 10) : "",
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
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  const handleContentChange = (value: string) => {
    formik.setFieldValue("content", value);
  };
  const handleDelete = async (item: NewsResponse) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tin này?")) return;
    setLoading(true);
    setError("");
    try {
      await newsApi.deleteNews(item.id);
      setSuccess("Đã xóa tin tức.");
      fetchNews(page, searchInput);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi xóa.");
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý Tin tức
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các tin tức trong hệ thống
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary add-btn"
          onClick={openCreateForm}
        >
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Thêm tin mới
        </button>
      </div>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Trường</th>
                <th>Ngày đăng</th>
                <th>Ngày phát hành</th>
                <th>Số ngày đến phát hành</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="table-row">
                  <td>
                    <img
                      src={
                        item.imageUrl ||
                        "https://placehold.co/80x50?text=No+Image"
                      }
                      alt={item.title}
                      style={{
                        width: 80,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>
                    {item.university?.shortName || item.university?.name || ""}
                  </td>
                  <td>
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    {item.releaseDate
                      ? new Date(item.releaseDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    {typeof item.daysToRelease === "number"
                      ? item.daysToRelease
                      : ""}
                  </td>
                  <td>{item.viewCount}</td>
                  <td>{item.newsStatus}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditForm(item)}
                        title="Sửa"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(item)}
                        title="Xóa"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3,6 5,6 21,6" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                          />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            className="admin-pagination"
            mt={2}
            display="flex"
            gap={1}
            justifyContent="center"
          >
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
      </div>
      {/* Form Dialog */}
      <Dialog open={showForm} onClose={closeForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {mode === "create" ? "Thêm tin mới" : "Sửa tin tức"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            className="admin-form"
            sx={{ mt: 1 }}
          >
            <FormControl fullWidth margin="normal">
              <InputLabel id="universityId-label">Trường</InputLabel>
              <Select
                labelId="universityId-label"
                name="universityId"
                value={formik.values.universityId}
                onChange={formik.handleChange}
                required
                label="Trường"
                error={
                  !!formik.touched.universityId && !!formik.errors.universityId
                }
                disabled={universitiesLoading}
              >
                <MenuItem value="">-- Chọn trường --</MenuItem>
                {universities.map((u) => (
                  <MenuItem key={u.id} value={u.id.toString()}>
                    {u.shortName || u.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.universityId && formik.errors.universityId && (
                <Typography color="error" variant="caption">
                  {formik.errors.universityId}
                </Typography>
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
              <Typography fontWeight={600} mb={1}>
                Nội dung
              </Typography>
              <TiptapEditor
                value={formik.values.content}
                onChange={handleContentChange}
                minHeight={180}
              />
              {formik.touched.content && formik.errors.content && (
                <Typography color="error" variant="caption">
                  {formik.errors.content}
                </Typography>
              )}
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Danh mục</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category}
                label="Danh mục"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
              >
                <MenuItem value="ADMISSION_INFO">Thông tin tuyển sinh</MenuItem>
                <MenuItem value="EXAM_SCHEDULE">Lịch thi</MenuItem>
                <MenuItem value="SCHOLARSHIP">Học bổng</MenuItem>
                <MenuItem value="GUIDANCE">Hướng dẫn thủ tục</MenuItem>
                <MenuItem value="REGULATION_CHANGE">Thay đổi quy định</MenuItem>
                <MenuItem value="EVENT">Sự kiện</MenuItem>
                <MenuItem value="RESULT_ANNOUNCEMENT">Công bố kết quả</MenuItem>
                <MenuItem value="SYSTEM_NOTIFICATION">
                  Thông báo hệ thống
                </MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </Select>
              {formik.touched.category && formik.errors.category && (
                <div className="form-error">{formik.errors.category}</div>
              )}
            </FormControl>
            <Box marginY={2}>
              <Typography fontWeight={600} mb={1}>
                Ảnh
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: 120,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginLeft: 8,
                    marginTop: 8,
                  }}
                />
              )}
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Ngày đăng"
              name="publishedAt"
              type="date"
              value={
                formik.values.publishedAt
                  ? formik.values.publishedAt.slice(0, 10)
                  : ""
              }
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Ngày phát hành"
              name="releaseDate"
              type="date"
              value={formik.values.releaseDate ? formik.values.releaseDate : ""}
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
                error={
                  !!formik.touched.newsStatus && !!formik.errors.newsStatus
                }
              >
                <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                <MenuItem value="DRAFT">Bản nháp</MenuItem>
                <MenuItem value="ARCHIVED">Đã lưu trữ</MenuItem>
              </Select>
              {formik.touched.newsStatus && formik.errors.newsStatus && (
                <Typography color="error" variant="caption">
                  {formik.errors.newsStatus}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} color="secondary">
            Hủy
          </Button>
          <Button
            onClick={formik.submitForm}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {mode === "create" ? "Tạo mới" : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminNews;
