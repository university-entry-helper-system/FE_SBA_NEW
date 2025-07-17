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
