import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllUniversityAdmissionMethods } from "../../api/universityAdmissionMethod";
import "../../css/AdminUniversities.css";

interface UniversityAdmissionMethodItem {
  id: number;
  universityId: number;
  universityName: string;
  admissionMethodId: number;
  admissionMethodName: string;
  year: number;
  notes: string;
  conditions: string;
  regulations: string;
  admissionTime: string;
}

const AdminUniversityAdmissionMethodPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [methods, setMethods] = useState<UniversityAdmissionMethodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchMethods = async () => {
    if (!universityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAllUniversityAdmissionMethods({
        universityId: Number(universityId),
        page,
        size,
      });
      const result = res.data.result;
      setMethods(result.items || []);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách phương thức tuyển sinh");
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
    // eslint-disable-next-line
  }, [universityId, page]);

  return (
    <div className="admin-universities">
      <div className="universities-header">
        <div className="header-content">
          <h1 className="admin-text-2xl admin-font-bold admin-text-gray-900">
            Quản lý phương thức tuyển sinh của trường #{universityId}
          </h1>
          <p className="admin-text-sm admin-text-gray-600">
            Quản lý các phương thức tuyển sinh của trường đại học này
          </p>
        </div>
        <button className="admin-btn admin-btn-primary add-btn" disabled>
          + Thêm phương thức mới
        </button>
      </div>
      <div className="pagination-info" style={{ marginBottom: 16 }}>
        <span className="admin-text-sm admin-text-gray-600">
          Hiển thị {methods.length} trên tổng số {totalElements} phương thức
        </span>
      </div>
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
                <th>STT</th>
                <th>Tên phương thức</th>
                <th>Năm</th>
                <th>Ghi chú</th>
                <th>Điều kiện</th>
                <th>Quy chế</th>
                <th>Thời gian tuyển sinh</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method, idx) => (
                <tr key={method.id} className="table-row">
                  <td>{page * size + idx + 1}</td>
                  <td>{method.admissionMethodName}</td>
                  <td>{method.year}</td>
                  <td>{method.notes}</td>
                  <td>{method.conditions}</td>
                  <td>{method.regulations}</td>
                  <td>{method.admissionTime}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" disabled title="Xem chi tiết">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" disabled title="Chỉnh sửa">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" disabled title="Xóa">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {methods.length === 0 && !loading && (
            <div className="empty-state">
              <h3>Không tìm thấy phương thức tuyển sinh</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc thêm phương thức mới</p>
            </div>
          )}
        </div>
      )}
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
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
        </button>
      </div>
    </div>
  );
};

export default AdminUniversityAdmissionMethodPage; 