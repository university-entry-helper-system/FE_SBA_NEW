import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/AdminMajor.css";

interface Account {
  id: string;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  role?: { id: number; name: string } | null;
  roles?: { id: number; name: string }[];
}

const AdminAccount: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [roleIds, setRoleIds] = useState<(number | string)[]>([]);
  const [assigning, setAssigning] = useState(false);

  const token = localStorage.getItem("accessToken");
  const getAuthConfig = () => ({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  const fetchAccounts = async (searchName?: string) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (searchName) {
        res = await axios.get(
          `http://localhost:8080/api/v1/accounts/search?name=${encodeURIComponent(
            searchName
          )}&page=0&size=20`,
          getAuthConfig()
        );
        setAccounts(
          Array.isArray(res.data.result?.items) ? res.data.result.items : []
        );
      } else {
        res = await axios.get(
          "http://localhost:8080/api/v1/accounts",
          getAuthConfig()
        );
        setAccounts(
          Array.isArray(res.data.result?.items) ? res.data.result.items : []
        );
      }
    } catch {
      setError("Không thể tải danh sách tài khoản.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts(search);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/accounts/${id}`,
        getAuthConfig()
      );
      fetchAccounts();
    } catch {
      setError("Xóa tài khoản thất bại.");
    }
  };

  const handleAssignRole = async () => {
    if (!selectedAccount) return;
    setAssigning(true);
    try {
      await axios.post(
        `http://localhost:8080/api/v1/accounts/${selectedAccount.id}/roles`,
        { roleIds },
        getAuthConfig()
      );
      setSelectedAccount(null);
      setRoleIds([]);
      fetchAccounts();
    } catch {
      setError("Gán vai trò thất bại.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="admin-majors-page majors-container">
      <h2 className="majors-title">Quản lý tài khoản</h2>
      {error && <div className="error majors-error">{error}</div>}
      <form
        className="majors-form"
        onSubmit={handleSearch}
        style={{ marginBottom: 16 }}
      >
        <div className="majors-form-row">
          <input
            className="majors-input"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="majors-btn majors-btn-submit">
            Tìm kiếm
          </button>
        </div>
      </form>
      <hr className="majors-divider" />
      {loading ? (
        <div className="majors-loading">Đang tải...</div>
      ) : (
        <div className="majors-table-wrapper">
          <table className="majors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="majors-row">
                  <td>{acc.id}</td>
                  <td>{acc.username}</td>
                  <td>{acc.email}</td>
                  <td>{acc.status}</td>
                  <td>
                    {Array.isArray(acc.roles) && acc.roles.length > 0
                      ? acc.roles.map((r) => r.name).join(", ")
                      : acc.role && acc.role.name
                      ? acc.role.name
                      : "Chưa có vai trò"}
                  </td>
                  <td>
                    <button
                      className="majors-btn majors-btn-edit"
                      onClick={() => {
                        setSelectedAccount(acc);
                        if (Array.isArray(acc.roles))
                          setRoleIds(acc.roles.map((r) => r.id));
                        else if (acc.role) setRoleIds([acc.role.id]);
                        else setRoleIds([]);
                      }}
                    >
                      Gán vai trò
                    </button>
                    <button
                      className="majors-btn majors-btn-delete"
                      onClick={() => handleDelete(acc.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedAccount && (
        <div className="majors-form" style={{ marginTop: 24 }}>
          <h3>Gán vai trò cho: {selectedAccount.username}</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>
              <input
                type="checkbox"
                checked={roleIds.includes(1) || roleIds.includes("1")}
                onChange={(e) => {
                  if (e.target.checked) setRoleIds([...roleIds, 1]);
                  else
                    setRoleIds(roleIds.filter((id) => id !== 1 && id !== "1"));
                }}
              />
              Admin
            </label>
            <label>
              <input
                type="checkbox"
                checked={roleIds.includes(2) || roleIds.includes("2")}
                onChange={(e) => {
                  if (e.target.checked) setRoleIds([...roleIds, 2]);
                  else
                    setRoleIds(roleIds.filter((id) => id !== 2 && id !== "2"));
                }}
              />
              User
            </label>
            <button
              className="majors-btn majors-btn-submit"
              onClick={handleAssignRole}
              disabled={assigning}
              type="button"
            >
              Lưu vai trò
            </button>
            <button
              className="majors-btn majors-btn-cancel"
              onClick={() => {
                setSelectedAccount(null);
                setRoleIds([]);
              }}
              type="button"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccount;
