import React, { useEffect, useState } from "react";
import "../../css/AdminUniversities.css";
import * as universityApi from "../../api/university";
import * as provinceApi from "../../api/province";
import * as universityCategoryApi from "../../api/universityCategory";
import * as admissionMethodApi from "../../api/admissionMethod";
import type {
  UniversityListItem,
  University,
  UniversityCreateRequest,
  UniversityAddress,
} from "../../types/university";
import type { Province as ProvinceType } from "../../types/province";
import type { UniversityCategory } from "../../types/universityCategory";
import type { AdmissionMethod } from "../../types/admissionMethod";

const defaultForm: UniversityCreateRequest = {
  categoryId: 0,
  name: "",
  shortName: "",
  fanpage: "",
  foundingYear: new Date().getFullYear(),
  provinceId: 0,
  type: "public",
  address: "",
  addresses: [],
  email: "",
  phone: "",
  website: "",
  description: "",
  admissionMethodIds: [],
};

const defaultAddress: UniversityAddress = {
  address: "",
  addressType: "main",
  description: "",
  isPrimary: false,
  phone: "",
  email: "",
  website: "",
};

const AdminUniversities: React.FC = () => {
  // State management
  const [universities, setUniversities] = useState<UniversityListItem[]>([]);
  const [categories, setCategories] = useState<UniversityCategory[]>([]);
  const [provinces, setProvinces] = useState<ProvinceType[]>([]);
  const [admissionMethods, setAdmissionMethods] = useState<AdmissionMethod[]>(
    []
  );
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [form, setForm] = useState<UniversityCreateRequest>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<University | null>(null);
  // 1. State bổ sung cho file logo và fanpage
  const [logoFile, setLogoFile] = useState<File | null>(null);
  // Thêm state cho lỗi validate phía FE
  const [formError, setFormError] = useState<string>("");

  // State bổ sung cho quản lý danh sách địa chỉ
  const [addresses, setAddresses] = useState<UniversityAddress[]>([]);

  // Pagination, search, sort, filter
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [sortField, setSortField] = useState<
    "id" | "name" | "shortName" | "foundingYear"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch universities
  const fetchUniversities = async () => {
    setLoading(true);
    setError("");
    try {
      const params: {
        page: number;
        size: number;
        sort: string;
        search?: string;
        categoryId?: number;
        provinceId?: number;
      } = {
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      };

      if (search) params.search = search;
      if (provinceFilter) params.provinceId = parseInt(provinceFilter);

      const res = await universityApi.getUniversities(params);
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setUniversities(items);
      setTotalPages(res.data.result.totalPages ?? 1);
      setTotalElements(res.data.result.totalElements ?? 0);
    } catch (err) {
      setError("Không thể tải danh sách trường đại học");
      setUniversities([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await universityCategoryApi.getUniversityCategoriesPaginated({
        size: 100, // Get all categories
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      // Sort by name A-Z
      const sortedItems = items.sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
      );
      setCategories(sortedItems);
    } catch (err) {
      console.error("Không thể tải danh sách loại trường:", err);
    }
  };

  // Fetch provinces for dropdown
  const fetchProvinces = async () => {
    try {
      const res = await provinceApi.getProvinces({
        size: 100, // Get all provinces
        sort: "name,asc", // Sort by name A-Z
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setProvinces(items);
    } catch (err) {
      console.error("Không thể tải danh sách tỉnh/thành:", err);
    }
  };

  // Fetch admission methods for dropdown
  const fetchAdmissionMethods = async () => {
    try {
      const res = await admissionMethodApi.getAdmissionMethods({
        size: 100, // Get all admission methods
        sort: "name,asc", // Sort by name A-Z
      });
      const items = Array.isArray(res.data?.result?.items)
        ? res.data.result.items
        : [];
      setAdmissionMethods(items);
    } catch (err) {
      console.error("Không thể tải danh sách phương thức tuyển sinh:", err);
    }
  };

  useEffect(() => {
    fetchUniversities();
    fetchCategories();
    fetchProvinces();
    fetchAdmissionMethods();
  }, [page, search, sortField, sortOrder, provinceFilter]);

  // Auto clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newForm = {
      ...form,
      [name]:
        name === "categoryId" ||
        name === "provinceId" ||
        name === "foundingYear"
          ? value === ""
            ? 0
            : parseInt(value, 10)
          : value,
    };
    setForm(newForm);
    // Auto-save form vào localStorage
    saveFormToStorage();
  };

  // Xử lý chọn file logo
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    } else {
      setLogoFile(null);
    }
  };

  // CRUD operations
  const handleAdd = () => {
    // Load dữ liệu đã lưu từ localStorage
    loadFormFromStorage();
    setLogoFile(null); // File logo sẽ mất khi reload, user cần chọn lại
    setAddresses([]); // Reset addresses
    setFormError("");
    setIsEditing(false);
    setShowFormModal(true);
    setSelectedUniversity(null);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityDetail(id);
      const university = res.data.result;
      setSelectedUniversity(university);
      setLogoFile(null); // reset file khi edit

      const formData = {
        categoryId: university.categoryId,
        name: university.name,
        shortName: university.shortName,
        fanpage: university.fanpage || "",
        foundingYear: university.foundingYear,
        provinceId: university.province.id,
        type: "public",
        address: university.address || "",
        addresses: university.addresses || [],
        email: university.email || "",
        phone: university.phone || "",
        website: university.website || "",
        description: university.description || "",
        admissionMethodIds: university.admissionMethodIds || [],
      };

      setForm(formData);
      setAddresses(university.addresses || []);
      setIsEditing(true);
      setShowFormModal(true);
      // Auto-save form edit vào localStorage
      setTimeout(() => saveFormToStorage(), 0);
    } catch (err) {
      setError("Không thể lấy chi tiết trường");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa trường "${name}"?`)) return;

    setLoading(true);
    try {
      await universityApi.deleteUniversity(id);
      setSuccess("Xóa trường thành công");
      fetchUniversities();
    } catch (err) {
      setError("Xóa trường thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.name || form.name.length > 255) {
      return "Tên trường là bắt buộc, tối đa 255 ký tự.";
    }
    if (form.shortName && form.shortName.length > 50) {
      return "Tên viết tắt tối đa 50 ký tự.";
    }
    if (form.fanpage && form.fanpage.length > 255) {
      return "Fanpage tối đa 255 ký tự.";
    }
    if (form.email && form.email.length > 255) {
      return "Email tối đa 255 ký tự.";
    }
    if (form.website && form.website.length > 255) {
      return "Website tối đa 255 ký tự.";
    }
    if (form.phone && form.phone.length > 20) {
      return "Số điện thoại tối đa 20 ký tự.";
    }
    if (!form.foundingYear || String(form.foundingYear).length !== 4) {
      return "Năm thành lập là bắt buộc, gồm 4 số.";
    }
    if (!form.provinceId) {
      return "Tỉnh/thành là bắt buộc.";
    }
    if (!form.categoryId) {
      return "Loại trường là bắt buộc.";
    }
    if (logoFile) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(logoFile.type)) {
        return "Chỉ nhận file ảnh jpg, png, webp.";
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        return "File logo tối đa 5MB.";
      }
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    // Validate FE trước khi gửi
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setLoading(true);
    try {
      let submitData: unknown;
      let isMultipart = false;

      if (isEditing) {
        // UPDATE: Luôn dùng FormData (multipart/form-data)
        submitData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          // Không append trường rỗng hoặc undefined
          if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")
          ) {
            return;
          }
          if (key === "admissionMethodIds") {
            (value as number[]).forEach((id) =>
              (submitData as FormData).append("admissionMethodIds", String(id))
            );
          } else if (key === "addresses") {
            // Bỏ qua addresses ở đây, sẽ xử lý riêng
            return;
          } else {
            (submitData as FormData).append(key, value as string | Blob);
          }
        });

        // Thêm danh sách địa chỉ
        if (addresses && addresses.length > 0) {
          addresses.forEach((address, index) => {
            (submitData as FormData).append(
              `addresses[${index}].address`,
              address.address
            );
            (submitData as FormData).append(
              `addresses[${index}].addressType`,
              address.addressType
            );
            (submitData as FormData).append(
              `addresses[${index}].isPrimary`,
              String(address.isPrimary)
            );
            if (address.description) {
              (submitData as FormData).append(
                `addresses[${index}].description`,
                address.description
              );
            }
            if (address.phone) {
              (submitData as FormData).append(
                `addresses[${index}].phone`,
                address.phone
              );
            }
            if (address.email) {
              (submitData as FormData).append(
                `addresses[${index}].email`,
                address.email
              );
            }
            if (address.website) {
              (submitData as FormData).append(
                `addresses[${index}].website`,
                address.website
              );
            }
          });
        }

        // Chỉ append logoFile nếu có chọn file mới
        if (logoFile) {
          (submitData as FormData).append("logoFile", logoFile);
        }
        isMultipart = true;
      } else {
        // CREATE: Gửi FormData nếu có file, JSON nếu không có
        isMultipart = !!logoFile;
        if (isMultipart) {
          submitData = new FormData();
          Object.entries(form).forEach(([key, value]) => {
            // Không append trường rỗng hoặc undefined
            if (
              value === undefined ||
              value === null ||
              (typeof value === "string" && value.trim() === "")
            ) {
              return;
            }
            if (key === "admissionMethodIds") {
              (value as number[]).forEach((id) =>
                (submitData as FormData).append(
                  "admissionMethodIds",
                  String(id)
                )
              );
            } else if (key === "addresses") {
              // Bỏ qua addresses ở đây, sẽ xử lý riêng
              return;
            } else {
              (submitData as FormData).append(key, value as string | Blob);
            }
          });
          // Thêm danh sách địa chỉ
          if (addresses && addresses.length > 0) {
            addresses.forEach((address, index) => {
              (submitData as FormData).append(
                `addresses[${index}].address`,
                address.address
              );
              (submitData as FormData).append(
                `addresses[${index}].addressType`,
                address.addressType
              );
              (submitData as FormData).append(
                `addresses[${index}].isPrimary`,
                String(address.isPrimary)
              );
              if (address.description) {
                (submitData as FormData).append(
                  `addresses[${index}].description`,
                  address.description
                );
              }
              if (address.phone) {
                (submitData as FormData).append(
                  `addresses[${index}].phone`,
                  address.phone
                );
              }
              if (address.email) {
                (submitData as FormData).append(
                  `addresses[${index}].email`,
                  address.email
                );
              }
              if (address.website) {
                (submitData as FormData).append(
                  `addresses[${index}].website`,
                  address.website
                );
              }
            });
          }
          // Chỉ append logoFile nếu có chọn file mới
          if (logoFile) {
            (submitData as FormData).append("logoFile", logoFile);
          }
        } else {
          // Bỏ trường rỗng khỏi object
          submitData = Object.fromEntries(
            Object.entries(form).filter(
              ([, value]) =>
                value !== undefined &&
                value !== null &&
                !(typeof value === "string" && value.trim() === "")
            )
          );
          // Thêm addresses vào JSON
          if (addresses && addresses.length > 0) {
            (submitData as UniversityCreateRequest).addresses = addresses;
          }
        }
      }

      if (isEditing && selectedUniversity) {
        await universityApi.updateUniversity(
          selectedUniversity.id,
          submitData,
          isMultipart
        );
        setSuccess("Cập nhật trường thành công");
      } else {
        await universityApi.createUniversity(submitData, isMultipart);
        setSuccess("Thêm trường mới thành công");
      }
      // Clear form và localStorage khi submit thành công
      setForm(defaultForm);
      setLogoFile(null);
      setAddresses([]);
      clearFormStorage();
      setIsEditing(false);
      setSelectedUniversity(null);
      setShowFormModal(false);
      fetchUniversities();
    } catch (err) {
      setError(isEditing ? "Cập nhật trường thất bại" : "Thêm trường thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await universityApi.getUniversityDetail(id);
      setViewDetail(res.data.result);
    } catch (err) {
      setError("Không thể lấy chi tiết trường");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowFormModal(false);
    // Không clear form khi đóng modal để giữ dữ liệu
    setIsEditing(false);
    setSelectedUniversity(null);
    setFormError("");
  };

  // Search and filter handlers
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "province") {
      setProvinceFilter(value);
    }
    setPage(0);
  };

  const handleSort = (field: "id" | "name" | "shortName" | "foundingYear") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(0);
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Đã xóa";
  };

  const getRegionText = (region: string) => {
    return region === "BAC"
      ? "Miền Bắc"
      : region === "TRUNG"
      ? "Miền Trung"
      : region === "NAM"
      ? "Miền Nam"
      : "N/A";
  };

  const getAdmissionMethodNames = (admissionMethodIds: number[]) => {
    if (!admissionMethodIds || admissionMethodIds.length === 0)
      return "Chưa có";
    return admissionMethodIds
      .map((id) => {
        const method = admissionMethods.find((m) => m.id === id);
        return method ? method.name : "N/A";
      })
      .join(", ");
  };

  // Helper lấy URL logo đầy đủ từ Minio
  const getLogoUrl = (logoUrl?: string) => {
    if (!logoUrl) return "/placeholder-logo.png";
    // Nếu là URL có query (presigned), cắt ? và thay minio thành localhost
    if (logoUrl.startsWith("http")) {
      let url = logoUrl.split("?")[0];
      url = url.replace("minio:9000", "localhost:9000");
      return url;
    }
    return `http://localhost:9000/mybucket/${logoUrl}`;
  };

  // Helper lưu form vào localStorage
  const saveFormToStorage = () => {
    const key = isEditing ? "universityFormEdit" : "universityForm";
    localStorage.setItem(key, JSON.stringify(form));
  };

  // Helper load form từ localStorage
  const loadFormFromStorage = () => {
    const key = isEditing ? "universityFormEdit" : "universityForm";
    const savedForm = localStorage.getItem(key);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
      } catch (error) {
        console.error("Error parsing saved form:", error);
        localStorage.removeItem(key);
      }
    }
  };

  // Helper xóa form khỏi localStorage
  const clearFormStorage = () => {
    localStorage.removeItem("universityForm");
    localStorage.removeItem("universityFormEdit");
  };

  // Helper thêm địa chỉ mới
  const addAddress = () => {
    const newAddress = { ...defaultAddress };
    if (addresses.length === 0) {
      newAddress.isPrimary = true;
    }
    setAddresses([...addresses, newAddress]);
  };

  // Helper xóa địa chỉ
  const removeAddress = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    // Nếu xóa địa chỉ primary, đặt địa chỉ đầu tiên làm primary
    if (addresses[index].isPrimary && newAddresses.length > 0) {
      newAddresses[0].isPrimary = true;
    }
    setAddresses(newAddresses);
  };

  // Helper cập nhật địa chỉ
  const updateAddress = (
    index: number,
    field: keyof UniversityAddress,
    value: unknown
  ) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };

    // Nếu đặt địa chỉ này làm primary, bỏ primary của các địa chỉ khác
    if (field === "isPrimary" && value === true) {
      newAddresses.forEach((addr, i) => {
        if (i !== index) addr.isPrimary = false;
      });
    }

    setAddresses(newAddresses);
  };

  // Helper đặt địa chỉ làm primary
  const setPrimaryAddress = (index: number) => {
    const newAddresses = addresses.map((addr, i) => ({
      ...addr,
      isPrimary: i === index,
    }));
    setAddresses(newAddresses);
  };

  return (
    <div className="admin-universities">
      {/* Header */}
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý trường đại học
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý thông tin các trường đại học trong hệ thống
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary add-btn"
          onClick={handleAdd}
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
          Thêm trường mới
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon universities-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng số trường</h3>
            <p className="stat-number">{totalElements}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <svg
            className="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg
            className="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-controls">
          <div className="search-input-group">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35"
              />
            </svg>
            <input
              className="search-input"
              placeholder="Tìm kiếm theo tên trường..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={provinceFilter}
            onChange={(e) => handleFilterChange("province", e.target.value)}
          >
            <option value="">Tất cả tỉnh/thành</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination Info */}
        <div className="pagination-info">
          <span className="admin-text-sm admin-text-gray-600">
            Hiển thị {universities.length} trên tổng số {totalElements} trường
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      className="sort-header"
                      // Xóa sự kiện sắp xếp cho STT, không cần sort theo STT
                      type="button"
                      disabled
                    >
                      STT
                    </button>
                  </th>
                  <th>Logo</th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => handleSort("name")}
                    >
                      Tên trường
                      {sortField === "name" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => handleSort("shortName")}
                    >
                      Tên viết tắt
                      {sortField === "shortName" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-header"
                      onClick={() => handleSort("foundingYear")}
                    >
                      Năm thành lập
                      {sortField === "foundingYear" && (
                        <span className="sort-indicator">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>

                  <th>Tỉnh/Thành</th>
                  <th>Vùng miền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((university, idx) => (
                  <tr key={university.id} className="table-row">
                    <td className="admin-font-medium">
                      {page * size + idx + 1}
                    </td>
                    <td>
                      <div className="logo-cell">
                        {university.logoUrl ? (
                          <img
                            src={getLogoUrl(university.logoUrl)}
                            alt={`Logo ${university.shortName}`}
                            className="university-logo"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-logo.png";
                            }}
                          />
                        ) : (
                          <div className="logo-placeholder">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21,15 16,10 5,21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="university-name">
                        <span className="name">{university.name}</span>
                      </div>
                    </td>
                    <td className="admin-font-medium">
                      {university.shortName}
                    </td>
                    <td>{university.foundingYear}</td>

                    <td>
                      <span className="admin-badge admin-badge-info">
                        {university.province?.name || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-secondary">
                        {getRegionText(university.province?.region || "")}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${university.status?.toLowerCase()}`}
                      >
                        {getStatusText(university.status || "active")}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(university.id)}
                          title="Xem chi tiết"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(university.id)}
                          title="Chỉnh sửa"
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
                          onClick={() =>
                            handleDelete(university.id, university.name)
                          }
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

            {universities.length === 0 && !loading && (
              <div className="empty-state">
                <svg
                  className="empty-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35"
                  />
                </svg>
                <h3>Không tìm thấy trường đại học</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc thêm trường mới</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-text-xl admin-font-semibold">
                {isEditing ? "Chỉnh sửa trường" : "Thêm trường mới"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="alert alert-error">
                  <svg
                    className="alert-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {formError}
                </div>
              )}
              <div className="form-grid">
                <div className="form-group">
                  <label className="admin-label">
                    Tên trường <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="name"
                    value={form.name || ""}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Tên viết tắt <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="shortName"
                    value={form.shortName || ""}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: HUST"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Loại trường <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="categoryId"
                    value={String(form.categoryId || "")}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn loại trường</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Tỉnh/Thành <span className="required">*</span>
                  </label>
                  <select
                    className="admin-input"
                    name="provinceId"
                    value={String(form.provinceId || "")}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={String(province.id)}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Năm thành lập <span className="required">*</span>
                  </label>
                  <input
                    className="admin-input"
                    name="foundingYear"
                    type="number"
                    value={form.foundingYear || ""}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 1956"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Logo trường</label>
                  <input
                    className="admin-input"
                    name="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                  />
                  {isEditing && form.shortName && (
                    <small>Để trống nếu không muốn đổi ảnh logo.</small>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Fanpage Facebook</label>
                  <input
                    className="admin-input"
                    name="fanpage"
                    value={form.fanpage || ""}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/ten-truong"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">Địa chỉ chính</label>
                  <input
                    className="admin-input"
                    name="address"
                    value={form.address || ""}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ đầy đủ của trường"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">
                    Danh sách địa chỉ chi tiết
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary small ml-2"
                      onClick={addAddress}
                    >
                      + Thêm địa chỉ
                    </button>
                  </label>

                  {addresses.length === 0 && (
                    <p className="admin-text-sm admin-text-gray-500">
                      Chưa có địa chỉ nào. Nhấn "Thêm địa chỉ" để thêm.
                    </p>
                  )}

                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className="address-item border rounded p-3 mb-3"
                    >
                      <div className="address-header flex justify-between items-center mb-2">
                        <span className="admin-font-medium">
                          Địa chỉ {index + 1}
                          {address.isPrimary && (
                            <span className="admin-badge admin-badge-primary ml-2">
                              Chính
                            </span>
                          )}
                        </span>
                        <div className="address-actions">
                          {!address.isPrimary && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary small mr-2"
                              onClick={() => setPrimaryAddress(index)}
                            >
                              Đặt làm chính
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger small"
                            onClick={() => removeAddress(index)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="address-fields grid grid-cols-2 gap-3">
                        <div className="form-group">
                          <label className="admin-label">Địa chỉ *</label>
                          <input
                            className="admin-input"
                            value={address.address}
                            onChange={(e) =>
                              updateAddress(index, "address", e.target.value)
                            }
                            placeholder="Nhập địa chỉ đầy đủ"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Loại địa chỉ *</label>
                          <select
                            className="admin-input"
                            value={address.addressType}
                            onChange={(e) =>
                              updateAddress(
                                index,
                                "addressType",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="main">Trụ sở chính</option>
                            <option value="branch">Chi nhánh</option>
                            <option value="campus">Cơ sở</option>
                            <option value="office">Văn phòng</option>
                            <option value="office">Đào tạo</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Mô tả</label>
                          <input
                            className="admin-input"
                            value={address.description || ""}
                            onChange={(e) =>
                              updateAddress(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Mô tả thêm về địa chỉ"
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Số điện thoại</label>
                          <input
                            className="admin-input"
                            value={address.phone || ""}
                            onChange={(e) =>
                              updateAddress(index, "phone", e.target.value)
                            }
                            placeholder="Số điện thoại liên hệ"
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Email</label>
                          <input
                            className="admin-input"
                            type="email"
                            value={address.email || ""}
                            onChange={(e) =>
                              updateAddress(index, "email", e.target.value)
                            }
                            placeholder="Email liên hệ"
                          />
                        </div>

                        <div className="form-group">
                          <label className="admin-label">Website</label>
                          <input
                            className="admin-input"
                            value={address.website || ""}
                            onChange={(e) =>
                              updateAddress(index, "website", e.target.value)
                            }
                            placeholder="Website của cơ sở"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">Mô tả</label>
                  <textarea
                    className="admin-input"
                    name="description"
                    value={form.description || ""}
                    onChange={handleInputChange}
                    placeholder="Mô tả về trường đại học..."
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="admin-label">Phương thức tuyển sinh</label>
                  <div className="checkbox-group">
                    {admissionMethods.map((method) => (
                      <label key={method.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.admissionMethodIds.includes(method.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm((prev) => ({
                                ...prev,
                                admissionMethodIds: [
                                  ...prev.admissionMethodIds,
                                  method.id,
                                ],
                              }));
                            } else {
                              setForm((prev) => ({
                                ...prev,
                                admissionMethodIds:
                                  prev.admissionMethodIds.filter(
                                    (id) => id !== method.id
                                  ),
                              }));
                            }
                          }}
                        />
                        <span className="checkbox-label">{method.name}</span>
                      </label>
                    ))}
                  </div>
                  {admissionMethods.length === 0 && (
                    <p className="admin-text-sm admin-text-gray-500">
                      Không có phương thức tuyển sinh nào
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Đang xử lý...
                    </>
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Thêm mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewDetail && (
        <div className="modal-overlay" onClick={() => setViewDetail(null)}>
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="admin-text-xl admin-font-semibold">
                Chi tiết trường đại học
              </h2>
              <button
                className="modal-close"
                onClick={() => setViewDetail(null)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-header">
                {viewDetail.logoUrl && (
                  <img
                    src={getLogoUrl(viewDetail.logoUrl)}
                    alt={`Logo ${viewDetail.shortName}`}
                    className="detail-logo"
                  />
                )}
                <div className="detail-title">
                  <h3 className="admin-text-lg admin-font-semibold">
                    {viewDetail.name}
                  </h3>
                  <p className="admin-text-sm admin-text-gray-600">
                    {viewDetail.shortName}
                  </p>
                  <div className="detail-badges">
                    <span className="admin-badge admin-badge-info">
                      {viewDetail.category?.name ||
                        `ID: ${viewDetail.categoryId}`}
                    </span>
                    <span className="admin-badge admin-badge-secondary">
                      {getRegionText(viewDetail.province?.region || "")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                {/* Thông tin cơ bản */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin cơ bản</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>ID:</label>
                      <span>{viewDetail.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Năm thành lập:</label>
                      <span>{viewDetail.foundingYear}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái:</label>
                      <span
                        className={`status-badge ${viewDetail.status?.toLowerCase()}`}
                      >
                        {getStatusText(viewDetail.status || "active")}
                      </span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Mô tả:</label>
                      <span>{viewDetail.description || "Chưa có mô tả"}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin phân loại */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Phân loại</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>Loại trường:</label>
                      <span>
                        {viewDetail.category?.name ||
                          `ID: ${viewDetail.categoryId}`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Tỉnh/Thành:</label>
                      <span>{viewDetail.province?.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Vùng miền:</label>
                      <span>
                        {getRegionText(viewDetail.province?.region || "")}
                      </span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Phương thức tuyển sinh:</label>
                      <span>
                        {getAdmissionMethodNames(
                          viewDetail.admissionMethodIds || []
                        )}
                      </span>
                    </div>
                    {viewDetail.province?.description && (
                      <div className="detail-item full-width">
                        <label>Mô tả tỉnh/thành:</label>
                        <span>{viewDetail.province.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin liên hệ</h4>
                  <div className="detail-section-content">
                    <div className="detail-item full-width">
                      <label>Địa chỉ:</label>
                      <span>{viewDetail.address || "Chưa cập nhật"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{viewDetail.email || "Chưa cập nhật"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Điện thoại:</label>
                      <span>{viewDetail.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Website:</label>
                      {viewDetail.website ? (
                        <a
                          href={viewDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {viewDetail.website}
                        </a>
                      ) : (
                        <span>Chưa cập nhật</span>
                      )}
                    </div>
                    {viewDetail.fanpage && (
                      <div className="detail-item full-width">
                        <label>Fanpage:</label>
                        <a
                          href={viewDetail.fanpage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {viewDetail.fanpage}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin hệ thống</h4>
                  <div className="detail-section-content">
                    <div className="detail-item">
                      <label>Người tạo:</label>
                      <span>{viewDetail.createdBy || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Thời gian tạo:</label>
                      <span>
                        {viewDetail.createdAt
                          ? new Date(viewDetail.createdAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Người cập nhật:</label>
                      <span>{viewDetail.updatedBy || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Thời gian cập nhật:</label>
                      <span>
                        {viewDetail.updatedAt
                          ? new Date(viewDetail.updatedAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversities;
