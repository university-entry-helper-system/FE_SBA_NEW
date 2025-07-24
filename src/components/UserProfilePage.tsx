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
import "../css/UserProfilePage.css";
import { AxiosError } from 'axios';


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
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// Validation schema for profile creation and update
function getProfileSchema() {
    return Yup.object().shape({
        fullName: Yup.string().trim().required("Họ và tên là bắt buộc").max(255, "Họ và tên tối đa 255 ký tự"),
        dateOfBirth: Yup.string().required("Ngày sinh là bắt buộc").matches(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải có định dạng YYYY-MM-DD"),
        idCard: Yup.string().required("CMND/CCCD là bắt buộc").matches(/^\d{9,12}$/, "CMND/CCCD phải là số và có 9-12 chữ số"),
        email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc").max(255, "Email tối đa 255 ký tự"),
        phone: Yup.string().matches(/^\d{10,11}$/, "Số điện thoại phải là số và có 10-11 chữ số").required("Số điện thoại là bắt buộc"),
        gender: Yup.string().required("Giới tính là bắt buộc").oneOf(["MALE", "FEMALE", "OTHER"], "Giới tính không hợp lệ"),
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const ImageTypes: ImageType[] = ["CCCD1", "CCCD2", "DGNL", "THPT", "HOCBA11", "HOCBA12"];
    // Formik for profile creation
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
                if (!token) throw new Error("User is not authenticated.");
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
                setTabValue(1);
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

    // Formik for profile update
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
            } catch (err  ) {
                if(err instanceof AxiosError) {
                    setError(err.response?.data?.message || "Không thể cập nhật hồ sơ.");
                }else{
                    setError("Đã xảy ra lỗi không xác định.");
                }
            } finally {
                setLoading(false);
            }
        },
    });

    // Lấy thông tin hồ sơ
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("User is not authenticated.");
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
            } catch {
                setError("Không thể tải thông tin hồ sơ.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Lấy ảnh theo imageType khi vào tab "Ảnh hồ sơ"
    useEffect(() => {
        if (tabValue === 1 && profile) {
            const fetchImages = async () => {
                setLoading(true);
                setError("");
                try {
                    const newImages: Record<string, UserProfileImage | null> = {};
                    for (const type of ImageTypes  ) {
                        const data : GetUserProfileImageRequest = {
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

    const handleTabChange = (newValue: number) => {
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
            const dataforget : GetUserProfileImageRequest ={
                userProfileId: profile.id,
                imageType: imageType as ImageType,
            }
            const response = await getUserProfileImageByType( dataforget );
            setImages((prev) => ({ ...prev, [imageType]: response.data.result || null }));
        } catch (err ) {
            if(err instanceof AxiosError){
                 setError(err.response?.data?.message || `Không thể tải ảnh ${imageType}.`);
            }
                    setError("Không thể tải danh sách ảnh.");
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
            }
        } finally {
            setLoading(false);
        }
    };

    // const formatDate = (dateString: string) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString("vi-VN");
    // };

    const getImageUrl = (imageUrl: string) => {
        return `http://localhost:9000/mybucket/${imageUrl}`;
    };

    return (
        <div className="profile-container">
            <Typography variant="h4" className="profile-title">
                Hồ sơ cá nhân
            </Typography>
            <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
                <Tabs
                    value={tabValue}
                    onChange={(_event, newValue) => handleTabChange(newValue)}
                    aria-label="profile tabs"
                    sx={{ mb: 2 }}
                >
                    <Tab label="Thông tin cá nhân" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab
                        label="Ảnh hồ sơ"
                        id="tab-1"
                        aria-controls="tabpanel-1"
                        disabled={!profile}
                    />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    {loading && (
                        <div className="profile-loading-container">
                            <CircularProgress className="profile-loading-spinner" />
                            <Typography>Đang tải dữ liệu...</Typography>
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
                        <Box component="form" onSubmit={createFormik.handleSubmit} className="profile-form">
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Họ và tên"
                                name="fullName"
                                value={createFormik.values.fullName}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.fullName && !!createFormik.errors.fullName}
                                helperText={createFormik.touched.fullName && createFormik.errors.fullName}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Ngày sinh"
                                name="dateOfBirth"
                                type="date"
                                value={createFormik.values.dateOfBirth}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.dateOfBirth && !!createFormik.errors.dateOfBirth}
                                helperText={createFormik.touched.dateOfBirth && createFormik.errors.dateOfBirth}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="CMND/CCCD"
                                name="idCard"
                                value={createFormik.values.idCard}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.idCard && !!createFormik.errors.idCard}
                                helperText={createFormik.touched.idCard && createFormik.errors.idCard}
                                disabled={loading}
                            />
                            <FormControl fullWidth margin="normal" disabled={loading}>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    name="gender"
                                    value={createFormik.values.gender}
                                    onChange={createFormik.handleChange}
                                    onBlur={createFormik.handleBlur}
                                    error={createFormik.touched.gender && !!createFormik.errors.gender}
                                >
                                    <MenuItem value="MALE">Nam</MenuItem>
                                    <MenuItem value="FEMALE">Nữ</MenuItem>
                                    <MenuItem value="OTHER">Khác</MenuItem>
                                </Select>
                                {createFormik.touched.gender && createFormik.errors.gender && (
                                    <Typography variant="caption" color="error">
                                        {createFormik.errors.gender}
                                    </Typography>
                                )}
                            </FormControl>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                name="email"
                                value={createFormik.values.email}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.email && !!createFormik.errors.email}
                                helperText={createFormik.touched.email && createFormik.errors.email}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Số điện thoại"
                                name="phone"
                                value={createFormik.values.phone}
                                onChange={createFormik.handleChange}
                                onBlur={createFormik.handleBlur}
                                error={createFormik.touched.phone && !!createFormik.errors.phone}
                                helperText={createFormik.touched.phone && createFormik.errors.phone}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ mt: 2 }}
                                className="profile-action-button"
                            >
                                Tạo hồ sơ
                            </Button>
                        </Box>
                    )}
                    {!loading && profile && (
                        <Box component="form" onSubmit={updateFormik.handleSubmit} className="profile-form">
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Mã hồ sơ"
                                value={profile.profileCode}
                                InputProps={{ readOnly: true }}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Họ và tên"
                                name="fullName"
                                value={updateFormik.values.fullName}
                                onChange={updateFormik.handleChange}
                                onBlur={updateFormik.handleBlur}
                                error={updateFormik.touched.fullName && !!updateFormik.errors.fullName}
                                helperText={updateFormik.touched.fullName && updateFormik.errors.fullName}
                                InputProps={{ readOnly: !isEditing }}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
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
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="CMND/CCCD"
                                name="idCard"
                                value={updateFormik.values.idCard}
                                onChange={updateFormik.handleChange}
                                onBlur={updateFormik.handleBlur}
                                error={updateFormik.touched.idCard && !!updateFormik.errors.idCard}
                                helperText={updateFormik.touched.idCard && updateFormik.errors.idCard}
                                InputProps={{ readOnly: !isEditing }}
                                disabled={loading}
                            />
                            <FormControl fullWidth margin="normal" disabled={loading || !isEditing}>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    name="gender"
                                    value={updateFormik.values.gender}
                                    onChange={updateFormik.handleChange}
                                    onBlur={updateFormik.handleBlur}
                                    error={updateFormik.touched.gender && !!updateFormik.errors.gender}
                                    disabled={!isEditing}
                                >
                                    <MenuItem value="MALE">Nam</MenuItem>
                                    <MenuItem value="FEMALE">Nữ</MenuItem>
                                    <MenuItem value="OTHER">Khác</MenuItem>
                                </Select>
                                {updateFormik.touched.gender && updateFormik.errors.gender && (
                                    <Typography variant="caption" color="error">
                                        {updateFormik.errors.gender}
                                    </Typography>
                                )}
                            </FormControl>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                name="email"
                                value={updateFormik.values.email}
                                onChange={updateFormik.handleChange}
                                onBlur={updateFormik.handleBlur}
                                error={updateFormik.touched.email && !!updateFormik.errors.email}
                                helperText={updateFormik.touched.email && updateFormik.errors.email}
                                InputProps={{ readOnly: !isEditing }}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Số điện thoại"
                                name="phone"
                                value={updateFormik.values.phone}
                                onChange={updateFormik.handleChange}
                                onBlur={updateFormik.handleBlur}
                                error={updateFormik.touched.phone && !!updateFormik.errors.phone}
                                helperText={updateFormik.touched.phone && updateFormik.errors.phone}
                                InputProps={{ readOnly: !isEditing }}
                                disabled={loading}
                            />
                            {isEditing ? (
                                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        className="profile-action-button"
                                    >
                                        Lưu
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setIsEditing(false)}
                                        disabled={loading}
                                        className="profile-action-button"
                                    >
                                        Hủy
                                    </Button>
                                </Box>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setIsEditing(true)}
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                    className="profile-action-button"
                                >
                                    Chỉnh sửa
                                </Button>
                            )}
                        </Box>
                    )}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {loading && (
                        <div className="profile-loading-container">
                            <CircularProgress className="profile-loading-spinner" />
                            <Typography>Đang tải dữ liệu...</Typography>
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
                        <div className="profile-empty">
                            <Typography>Chưa có hồ sơ để hiển thị ảnh.</Typography>
                        </div>
                    )}
                    {!loading && !error && profile && (
                        <Grid container spacing={2} className="image-list">
                            {ImageTypes.map((type) => (
                                <Grid item xs={12} sm={6} md={4} key={type} component="div">
                                    <Paper className="image-card">
                                        <Typography variant="subtitle1" className="image-type-title">
                                            {type === "CCCD1" ? "MAT TRUOC CCCD" : type === "CCCD2" ? "MAT SAU CCCD" : type==="HOCBA11"
                                                ? "HOC BA LOP 11" : type === "HOCBA12" ? "HOC BA LOP 12" : type === "DGNL" ? "DANH GIA NANG LUC" : "TRUNG HOC PHO THONG"}
                                        </Typography>
                                        {images[type] ? (
                                            <>
                                                <img
                                                    src={getImageUrl(images[type]!.imageUrl)}
                                                    alt={images[type]!.imageName}
                                                    className="image-preview"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/default-image.png";
                                                    }}
                                                />
                                                <Typography variant="subtitle2">{images[type]!.imageName}</Typography>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleImageDelete(type, images[type]!.id)}
                                                    disabled={loading}
                                                    sx={{ mt: 1 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">
                                                Chưa có ảnh
                                            </Typography>
                                        )}
                                        <Button
                                            variant="contained"
                                            component="label"
                                            disabled={loading}
                                            className="profile-upload-button"
                                            sx={{ mt: 2 }}
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