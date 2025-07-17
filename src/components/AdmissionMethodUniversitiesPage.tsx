import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUniversitiesByAdmissionMethod } from '../api/admissionMethod';
import type { UniversityAdmissionMethodResult } from '../types/admissionMethod';

const AdmissionMethodUniversitiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState<UniversityAdmissionMethodResult[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getUniversitiesByAdmissionMethod(id)
      .then(res => {
        setUniversities(res.data.result || []);
      })
      .catch(() => setError('Không thể tải danh sách trường'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#223a7a', marginBottom: 16 }}>
        Danh sách các trường sử dụng phương thức này
      </h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#e74c3c', padding: 40 }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f4f8fb' }}>
              <th style={{ padding: '12px 8px', border: '1px solid #e3eaf5', fontWeight: 600 }}>STT</th>
              <th style={{ padding: '12px 8px', border: '1px solid #e3eaf5', fontWeight: 600 }}>Tên trường</th>
              <th style={{ padding: '12px 8px', border: '1px solid #e3eaf5', fontWeight: 600 }}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {universities.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 32 }}>Không có dữ liệu</td>
              </tr>
            ) : (
              universities.map((u, idx) => (
                <tr key={u.universityName} style={{ background: idx % 2 === 0 ? '#f9fbfd' : '#fff' }}>
                  <td style={{ padding: '10px 8px', border: '1px solid #e3eaf5', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', border: '1px solid #e3eaf5', color: '#2260b4', fontWeight: 500 }}>{u.universityName}</td>
                  <td style={{ padding: '10px 8px', border: '1px solid #e3eaf5' }}>{u.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdmissionMethodUniversitiesPage; 