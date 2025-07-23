import React, { useEffect, useState } from "react";
import * as scholarshipApi from "../../api/scholarshipService";
import * as universityApi from "../../api/university";
import type { ScholarshipRequest, ScholarshipResponse, ValueType, EligibilityType, ScholarshipStatus } from "../../types/scholarshipTypes";
import type { University } from "../../types/university";
import InputAdornment from "@mui/material/InputAdornment";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../css/admin-scholarship.css";

const PAGE_SIZE = 8;

// Helper to safely get min value for applicationDeadline input
function getApplicationDeadlineMin(): string {
    return new Date().toISOString().slice(0, 16);
}

// Validation schema
function getScholarshipSchema() {
    return Yup.object().shape({
        universityIds: Yup.array()
            .min(0, "Chọn ít nhất một trường là bắt buộc")
            .required("Chọn ít nhất một trường là bắt buộc"),
        name: Yup.string()
            .trim()
            .min(1, "Tên học bổng là bắt buộc")
            .max(255, "Tên học bổng không được quá 255 ký tự")
            .required("Tên học bổng là bắt buộc"),
        description: Yup.string()
            .trim()
            .min(1, "Mô tả là bắt buộc")
            .max(1000, "Mô tả không được quá 1000 ký tự")
            .required("Mô tả là bắt buộc"),
        valueType: Yup.string().required("Loại giá trị là bắt buộc"),
        valueAmount: Yup.number()
            .when("valueType", ([valueType], schema) => {
                return valueType === "PERCENTAGE"
                    ? schema
                        .min(1, "Giá trị học bổng phải từ 1% đến 100%")
                        .max(100, "Giá trị học bổng phải từ 1% đến 100%")
                        .required("Giá trị học bổng là bắt buộc")
                    : schema
                        .min(500, "Giá trị học bổng phải lớn hơn hoặc bằng 500000 VNĐ")
                        .required("Giá trị học bổng là bắt buộc");
            }),
        eligibilityType: Yup.string().required("Loại điều kiện là bắt buộc"),
        minScore: Yup.number()
            .when("eligibilityType", ([eligibilityType], schema) => {
                return eligibilityType === "GPA"
                    ? schema
                        .min(0, "Điểm trung bình học bạ phải từ 0 đến 10")
                        .max(10, "Điểm trung bình học bạ phải từ 0 đến 10")
                        .required("Điểm trung bình học bạ là bắt buộc")
                    : schema
                        .min(0, "Điểm thi THPT phải từ 0 đến 30")
                        .max(30, "Điểm thi THPT phải từ 0 đến 30")
                        .required("Điểm thi THPT là bắt buộc");
            }),
        applyLink: Yup.string()
            .url("Link nộp học bổng phải là một URL hợp lệ")
            .optional(),
        applicationDeadline: Yup.string()
            .required("Ngày hết hạn nộp đơn là bắt buộc")
            .test(
                "is-future",
                "Ngày hết hạn phải từ hiện tại trở đi",
                function (value) {
                    if (!value) return false;
                    return new Date(value) >= new Date(getApplicationDeadlineMin());
                }
            ),
    });
}

// Default form values
const defaultForm: ScholarshipRequest = {
    universityIds: [],
    name: "",
    description: "",
    valueType: "PERCENTAGE",
    valueAmount: 0,
    eligibilityType: "GPA",
    minScore: 0,
    applyLink: "",
    applicationDeadline: "",
};

// Helper: Format date for input (YYYY-MM-DDTHH:mm) in GMT+7
function formatDateForInput(dateStr: string | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);
    return gmt7.toISOString().slice(0, 16);
}

