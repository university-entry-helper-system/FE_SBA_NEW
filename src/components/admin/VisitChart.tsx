import React, { useState,useEffect } from "react";
// import { getDailyVisitCounts } from "../../api/stats";
import * as visitApi from "../../api/stats";// API lấy dữ liệu lượt truy cập
import dayjs, { Dayjs } from "dayjs";
import {  Card, Button, DatePicker, Row, Col, Statistic } from "antd";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer } from "recharts";


interface VisitData {
    date: string;   // ngày (string)
    count: number;  // số lượt truy cập (number)
}

const VisitChart: React.FC = () => {
    // Lấy tháng hiện tại làm mặc định
    const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);
    const [data, setData] = useState<VisitData[]>([]);
    const [data1, setData1] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(false);
    const [from, setFrom] = useState<Dayjs | null>(null);
    const [to, setTo] = useState<Dayjs | null>(null);
    const [totalVisits, setTotalVisits] = useState<number>(0);  // Tổng lượt truy cập
    const [todayVisits, setTodayVisits] = useState<number>(0);  // Lượt truy cập hôm nay

    useEffect(() => {
        const currentMonth = dayjs().startOf("month");  // Lấy tháng hiện tại và ngày đầu tháng
        setSelectedMonth(currentMonth);

        // Gọi API ngay khi component được load
        calculateSTotalAndDaily();
        fetchMonthlyStats(currentMonth);  // Truyền currentMonth vào hàm fetchMonthlyStats
    }, []);  // Chạy một lần duy nhất khi component render lần đầu tiên
        // Gọi API ngay khi component được load
    const fetchMonthlyStats = async (month: Dayjs) => {
        if (!month) return;
        setLoading(true);
        try {
            const monthString = month.format("YYYY-MM"); // Lấy tháng và năm từ người dùng
            const res = await visitApi.getDailyVisitCounts({
                from: `${monthString}-01`, // Lấy từ ngày đầu tháng
                to: `${monthString}-31`, // Lấy đến ngày cuối tháng (nếu tháng có 31 ngày)
            });
            setData(res.data.result);  // Cập nhật dữ liệu vào state
        } catch (error) {
            console.error("Error fetching visit data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán các chỉ số phân tích
    const calculateStatistics = () => {
        const totalVisitsOfMonth = data.reduce((acc: number, item: VisitData) => acc + item.count, 0);
        const averageVisits = totalVisitsOfMonth / data.length;

        // Tìm ngày có lượt truy cập nhiều nhất và ít nhất
        const maxDay = data.reduce((max: VisitData, item: VisitData) =>
            item.count > max.count ? item : max, data[0]);

        const minDay = data.reduce((min: VisitData, item: VisitData) =>
            item.count < min.count ? item : min, data[0]);
        console.log("asdasd");
        console.log(data);
        console.log(maxDay);
        console.log(minDay);

        return {
            totalVisitsOfMonth,
            averageVisits: averageVisits.toFixed(2),
            maxDay,
            minDay
        };
    };
    const fetchChart = async () => {
        if (!from || !to) return;
        setLoading(true);
        try {
            const res = await visitApi.getDailyVisitCounts({
                from: from?.format("YYYY-MM-DD"),
                to: to?.format("YYYY-MM-DD")
            });
            setData1(res.data.result);
        } finally {
            setLoading(false);
        }
    };
    const calculateSTotalAndDaily = async () => {

        const result = await visitApi.getTotalVisitCount();


       setTotalVisits(result.data.result || 0);

        // Lượt truy cập hôm nay
        const today = dayjs().format("YYYY-MM-DD");
        const todayData =await visitApi.getVisitCountOnDay({date: today});
        setTodayVisits(todayData.data.result || 0)
        console.log(result);
        console.log(todayData);
        console.log(todayVisits);
        console.log(totalVisits);

    };

    const { totalVisitsOfMonth, averageVisits, maxDay, minDay } = calculateStatistics();

    // Khai báo columns cho bảng
    // const columns = [
    //     {
    //         title: "Ngày",
    //         dataIndex: "date",
    //         key: "date",
    //     },
    //     {
    //         title: "Lượt Truy Cập",
    //         dataIndex: "count",
    //         key: "count",
    //     },
    // ];

    return (
        <div className=" p-6" style={{paddingTop: '24px'}}>
            <h1 className="text-2xl font-bold mb-4">Phân Tích Lượt Truy Cập</h1>

            <div className="flex gap-4 mb-6">
                {/* Date Picker cho chọn tháng và năm */}
                <DatePicker
                    picker="month"
                    placeholder="Chọn tháng và năm"
                    onChange={setSelectedMonth}
                    value={selectedMonth}
                    format="YYYY-MM"
                />
                <Button type="primary" onClick={() => fetchMonthlyStats(selectedMonth!)} loading={loading}>
                    Tải Dữ Liệu
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng Lượt Truy Cập"
                            value={totalVisitsOfMonth}
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Trung Bình Lượt Truy Cập Mỗi Ngày"
                            value={averageVisits}
                            precision={2}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Ngày Truy Cập Nhiều Nhất"
                            value={maxDay?.date}
                            suffix={`(${maxDay?.count} lượt)`}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Ngày Truy Cập Ít Nhất"
                            value={minDay?.date}
                            suffix={`(${minDay?.count} lượt)`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ lượt truy cập */}
            <div className="flex gap-4 mb-6">
                <DatePicker placeholder="Từ ngày" onChange={setFrom} format="YYYY-MM-DD" />
                <DatePicker placeholder="Đến ngày" onChange={setTo} format="YYYY-MM-DD" />
                <Button type="primary" onClick={fetchChart} loading={loading}>
                    Tải dữ liệu
                </Button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data1} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" barSize={30} fill="#8884d8" name="Lượt truy cập" />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" name="Line" />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Bảng phân tích */}
            <Card title="Lượt truy cập" className="mt-6">
                <Row gutter={16} className="mb-6">
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title="Lượt Truy Cập Hôm Nay"
                                value={todayVisits}
                                precision={0}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title="Tổng Lượt Truy Cập"
                                value={totalVisits}
                                precision={0}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default VisitChart;
