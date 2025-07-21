import axios from "./axios";

//
// ===== PAGE VISITS (Lượt truy cập trang) =====
//

/**
 * Lấy tổng lượt truy cập trong 1 ngày cụ thể
 * @param data { date: "yyyy-MM-dd" }
 */
export const getVisitCountOnDay = (data: { date: string }) =>
    axios.post("/stats/visits/day", data);

/**
 * So sánh lượt truy cập hôm nay và hôm qua
 */
export const compareTodayWithYesterday = () =>
    axios.get("/stats/visits/today-vs-yesterday");

/**
 * Lấy tổng lượt truy cập trong khoảng ngày
 * @param data { from: "yyyy-MM-dd", to: "yyyy-MM-dd" }
 */
export const getVisitCountInRange = (data: { from: string; to: string }) =>
    axios.post("/stats/visits/range", data);

/**
 * So sánh lượt truy cập giữa 2 khoảng thời gian
 * Trả về count1, count2, phần trăm thay đổi
 */
export const compareVisitChange = (data: {
    from1: string;
    to1: string;
    from2: string;
    to2: string;
}) => axios.post("/stats/visits/compare", data);

/**
 * Trả về danh sách lượt truy cập mỗi ngày trong khoảng
 * Dùng để hiển thị biểu đồ
 */
export const getDailyVisitCounts = (data: { from: string; to: string }) =>
    axios.post("/stats/visits/daily", data);

/**
 * Lấy tổng lượt truy cập toàn hệ thống
 */
export const getTotalVisitCount = () =>
    axios.get("/stats/visits/total");

//
// ===== SEARCH COUNT (Thống kê tìm kiếm trường đại học) =====
//

/**
 * Thống kê tổng lượt tìm kiếm theo từng trường trong khoảng thời gian
 * Trả về danh sách trường + số lượt tìm kiếm
 */
export const getSearchStatsByUniversity = (data: { from: string; to: string }) =>
    axios.post("/stats/searcher/by-university", data);

/**
 * Trường được tìm kiếm nhiều nhất trong 1 ngày
 * @param data { date: "yyyy-MM-dd" }
 */
export const getTopUniversityOnDate = (data: { date: string }) =>
    axios.post("/stats/searcher/top-on-date", data);

/**
 * Trường được tìm kiếm nhiều nhất trong khoảng thời gian
 * @param data { from: "yyyy-MM-dd", to: "yyyy-MM-dd" }
 */
export const getTopUniversityInRange = (data: { from: string; to: string }) =>
    axios.post("/stats/searcher/top-in-range", data);

/**
 * Biểu đồ so sánh lượt tìm kiếm các trường qua từng ngày
 * Trả về mỗi trường 1 danh sách điểm (ngày + số lượt)
 */
export const getSearchTrend = (data: { from: string; to: string }) =>
    axios.post("/stats/searcher/trend", data);


/**
 * Biểu đồ lượt tìm kiếm của 1 trường qua từng ngày
 * Trả về 1 phần tử trong mảng gồm danh sách điểm (ngày + số lượt)
 */
export const getSearchTrendOfOne = (data: { universityId: number; from: string; to: string }) =>
    axios.post("/stats/searcher/trend-of-one", data);