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

// Helper to safely get min value for publishedAt input
function getPublishedAtMin(): string {
  return new Date().toISOString().slice(0, 16);
}

// Validation schema
function getNewsSchema() {
  return Yup.object().shape({
    universityId: Yup.number()
      .min(1, "Chọn trường là bắt buộc")
      .required("Chọn trường là bắt buộc"),
    title: Yup.string()
      .trim()
      .min(1, "Tiêu đề là bắt buộc")
      .max(255, "Tiêu đề không được quá 255 ký tự")
      .required("Tiêu đề là bắt buộc"),
    summary: Yup.string()
      .trim()
      .min(1, "Tóm tắt là bắt buộc")
      .max(500, "Tóm tắt không được quá 500 ký tự")
      .required("Tóm tắt là bắt buộc"),
    content: Yup.string()
      .trim()
      .min(1, "Nội dung là bắt buộc")
      .required("Nội dung là bắt buộc"),
    category: Yup.string().required("Danh mục là bắt buộc"),
    newsStatus: Yup.string().required("Trạng thái là bắt buộc"),
    publishedAt: Yup.string().when(
      [],
      (publishedAt, schema, context: unknown) => {
        // context?.mode === 'edit' thì bỏ validate
        if (
          context &&
          typeof context === "object" &&
          (context as { mode?: string }).mode === "edit"
        ) {
          return schema;
        }
        return schema
          .required("Ngày đăng là bắt buộc")
          .test(
            "is-future",
            "Ngày đăng phải từ hiện tại trở đi",
            function (value) {
              if (!value) return false;
              return new Date(value) >= new Date(getPublishedAtMin());
            }
          );
      }
    ),
    releaseDate: Yup.string()
      .required("Ngày phát hành là bắt buộc")
      .test(
        "is-after-publishedAt",
        "Ngày phát hành phải sau hoặc bằng ngày đăng",
        function (value) {
          const { publishedAt } = this.parent;
          if (!value || !publishedAt) return false;
          return new Date(value) >= new Date(publishedAt);
        }
      ),
  });
}

// Default form values - SỬA: universityId mặc định là 1 thay vì 0
const defaultForm: NewsRequest = {
  universityId: 1, // Thay đổi từ 0 thành 1
  title: "",
  summary: "",
  content: "",
  category: "ADMISSION_INFO",
  image: null,
  imageUrl: "",
  newsStatus: "PUBLISHED",
  publishedAt: "",
  releaseDate: "",
};

