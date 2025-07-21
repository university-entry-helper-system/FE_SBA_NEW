export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    faqType: string; // ví dụ: "USER", "SYSTEM", "GENERAL"
    status?: "ACTIVE" | "DELETED";
}

export type FaqStatus = "ACTIVE" | "DELETED";

export interface FaqRequest {
    question: string;
    answer: string;
    faqType: string;
    status?: FaqStatus;
}
