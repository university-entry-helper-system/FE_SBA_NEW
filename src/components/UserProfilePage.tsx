import React, { useEffect, useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    TextField,
    Typography,
    Paper,
    Button,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import DeleteIcon from "@mui/icons-material/Delete";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as jwt_decode from "jwt-decode";
import {
    getUserProfileDetail,
    getUserProfileImageByType,
    updateUserProfile,
    createUserProfile,
    createUserProfileImage,
    deleteUserProfileImage,
} from "../api/userProfile";
import type {
    UserProfile,
    UserProfileCreateRequest,
    UserProfileUpdateRequest,
    UserProfileImage,
    UserProfileImageCreateRequest,
    ImageType,
    GetUserProfileImageRequest,
} from "../types/userProfile";
import { AxiosError } from 'axios';

// Placeholder cho API học bổng (bạn sẽ triển khai sau)
import { getScholarshipById } from "../api/scholarshipService.ts"; // Điều chỉnh đường dẫn nếu cần
import type { ScholarshipResponse } from "../types/scholarshipTypes.ts"; // Định nghĩa type này theo nhu cầu

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            className="w-full"
            {...other}
        >
            {value === index && <Box className="p-6">{children}</Box>}
        </div>
    );
}

// Schema xác thực cho tạo và cập nhật hồ sơ
function getProfileSchema() {
    return Yup.object().shape({
        fullName: Yup.string().trim().required("Họ và tên là bắt buộc").max(255, "Họ và tên tối đa 255 ký tự"),
        dateOfBirth: Yup.string().required("Ngày sinh là bắt buộc").matches(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải có định dạng YYYY-MM-DD"),
        idCard: Yup.string().required("CMND/CCCD là bắt buộc").matches(/^\d{12}$/, "CMND/CCCD phải là số và có 12 chữ số"),
        email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc").max(255, "Email tối đa 255 ký tự"),
        phone: Yup.string().matches(/^\d{10,11}$/, "Số điện thoại phải là số và có 10-11 chữ số").required("Số điện thoại là bắt buộc"),
        gender: Yup.string().required("Giới tính là bắt buộc").oneOf(["MALE", "FEMALE"], "Giới tính không hợp lệ"),
    });
}

interface DecodedToken {
    accountId: string;
}

interface UserProfilePageProps {
    scholarshipId?: number;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ scholarshipId }) => {
    const [tabValue, setTabValue] = useState(0);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [images, setImages] = useState<Record<string, UserProfileImage | null>>({});
    const [scholarship, setScholarship] = useState<ScholarshipResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const ImageTypes: ImageType[] = ["CCCD1", "CCCD2", "DGNL", "THPT", "HOCBA11", "HOCBA12"];

    // Formik cho tạo hồ sơ
    const createFormik = useFormik({
        initialValues: {
            fullName: "",
            dateOfBirth: "",
            idCard: "",
            email: "",
            phone: "",
            gender: "",
            accountId: "",
        },
        validationSchema: getProfileSchema(),
        onSubmit: async (values) => {
            setLoading(true);
            setError("");
            setSuccessMessage("");
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) throw new Error("Người dùng chưa đăng nhập.");
                const decodedToken: DecodedToken = jwt_decode.jwtDecode(token);
                const createData: UserProfileCreateRequest = {
                    fullName: values.fullName,
                    dateOfBirth: values.dateOfBirth,
                    idCard: values.idCard,
                    gender: values.gender as "MALE" | "FEMALE",
                    email: values.email,
                    phone: values.phone,
                    accountId: decodedToken.accountId,
                };
                const response = await createUserProfile(createData);
                setProfile(response.data.result);
                setSuccessMessage("Tạo hồ sơ thành công!");
                if (scholarshipId) {
                    fetchScholarshipDetails();
                }
                setTabValue(1); // Chuyển sang tab ảnh sau khi tạo hồ sơ
            } catch (err) {
                if (err instanceof AxiosError) {
                    setError(err.response?.data?.message || "Không thể tạo hồ sơ.");
                } else {
                    setError("Đã xảy ra lỗi không xác định.");
                }
            } finally {
                setLoading(false);
            }
        },
    });

    // Formik cho cập nhật hồ sơ
    const updateFormik = useFormik({
        initialValues: {
            fullName: profile?.fullName || "",
            dateOfBirth: profile?.dateOfBirth || "",
            idCard: profile?.idCard || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
            gender: profile?.gender || "",
        },
        enableReinitialize: true,
        validationSchema: getProfileSchema(),
        onSubmit: async (values) => {
            if (!profile) return;
            setLoading(true);
            setError("");
            setSuccessMessage("");
            try {
                const updateData: UserProfileUpdateRequest = {
                    fullName: values.fullName,
                    dateOfBirth: values.dateOfBirth,
                    idCard: values.idCard,
                    gender: values.gender as "MALE" | "FEMALE",
                    email: values.email,
                    phone: values.phone,
                };
                const response = await updateUserProfile(profile.id, updateData);
                setProfile(response.data.result);
                setSuccessMessage("Cập nhật hồ sơ thành công!");
                setIsEditing(false);
                if (scholarshipId) {
                    fetchScholarshipDetails();
                }
            } catch (err) {
                if (err instanceof AxiosError) {
                    setError(err.response?.data?.message || "Không thể cập nhật hồ sơ.");
                } else {
                    setError("Đã xảy ra lỗi không xác định.");
                }
            } finally {
                setLoading(false);
            }
        },
    });

    // Lấy thông tin học bổng (placeholder)
    const fetchScholarshipDetails = async () => {
        if (!scholarshipId) return;
        setLoading(true);
        setError("");
        try {
            const response = await getScholarshipById(scholarshipId);
            setScholarship(response.data.result);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "Không thể lấy thông tin học bổng.");
            } else {
                setError("Đã xảy ra lỗi không xác định.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin hồ sơ
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("Người dùng chưa đăng nhập.");
            return;
        }
        const decodedToken: DecodedToken = jwt_decode.jwtDecode(token);
        const accountId = decodedToken.accountId;

        const fetchProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getUserProfileDetail(accountId);
                setProfile(response.data.result);
                if (scholarshipId) {
                    fetchScholarshipDetails();
                }
            } catch {
                setError("Không thể tải thông tin hồ sơ.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [scholarshipId]);

    // Lấy ảnh theo imageType khi vào tab "Ảnh hồ sơ"
    useEffect(() => {
        if (tabValue === 1 && profile) {
            const fetchImages = async () => {
                setLoading(true);
                setError("");
                try {
                    const newImages: Record<string, UserProfileImage | null> = {};
                    for (const type of ImageTypes) {
                        const data: GetUserProfileImageRequest = {
                            userProfileId: profile.id,
                            imageType: type,
                        };
                        const response = await getUserProfileImageByType(data);
                        newImages[type] = response.data.result || null;
                    }
                    setImages(newImages);
                } catch {
                    setError("Không thể tải danh sách ảnh.");
                } finally {
                    setLoading(false);
                }
            };
            fetchImages();
        }
    }, [tabValue, profile]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 1 && !profile) return; // Ngăn chuyển sang tab ảnh nếu chưa có hồ sơ
        setTabValue(newValue);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
        if (!profile || !event.target.files) return;
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            const file = event.target.files[0];
            const data: UserProfileImageCreateRequest = {
                imageType,
                imageFile: file,
            };
            await createUserProfileImage(profile.id, data);
            setSuccessMessage(`Tải ảnh ${imageType} thành công!`);
            const dataforget: GetUserProfileImageRequest = {
                userProfileId: profile.id,
                imageType: imageType as ImageType,
            };
            const response = await getUserProfileImageByType(dataforget);
            setImages((prev) => ({ ...prev, [imageType]: response.data.result || null }));
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || `Không thể tải ảnh ${imageType}.`);
            } else {
                setError("Đã xảy ra lỗi không xác định.");
            }
        } finally {
            setLoading(false);
            event.target.value = "";
        }
    };

    const handleImageDelete = async (imageType: string, imageId: number) => {
        if (!profile) return;
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            await deleteUserProfileImage(imageId);
            setSuccessMessage(`Xóa ảnh ${imageType} thành công!`);
            setImages((prev) => ({ ...prev, [imageType]: null }));
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || `Không thể xóa ảnh ${imageType}.`);
            } else {
                setError("Đã xảy ra lỗi không xác định.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl: string) => {
        return `http://localhost:9000/mybucket/${imageUrl}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <Typography variant="h3" className="text-blue-700 font-bold mb-6">
                Hồ Sơ Cá Nhân
            </Typography>
            <Box className="w-full max-w-5xl bg-white rounded-lg shadow-lg">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="profile tabs"
                    className="bg-blue-50 rounded-t-lg"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Thông tin cá nhân" className="text-lg font-semibold" />
                    <Tab
                        label="Ảnh hồ sơ"
                        className="text-lg font-semibold"
                        disabled={!profile}
                    />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CircularProgress size={50} className="text-blue-500" />
                            <Typography className="mt-4 text-gray-600">Đang tải dữ liệu...</Typography>
                        </div>
                    )}
                    {error && (
                        <Snackbar
                            open={!!error}
                            autoHideDuration={6000}
                            onClose={() => setError("")}
                        >
                            <Alert severity="error" onClose={() => setError("")}>
                                {error}
                            </Alert>
                        </Snackbar>
                    )}
                    {successMessage && (
                        <Snackbar
                            open={!!successMessage}
                            autoHideDuration={6000}
                            onClose={() => setSuccessMessage("")}
                        >
                            <Alert severity="success" onClose={() => setSuccessMessage("")}>
                                {successMessage}
                            </Alert>
                        </Snackbar>
                    )}
                    {!loading && !error && !profile && (
                        <Box
                            component="form"
                            onSubmit={createFormik.handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
                        >
                            <TextField
                                fullWidth
                                label="Họ và tên"
                                name="fullName"
                                value={createFormik.values.fullName}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.fullName && !!createFormik.errors.fullName}
                                helperText={createFormik.touched.fullName && createFormik.errors.fullName}
                                disabled={loading}
                                className="bg-gray-50 rounded-lg"
                                InputProps={{ className: "text-lg" }}
                            />
                            <TextField
                                fullWidth
                                label="Ngày sinh"
                                name="dateOfBirth"
                                type="date"
                                value={createFormik.values.dateOfBirth}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.dateOfBirth && !!createFormik.errors.dateOfBirth}
                                helperText={createFormik.touched.dateOfBirth && createFormik.errors.dateOfBirth}
                                disabled={loading}
                                className="bg-gray-50 rounded-lg"
                                InputProps={{ className: "text-lg" }}
                            />
                            <TextField
                                fullWidth
                                label="CMND/CCCD"
                                name="idCard"
                                value={createFormik.values.idCard}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.idCard && !!createFormik.errors.idCard}
                                helperText={createFormik.touched.idCard && createFormik.errors.idCard}
                                disabled={loading}
                                className="bg-gray-50 rounded-lg"
                                InputProps={{ className: "text-lg" }}
                            />
                            <FormControl fullWidth disabled={loading} className="bg-gray-50 rounded-lg">
                                <InputLabel className="text-lg">Giới tính</InputLabel>
                                <Select
                                    name="gender"
                                    value={createFormik.values.gender}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                    error={createFormik.touched.gender && !!createFormik.errors.gender}
                                    className="text-lg"
                                >
                                    <MenuItem value="MALE">Nam</MenuItem>
                                    <MenuItem value="FEMALE">Nữ</MenuItem>
                                    <MenuItem value="OTHER">Khác</MenuItem>
                                </Select>
                                {createFormik.touched.gender && createFormik.errors.gender && (
                                    <Typography className="text-red-500 text-sm mt-1">
                                        {createFormik.errors.gender}
                                    </Typography>
                                )}
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={createFormik.values.email}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.email && !!createFormik.errors.email}
                                helperText={createFormik.touched.email && createFormik.errors.email}
                                disabled={loading}
                                className="bg-gray-50 rounded-lg"
                                InputProps={{ className: "text-lg" }}
                            />
                            <TextField
                                fullWidth
                                label="Số điện thoại"
                                name="phone"
                                value={createFormik.values.phone}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.phone && !!createFormik.errors.phone}
                                helperText={createFormik.touched.phone && createFormik.errors.phone}
                                disabled={loading}
                                className="bg-gray-50 rounded-lg"
                                InputProps={{ className: "text-lg" }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 col-span-2"
                                disabled={loading}
                            >
                                Tạo hồ sơ
                            </Button>
                        </Box>
                    )}
                    {!loading && profile && (
                        <Box className="p-6">
                            <Box
                                component="form"
                                onSubmit={updateFormik.handleSubmit}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <TextField
                                    fullWidth
                                    label="Mã hồ sơ"
                                    value={profile.profileCode}
                                    InputProps={{ readOnly: true }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    name="fullName"
                                    value={updateFormik.values.fullName}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.fullName && !!updateFormik.errors.fullName}
                                    helperText={updateFormik.touched.fullName && updateFormik.errors.fullName}
                                    InputProps={{ readOnly: !isEditing }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                <TextField
                                    fullWidth
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    type="date"
                                    value={updateFormik.values.dateOfBirth}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.dateOfBirth && !!updateFormik.errors.dateOfBirth}
                                    helperText={updateFormik.touched.dateOfBirth && updateFormik.errors.dateOfBirth}
                                    InputProps={{ readOnly: !isEditing }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                <TextField
                                    fullWidth
                                    label="CMND/CCCD"
                                    name="idCard"
                                    value={updateFormik.values.idCard}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.idCard && !!updateFormik.errors.idCard}
                                    helperText={updateFormik.touched.idCard && updateFormik.errors.idCard}
                                    InputProps={{ readOnly: !isEditing }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                <FormControl fullWidth disabled={loading || !isEditing} className="bg-gray-50 rounded-lg">
                                    <InputLabel className="text-lg">Giới tính</InputLabel>
                                    <Select
                                        name="gender"
                                        value={updateFormik.values.gender}
                                        onChange={updateFormik.handleChange}
                                        onBlur={updateFormik.handleBlur}
                                        error={updateFormik.touched.gender && !!updateFormik.errors.gender}
                                        disabled={!isEditing}
                                        className="text-lg"
                                    >
                                        <MenuItem value="MALE">Nam</MenuItem>
                                        <MenuItem value="FEMALE">Nữ</MenuItem>
                                        <MenuItem value="OTHER">Khác</MenuItem>
                                    </Select>
                                    {updateFormik.touched.gender && updateFormik.errors.gender && (
                                        <Typography className="text-red-500 text-sm mt-1">
                                            {updateFormik.errors.gender}
                                        </Typography>
                                    )}
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={updateFormik.values.email}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.email && !!updateFormik.errors.email}
                                    helperText={updateFormik.touched.email && updateFormik.errors.email}
                                    InputProps={{ readOnly: !isEditing }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    name="phone"
                                    value={updateFormik.values.phone}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.phone && !!updateFormik.errors.phone}
                                    helperText={updateFormik.touched.phone && updateFormik.errors.phone}
                                    InputProps={{ readOnly: !isEditing }}
                                    disabled={loading}
                                    className="bg-gray-50 rounded-lg"
                                    InputProps={{ className: "text-lg" }}
                                />
                                {isEditing ? (
                                    <Box className="flex gap-4 mt-6 col-span-2">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 flex-1"
                                            disabled={loading}
                                        >
                                            Lưu
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 flex-1"
                                            onClick={() => setIsEditing(false)}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 col-span-2"
                                        onClick={() => setIsEditing(true)}
                                        disabled={loading}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                )}
                            </Box>
                            {scholarship && (
                                <Box className="mt-8 p-6 bg-blue-50 rounded-lg">
                                    <Typography variant="h5" className="text-blue-700 font-semibold mb-4">
                                        Thông tin học bổng
                                    </Typography>
                                    {/* Placeholder: Hiển thị thông tin học bổng và điều kiện */}
                                    <Typography className="text-gray-700">
                                        Tên học bổng: {scholarship.name || "Chưa có thông tin"}
                                    </Typography>
                                    <Typography className="text-gray-700 mt-2">
                                        Điều kiện: {/* Bạn cần thêm logic để hiển thị điều kiện học bổng */}
                                    </Typography>
                                    {/* Thêm các trường thông tin học bổng khác nếu cần */}
                                </Box>
                            )}
                        </Box>
                    )}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CircularProgress size={50} className="text-blue-500" />
                            <Typography className="mt-4 text-gray-600">Đang tải dữ liệu...</Typography>
                        </div>
                    )}
                    {error && (
                        <Snackbar
                            open={!!error}
                            autoHideDuration={6000}
                            onClose={() => setError("")}
                        >
                            <Alert severity="error" onClose={() => setError("")}>
                                {error}
                            </Alert>
                        </Snackbar>
                    )}
                    {successMessage && (
                        <Snackbar
                            open={!!successMessage}
                            autoHideDuration={6000}
                            onClose={() => setSuccessMessage("")}
                        >
                            <Alert severity="success" onClose={() => setSuccessMessage("")}>
                                {successMessage}
                            </Alert>
                        </Snackbar>
                    )}
                    {!loading && !error && !profile && (
                        <div className="flex justify-center py-10">
                            <Typography className="text-gray-600">Chưa có hồ sơ để hiển thị ảnh.</Typography>
                        </div>
                    )}
                    {!loading && !error && profile && (
                        <Grid container spacing={3} className="p-6">
                            {ImageTypes.map((type) => (
                                <Grid item xs={12} sm={6} md={4} key={type} component="div">
                                    <Paper className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                        <Typography variant="h6" className="text-blue-700 font-semibold mb-4">
                                            {type === "CCCD1" ? "Mặt trước CCCD" :
                                             type === "CCCD2" ? "Mặt sau CCCD" :
                                             type === "HOCBA11" ? "Học bạ lớp 11" :
                                             type === "HOCBA12" ? "Học bạ lớp 12" :
                                             type === "DGNL" ? "Đánh giá năng lực" :
                                             "Trường THPT"}
                                        </Typography>
                                        {images[type] ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={getImageUrl(images[type]!.imageUrl)}
                                                    alt={images[type]!.imageName}
                                                    className="w-full h-48 object-cover rounded-md mb-4"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/default-image.png";
                                                    }}
                                                />
                                                <Typography className="text-gray-600 mb-2">{images[type]!.imageName}</Typography>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleImageDelete(type, images[type]!.id)}
                                                    disabled={loading}
                                                    className="mb-4"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        ) : (
                                            <Typography className="text-gray-500 text-center mb-4">Chưa có ảnh</Typography>
                                        )}
                                        <Button
                                            variant="contained"
                                            component="label"
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 w-full"
                                            disabled={loading}
                                        >
                                            {images[type] ? "Thay ảnh" : "Tải ảnh lên"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => handleImageUpload(e, type)}
                                            />
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>
            </Box>
        </div>
    );
};

export default UserProfilePage;