// Helper: Display date in Vietnam locale
function toVNLocaleString(dateStr: string | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

// Helper: Convert date string to ISO 8601 with +07:00 timezone
function toGmt7ISOString(dateStr: string | undefined) {
    if (!dateStr || dateStr.trim() === "") return "";
    const [date, time] = dateStr.split("T");
    if (!date || !time) return "";
    const timeWithSec = time.length === 5 ? `${time}:00` : time;
    return `${date}T${timeWithSec}+07:00`;
}

const AdminScholarship: React.FC = () => {
    // State
    const [scholarships, setScholarships] = useState<ScholarshipResponse[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [universitiesLoading, setUniversitiesLoading] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipResponse | null>(null);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [valueType, setValueType] = useState<ValueType | "">("");
    const [eligibilityType, setEligibilityType] = useState<EligibilityType | "">("");
    const [status, setStatus] = useState<ScholarshipStatus | "">("");

    // Fetch universities
    useEffect(() => {
        setUniversitiesLoading(true);
        universityApi
            .searchUniversities({ page: 0, size: 100 })
            .then((res) => setUniversities(res.data.result?.items || []))
            .catch(() => setUniversities([]))
            .finally(() => setUniversitiesLoading(false));
    }, []);

    // Fetch scholarships
    const fetchScholarships = async (pageNum = 0, searchQuery = "") => {
        setLoading(true);
        setError("");
        try {
            const res = await scholarshipApi.searchScholarships({
                name: searchQuery || undefined,
                valueType: valueType || undefined,
                eligibilityType: eligibilityType || undefined,
                status: status || undefined,
            });
            const allScholarships = Array.isArray(res.data.result) ? res.data.result : [];
            const scholarshipsData = allScholarships
                .map((item: ScholarshipResponse) => ({
                    ...item,
                    universities: Array.isArray(item.universities) ? item.universities : [],
                }))
                .slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE);
            setScholarships(scholarshipsData);
            setTotalPages(Math.ceil(allScholarships.length / PAGE_SIZE) || 1);
        } catch {
            setError("Không thể tải danh sách học bổng.");
            setScholarships([]);
        } finally {
            setLoading(false);
        }
    };

    // useEffect to fetch scholarships when filters change
    useEffect(() => {
        fetchScholarships(page, searchInput);
    }, [page, searchInput, valueType, eligibilityType, status]);

    // Formik for form
    const formik = useFormik<ScholarshipRequest>({
        initialValues: defaultForm,
        validationSchema: getScholarshipSchema(),
        validateOnChange: true,
        // validate: (values) => {
        //     try {
        //         getScholarshipSchema().validateSync(values, { context: { mode } });
        //         return {};
        //     } catch (err) {
        //         if (err instanceof Yup.ValidationError) {
        //             return err.inner.reduce((acc, curr) => {
        //                 if (curr.path) acc[curr.path] = curr.message;
        //                 return acc;
        //             }, {} as Record<string, string>);
        //         }
        //         return {};
        //     }
        // },
        validateOnMount: true,
        enableReinitialize: true,

        validateOnBlur: true,
        onSubmit: async (values, { resetForm }) => {
            setError("");
            setLoading(true);
            try {
                const valuesToSend: ScholarshipRequest = {
                    ...values,
                    applicationDeadline: toGmt7ISOString(values.applicationDeadline || ""),
                };
                if (mode === "create") {
                    const res = await scholarshipApi.createScholarship(valuesToSend);
                    setScholarships([{ ...res.data.result, universities: res.data.result.universities || [] }, ...scholarships]);

                } else if (mode === "edit" && selectedScholarship) {
                    await scholarshipApi.updateScholarship(selectedScholarship.id, valuesToSend);
                    setScholarships(
                        scholarships.map((item) =>
                            item.id === selectedScholarship.id ? { ...item, ...valuesToSend, universities: item.universities } : item
                        )
                    );
                }
                setSuccess(
                    mode === "create" ? "Tạo học bổng thành công!" : "Cập nhật học bổng thành công!"
                );
                setShowForm(false);
                resetForm();
            } catch (err: unknown) {
                let msg = "Có lỗi xảy ra.";
                if (err instanceof Error) {
                    msg = err.message;
                } else if (
                    typeof err === "object" &&
                    err &&
                    "response" in err &&
                    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
                ) {
                    msg = (err as { response?: { data?: { message?: string } } }).response!.data!.message!;
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
        setSelectedScholarship(null);
        const now = new Date();
        const defaultApplicationDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16);
        formik.setValues({
            ...defaultForm,
            universityIds: universities.length > 0 ? [universities[0].id] : [],
            applicationDeadline: defaultApplicationDeadline,
        });
    };

    const openEditForm = (item: ScholarshipResponse) => {
        setMode("edit");
        setShowForm(true);
        setSelectedScholarship(item);
        formik.setValues({
            universityIds: Array.isArray(item.universities) ? item.universities.map((u) => u.id) : [],
            name: item.name || "",
            description: item.description || "",
            valueType: item.valueType || "PERCENTAGE",
            valueAmount: item.valueAmount || 0,
            eligibilityType: item.eligibilityType || "GPA",
            minScore: item.minScore || 0,
            applyLink: item.applyLink || "",
            applicationDeadline: formatDateForInput(item.applicationDeadline),
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedScholarship(null);
        formik.resetForm();
    };

    const handleDelete = async (item: ScholarshipResponse) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa học bổng này?")) return;
        setLoading(true);
        setError("");
        try {
            await scholarshipApi.deleteScholarship(item.id);
            setSuccess("Đã xóa học bổng.");
            fetchScholarships(page, searchInput);
        } catch (err: unknown) {
            let msg = "Có lỗi xảy ra khi xóa.";
            if (err instanceof Error) {
                msg = err.message;
            } else if (
                typeof err === "object" &&
                err &&
                "response" in err &&
                typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
            ) {
                msg = (err as { response?: { data?: { message?: string } } }).response!.data!.message!;
            }
            setError(msg);
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
                        Quản lý Học bổng
                    </h1>
                    <p className="admin-text-sm admin-text-gray-600">
                        Quản lý thông tin các học bổng trong hệ thống
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
                    Thêm học bổng
                </button>
            </div>

            {/* Advanced Filter UI */}
            <div className="admin-news-filter-row">
                <TextField
                    label="Tìm kiếm"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    size="small"
                    style={{ minWidth: 180 }}
                />
                <FormControl size="small" style={{ minWidth: 160 }}>
                    <InputLabel>Loại giá trị</InputLabel>
                    <Select
                        value={valueType}
                        onChange={(e) => setValueType(e.target.value as ValueType)}
                        label="Loại giá trị"
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="PERCENTAGE">Phần trăm</MenuItem>
                        <MenuItem value="FIXED_AMOUNT">Số tiền</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" style={{ minWidth: 160 }}>
                    <InputLabel>Loại điều kiện</InputLabel>
                    <Select
                        value={eligibilityType}
                        onChange={(e) => setEligibilityType(e.target.value as EligibilityType)}
                        label="Loại điều kiện"
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="GPA">Học bạ</MenuItem>
                        <MenuItem value="EXAM_SCORE">Điểm thi</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" style={{ minWidth: 140 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ScholarshipStatus)}
                        label="Trạng thái"
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="ACTIVE">Đang mở</MenuItem>
                        <MenuItem value="EXPIRED">Hết hạn</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setPage(0);
                        fetchScholarships(0, searchInput);
                    }}
                    style={{ height: 40 }}
                >
                    Lọc
                </Button>
            </div>
            {loading && (
                <div className="admin-news-loading-container">
                    <div className="admin-news-loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}
            {error && <div className="admin-news-alert alert-error">{error}</div>}
            {success && <div className="admin-news-alert alert-success">{success}</div>}
            <div className="admin-news-table-container">
                <div className="table-wrapper">
                    <table className="admin-news-table">
                        <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Giá trị</th>
                            <th>Loại giá trị</th>
                            <th>Điều kiện</th>
                            <th>Điểm tối thiểu</th>
                            <th>Trường</th>
                            <th>Ngày hết hạn</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scholarships.map((item) => (
                            <tr key={item.id} className="table-row">
                                <td>{item.name}</td>
                                <td>{item.valueAmount}</td>
                                <td>
                                    {item.valueType === "PERCENTAGE"
                                        ? "% học phí"
                                        : ".000 VND"}
                                </td>
                                <td>{item.eligibilityType==="GPA"
                                        ? "Học bạ"
                                        : "Điểm thi THPT"
                                }</td>
                                <td>{item.minScore}</td>
                                <td>
                                    {item.universities && Array.isArray(item.universities)
                                        ? item.universities.map((u) => u.shortName || u.name).join(", ")
                                        : ""}
                                </td>
                                <td>{toVNLocaleString(item.applicationDeadline)}</td>
                                <td>{item.status === "ACTIVE" ? "Đang mở" : "Hết hạn"}</td>
                                <td>
                                    <div className="admin-news-action-buttons">
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
                    <div className="admin-news-pagination">
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
            <Dialog open={showForm} onClose={closeForm} maxWidth="md" fullWidth className="admin-news-form-dialog">
                <DialogTitle>
                    {mode === "create" ? "Thêm học bổng mới" : "Sửa học bổng"}
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={formik.handleSubmit}
                        className="admin-form"
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Tên học bổng"
                            name="name"
                            value={formik.values.name}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={!!formik.touched.name && !!formik.errors.name}
                            helperText={formik.touched.name && formik.errors.name}
                            inputProps={{ maxLength: 255 }}
                            required
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Mô tả"
                            name="description"
                            value={formik.values.description}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={!!formik.touched.description && !!formik.errors.description}
                            helperText={formik.touched.description && formik.errors.description}
                            inputProps={{ maxLength: 1000 }}
                            multiline
                            rows={4}
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="valueType-label">Loại giá trị</InputLabel>
                            <Select
                                labelId="valueType-label"
                                name="valueType"
                                value={formik.values.valueType}
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue("valueAmount", 0); // Reset valueAmount when valueType changes
                                }}
                                error={formik.touched.valueType && Boolean(formik.errors.valueType)}
                                required
                                label="Loại giá trị"
                            >
                                <MenuItem value="PERCENTAGE">Phần trăm</MenuItem>
                                <MenuItem value="FIXED_AMOUNT">Số tiền</MenuItem>
                            </Select>
                            {formik.touched.valueType && formik.errors.valueType && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.valueType}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Giá trị học bổng"
                            name="valueAmount"
                            type="number"
                            value={formik.values.valueAmount}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={!!formik.touched.valueAmount && !!formik.errors.valueAmount}
                            helperText={
                                (formik.touched.valueAmount && formik.errors.valueAmount) ||
                                (formik.values.valueType === "PERCENTAGE" ? "% toàn bộ học phí" : "VNĐ")
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {formik.values.valueType === "PERCENTAGE" ? "% Toan bo hoc phi" : ".000 VNĐ"}
                                    </InputAdornment>
                                ),
                            }}
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="eligibilityType-label">Loại điều kiện</InputLabel>
                            <Select
                                labelId="eligibilityType-label"
                                name="eligibilityType"
                                value={formik.values.eligibilityType}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue("minScore", 0); // Reset minScore when eligibilityType changes
                                }}
                                onBlur={formik.handleBlur}
                                error={formik.touched.eligibilityType && Boolean(formik.errors.eligibilityType)}
                                required
                                label="Loại điều kiện"
                            >
                                <MenuItem value="GPA">Học bạ</MenuItem>
                                <MenuItem value="EXAM_SCORE">Điểm thi</MenuItem>
                            </Select>
                            {formik.touched.eligibilityType && formik.errors.eligibilityType && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.eligibilityType}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            label={formik.values.eligibilityType === "GPA" ? "Điểm trung bình học bạ" : "Điểm thi THPT"}
                            name="minScore"
                            type="number"
                            value={formik.values.minScore}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={!!formik.touched.minScore && !!formik.errors.minScore}
                            helperText={formik.touched.minScore && formik.errors.minScore}
                            inputProps={{
                                min: 0,
                                max: formik.values.eligibilityType === "GPA" ? 10 : 30,
                            }}
                            required
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Link nộp học bổng"
                            name="applyLink"
                            value={formik.values.applyLink}
                            onChange={formik.handleChange}
                            error={!!formik.touched.applyLink && !!formik.errors.applyLink}
                            helperText={formik.touched.applyLink && formik.errors.applyLink}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Ngày hết hạn nộp đơn"
                            name="applicationDeadline"
                            type="datetime-local"
                            value={formik.values.applicationDeadline || ""}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={!!formik.touched.applicationDeadline && !!formik.errors.applicationDeadline}
                            helperText={formik.touched.applicationDeadline && formik.errors.applicationDeadline}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: getApplicationDeadlineMin() }}
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="universityIds-label">Trường</InputLabel>
                            <Select
                                labelId="universityIds-label"
                                name="universityIds"
                                multiple
                                value={formik.values.universityIds || []}
                                onChange={(e) => formik.setFieldValue("universityIds", e.target.value)}
                                required
                                label="Trường"
                                error={!!formik.touched.universityIds && !!formik.errors.universityIds}
                                disabled={universitiesLoading}
                            >
                                {universities.map((u) => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.shortName || u.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.universityIds && formik.errors.universityIds && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.universityIds}
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

export default AdminScholarship;