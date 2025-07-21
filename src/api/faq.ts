import axiosInstance from "./axios";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  faqType: string; // enum type
}

export const getActiveFaqs = async (): Promise<FaqItem[]> => {
  const res = await axiosInstance.get<FaqItem[]>("/faqs/status/ACTIVE");
  return res.data;
};

// Lấy tất cả FAQs
export const getAllFaqs = async (): Promise<FaqItem[]> => {
  const res = await axiosInstance.get<FaqItem[]>("/faqs");
  return res.data;
};

// Lấy 1 FAQ theo ID
export const getFaqById = async (id: number): Promise<FaqItem> => {
  const res = await axiosInstance.get<FaqItem>(`/faqs/${id}`);
  return res.data;
};

// Tạo mới FAQ
export const createFaq = async (faq: Omit<FaqItem, "id">): Promise<FaqItem> => {
  const res = await axiosInstance.post<FaqItem>("/faqs", faq);
  return res.data;
};

// Cập nhật FAQ
export const updateFaq = async (
    id: number,
    faq: Omit<FaqItem, "id">
): Promise<FaqItem> => {
  const res = await axiosInstance.put<FaqItem>(`/faqs/${id}`, faq);
  return res.data;
};

// Xóa FAQ
export const deleteFaq = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/faqs/${id}`);
};

// Lấy danh sách FAQ theo status (ví dụ ACTIVE / INACTIVE)
export const getFaqsByStatus = async (status: string): Promise<FaqItem[]> => {
  const res = await axiosInstance.get<FaqItem[]>(`/faqs/status/${status}`);
  return res.data;
};
// Lấy tất cả loại FAQ
export const getFaqTypes = async (): Promise<
    { value: string; label: string }[]
> => {
  const res = await axiosInstance.get("/faqs/types");
  return res.data;
};