// Helper lấy URL ảnh đầy đủ từ Minio cho news
const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return "https://placehold.co/80x50?text=No+Image";
  if (imageUrl.startsWith("http")) {
    let url = imageUrl.split("?")[0];
    url = url.replace("minio:9000", "localhost:9000");
    return url;
  }
  return `http://localhost:9000/mybucket/${imageUrl}`;
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

  // Helper: convert date string to ISO 8601 with +07:00 timezone (BE guide)
  function toGmt7ISOString(dateStr: string | undefined) {
    if (!dateStr || dateStr.trim() === "") return "";
    // dateStr: '2025-07-21T20:44' hoặc '2025-07-21T20:44:00'
    const [date, time] = dateStr.split("T");
    if (!date || !time) return "";
    // Thêm giây nếu thiếu
    const timeWithSec = time.length === 5 ? `${time}:00` : time;
    // Kết hợp lại và thêm +07:00
    return `${date}T${timeWithSec}+07:00`;
  }

  // Helper: Hiển thị ngày giờ theo giờ Việt Nam
  function toVNLocaleString(dateStr: string | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }

  // Helper: Định dạng cho input datetime-local (YYYY-MM-DDTHH:mm) theo GMT+7
  function formatDateForInput(dateStr: string | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    // Chuyển sang giờ Việt Nam (GMT+7)
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);
    return gmt7.toISOString().slice(0, 16);
  }

  // Formik for form
  const formik = useFormik<NewsRequest>({
    initialValues: defaultForm,
    validate: (values) => {
      try {
        getNewsSchema().validateSync(values, { context: { mode } });
        return {};
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          return err.inner.reduce((acc, curr) => {
            if (curr.path) acc[curr.path] = curr.message;
            return acc;
          }, {} as Record<string, string>);
        }
        return {};
      }
    },
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      setError("");
      setLoading(true);
      try {
        // Log giá trị formik.values để debug
        console.log("=== formik.values ===", values);
        // Chuyển đổi ngày sang chuẩn ISO 8601 +07:00
        let valuesToSend: Record<string, any>;
        if (mode === "create") {
          valuesToSend = {
            ...values,
            publishedAt: toGmt7ISOString(values.publishedAt || ""),
            releaseDate: toGmt7ISOString(values.releaseDate || ""),
          };
          await newsApi.createNews(valuesToSend);
        } else if (mode === "edit" && selectedNews) {
          valuesToSend = {
            ...values,
            // Luôn giữ publishedAt gốc từ DB, không lấy từ form
            publishedAt: selectedNews.publishedAt,
            releaseDate: toGmt7ISOString(values.releaseDate || ""),
          };
          // Nếu API không cho phép update publishedAt, xóa trường này trước khi gửi
          delete valuesToSend.publishedAt;
          await newsApi.updateNews(selectedNews.id, valuesToSend);
        }
        setSuccess(
          mode === "create"
            ? "Tạo tin tức thành công!"
            : "Cập nhật tin tức thành công!"
        );
        setShowForm(false);
        resetForm();
        setImagePreview(null);
        fetchNews(page, searchInput);
      } catch (err: unknown) {
        let msg = "Có lỗi xảy ra.";
        if (err instanceof Error) {
          msg = err.message;
        } else if (
          typeof err === "object" &&
          err &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
        ) {
          msg = (err as { response?: { data?: { message?: string } } })
            .response!.data!.message!;
        }
        setError(msg);
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

    // SỬA: Set giá trị mặc định tốt hơn khi tạo mới
    const now = new Date();
    const defaultPublishedAt = now.toISOString().slice(0, 16);
    const defaultReleaseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    formik.setValues({
      ...defaultForm,
      universityId: universities.length > 0 ? universities[0].id : 1, // Chọn trường đầu tiên
      publishedAt: defaultPublishedAt,
      releaseDate: defaultReleaseDate,
    });
  };

  const openEditForm = (item: NewsResponse) => {
    setMode("edit");
    setShowForm(true);
    setSelectedNews(item);
    setImagePreview(item.imageUrl || null);

    // publishedAt và releaseDate luôn lấy từ DB (item), convert về local input
    formik.setValues({
      universityId: item.university?.id ?? 1,
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      category: item.category || "ADMISSION_INFO",
      image: null,
      imageUrl: item.imageUrl || "",
      newsStatus: item.newsStatus || "PUBLISHED",
      publishedAt: formatDateForInput(item.publishedAt),
      releaseDate: formatDateForInput(item.releaseDate),
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
    } catch (err: unknown) {
      let msg = "Có lỗi xảy ra khi xóa.";
      if (err instanceof Error) {
        msg = err.message;
      } else if (
        typeof err === "object" &&
        err &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        msg = (err as { response?: { data?: { message?: string } } }).response!
          .data!.message!;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get min value for releaseDate input
  function getReleaseDateMin(publishedAt: string): string {
    if (typeof publishedAt === "string" && publishedAt) {
      return publishedAt.slice(0, 16);
    }
    return new Date().toISOString().slice(0, 16);
  }

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

      {/* Advanced Filter UI */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '16px 0' }}>
        <TextField
          label="Tìm kiếm"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          size="small"
          style={{ minWidth: 180 }}
        />
        <FormControl size="small" style={{ minWidth: 160 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={category}
            onChange={e => setCategory(e.target.value)}
            label="Danh mục"
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="ADMISSION_INFO">Thông tin tuyển sinh</MenuItem>
            <MenuItem value="EXAM_SCHEDULE">Lịch thi</MenuItem>
            <MenuItem value="SCHOLARSHIP">Học bổng</MenuItem>
            <MenuItem value="GUIDANCE">Hướng dẫn thủ tục</MenuItem>
            <MenuItem value="REGULATION_CHANGE">Thay đổi quy định</MenuItem>
            <MenuItem value="EVENT">Sự kiện</MenuItem>
            <MenuItem value="RESULT_ANNOUNCEMENT">Công bố kết quả</MenuItem>
            <MenuItem value="SYSTEM_NOTIFICATION">Thông báo hệ thống</MenuItem>
            <MenuItem value="OTHER">Khác</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Từ ngày"
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Lượt xem từ"
          type="number"
          value={minViews}
          onChange={e => setMinViews(e.target.value)}
          size="small"
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Lượt xem đến"
          type="number"
          value={maxViews}
          onChange={e => setMaxViews(e.target.value)}
          size="small"
          inputProps={{ min: 0 }}
        />
        <FormControl size="small" style={{ minWidth: 140 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={newsStatus}
            onChange={e => setNewsStatus(e.target.value)}
            label="Trạng thái"
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
            <MenuItem value="DRAFT">Bản nháp</MenuItem>
            <MenuItem value="ARCHIVED">Đã lưu trữ</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => { setPage(0); fetchNews(0, searchInput); }}
          style={{ height: 40 }}
        >
          Lọc
        </Button>
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
                      src={getImageUrl(item.imageUrl)}
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
                  <td>{toVNLocaleString(item.publishedAt)}</td>
                  <td>{toVNLocaleString(item.releaseDate)}</td>
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
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Trước
            </button>
            <div className="pagination-info">
              <span>
                Trang {page + 1} / {totalPages}
              </span>
            </div>
            <button
              className="pagination-btn"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sau
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>
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
                value={formik.values.universityId || ""}
                onChange={(e) =>
                  formik.setFieldValue("universityId", Number(e.target.value))
                }
                required
                label="Trường"
                error={
                  !!formik.touched.universityId && !!formik.errors.universityId
                }
                disabled={universitiesLoading}
              >
                {universities.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
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
                required
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
                <Typography color="error" variant="caption">
                  {formik.errors.category}
                </Typography>
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
              type="datetime-local"
              value={formik.values.publishedAt || ""}
              onChange={formik.handleChange}
              error={
                !!formik.touched.publishedAt && !!formik.errors.publishedAt
              }
              helperText={
                formik.touched.publishedAt && formik.errors.publishedAt
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getPublishedAtMin() }}
              disabled={mode === "edit"}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              label="Ngày phát hành"
              name="releaseDate"
              type="datetime-local"
              value={formik.values.releaseDate || ""}
              onChange={formik.handleChange}
              error={
                !!formik.touched.releaseDate && !!formik.errors.releaseDate
              }
              helperText={
                formik.touched.releaseDate && formik.errors.releaseDate
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: getReleaseDateMin(String(formik.values.publishedAt ?? "")),
              }}
              required
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
