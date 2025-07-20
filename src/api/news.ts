import axios from './axios';

// Get paginated news
export function getNewsPaginated({ page = 0, size = 10 }: { page?: number; size?: number }) {
  return axios.get('/news/paginated', { params: { page, size } });
}

// Search news
export function searchNews({ query, page = 0, size = 10 }: { query: string; page?: number; size?: number }) {
  return axios.get('/news/search', { params: { query, page, size } });
}

// Search/filter news (guest & admin)
export function filterNews(params: {
  category?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  minViews?: number;
  maxViews?: number;
  newsStatus?: string;
  page?: number;
  size?: number;
}) {
  return axios.get('/api/news', { params });
}

// Get news by ID
export function getNewsById(id: number) {
  return axios.get(`/news/${id}`);
}

// Create news (multipart/form-data)
export function createNews(data: Record<string, any>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return axios.post('/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// Update news (multipart/form-data)
export function updateNews(id: number, data: Record<string, any>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return axios.put(`/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// Delete news
export function deleteNews(id: number) {
  return axios.delete(`/news/${id}`);
} 