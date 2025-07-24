import axios from "./axios";

// Interface cho Score
export interface Score {
  id: number;
  subject: string;
  year: number;
  scoreUrl: string;
  type: "THPT" | "DGNL_HANOI" | "DGNL_HCMC";
}

export interface ScoresResponse {
  code?: number;
  message?: string;
  result?: Score[];
  data?: Score[];
}

// API call để lấy scores theo năm và loại
export const getScores = async (
  year: number,
  type: "THPT" | "DGNL_HANOI" | "DGNL_HCMC"
): Promise<Score[]> => {
  try {
    const response = await axios.get(`/scores?year=${year}&type=${type}`);

    // API trả về array trực tiếp
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Hoặc trả về trong format với code/result
    if (response.data.code === 1000 && response.data.result) {
      return response.data.result;
    }

    // Hoặc trả về trong format với data
    if (response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching scores:", error);
    return [];
  }
};

// API call để lấy phổ điểm theo môn học cụ thể
export const getScoresBySubject = async (
  year: number,
  type: "THPT" | "DGNL_HANOI" | "DGNL_HCMC",
  subject: string
): Promise<Score[]> => {
  try {
    const url = `/scores/filter?year=${year}&type=${type}&subject=${subject}`;
    console.log("Calling API:", url);

    const response = await axios.get(url);
    console.log("API response:", response.data);

    // API trả về array trực tiếp
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Hoặc trả về trong format với code/result
    if (response.data.code === 1000 && response.data.result) {
      return response.data.result;
    }

    // Hoặc trả về trong format với data
    if (response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching scores by subject:", error);
    return [];
  }
};

// Mapping subject code to display name
export const subjectDisplayNames: Record<string, string> = {
  toan: "Toán",
  van: "Văn",
  anh: "Tiếng Anh",
  ly: "Vật Lý",
  hoa: "Hóa Học",
  sinh: "Sinh Học",
  su: "Lịch Sử",
  dia: "Địa Lý",
  gdcd: "GDCD",
  ktpl: "Kinh tế pháp luật",
  cncn: "Công nghệ công nghiệp",
  cnnn: "Công nghệ nông nghiệp",
  tin: "Tin Học",
};

// Helper function để lấy tên hiển thị của môn học
export const getSubjectDisplayName = (subjectCode: string): string => {
  return subjectDisplayNames[subjectCode] || subjectCode;
};

// Mapping ngược từ tên hiển thị sang subject code
export const subjectCodeMapping: Record<string, string> = {
  Toán: "toan",
  Văn: "van",
  "Ngữ Văn": "van",
  "Tiếng Anh": "anh",
  "Vật Lý": "ly",
  "Hóa Học": "hoa",
  "Sinh Học": "sinh",
  "Lịch Sử": "su",
  "Địa Lý": "dia",
  GDCD: "gdcd",
  "Kinh tế pháp luật": "ktpl",
  "Công nghệ công nghiệp": "cncn",
  "Công nghệ nông nghiệp": "cnnn",
  "Tin Học": "tin",
};

// Helper function để lấy subject code từ tên hiển thị
export const getSubjectCode = (displayName: string): string => {
  const code = subjectCodeMapping[displayName] || displayName.toLowerCase();
  console.log("getSubjectCode:", displayName, "->", code);
  return code;
};
