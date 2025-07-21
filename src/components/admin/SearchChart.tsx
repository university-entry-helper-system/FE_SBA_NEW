import "../../css/AdminDashboard.css";
import { useEffect, useState } from "react";
import { DatePicker, Select, Table, Card, Button } from "antd";
import dayjs from "dayjs";
import {
    // getTopUniversityOnDate,
    getSearchStatsByUniversity,
    getSearchTrendOfOne,

}  from "../../api/stats";
import {getAllUniversities} from "../../api/university";
import {Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from "recharts";
type UniversitySearchStatResponse = {
    universityId: number;
    universityName: string;
    totalSearches: number;
};

type University = {
    id: number;
    name: string;
    status: string;
};

const { Option } = Select;

const SearchChart = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const [topToday, setTopToday] = useState<UniversitySearchStatResponse[]>([]);
    const [topRange, setTopRange] = useState<UniversitySearchStatResponse[]>([]);
    const [type, setType] = useState<"week" | "month">("week");

    const [universities, setUniversities] = useState<University[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
    const [from, setFrom] = useState<dayjs.Dayjs | null>(null);
    const [to, setTo] = useState<dayjs.Dayjs | null>(null);
    const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);

    useEffect(() => {
        const fetchToday = async () => {
            const res = await getSearchStatsByUniversity({ from: today, to: today });
            setTopToday(res.data.result.slice(0, 10));
        };

        const fetchUniversities = async () => {
            const res = await getAllUniversities();
            setUniversities(res.data.result.items);
        };

        fetchToday();
        fetchUniversities();
        fetchRangeStats("week");
    }, [today]);

    const fetchRangeStats = async (selectedType: "week" | "month") => {
        const now = dayjs();
        const from = selectedType === "week" ? now.subtract(6, "day") : now.startOf("month");
        const to = now;

        const res = await getSearchStatsByUniversity({
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD"),
        });

        setTopRange(res.data.result.slice(0, 10));
    };

    const handleLoadTrend = async () => {
        if (selectedUniversity && from && to) {
            const res = await getSearchTrendOfOne({
                universityId: selectedUniversity,
                from: from.format("YYYY-MM-DD"),
                to: to.format("YYYY-MM-DD"),
            });

            setTrendData(res.data.result.data || []);
        }
    };

    return (
        <div className="pt-[72px] p-6">  // thử với 64–80px tùy chiều cao navbar
            <h1 className="text-2xl font-bold mb-4">Thống kê tìm kiếm</h1>

            {/* Top hôm nay */}
            <Card
                title={<span className="text-lg font-semibold text-blue-700">Top 10 trường được tìm kiếm hôm nay</span>}
                className="mb-6 bg-white shadow-md rounded-md"
            >
                <Table

                    dataSource={topToday}
                    rowKey="universityId"
                    pagination={false}
                    columns={[
                        {
                            title: "#",
                            render: (_record, _row, index: number) => index + 1,
                        },
                        { title: "Tên trường", dataIndex: "universityName" },
                        { title: "Số lượt tìm kiếm", dataIndex: "totalSearches" },
                    ]}
                />
            </Card>

            {/* Top theo tuần/tháng */}
            <Card
                title="Top 10 trường theo khoảng"
                className="mb-6"
                extra={
                    <Select value={type} onChange={(val) => { setType(val); fetchRangeStats(val); }}>
                        <Option value="week">Trong tuần</Option>
                        <Option value="month">Trong tháng</Option>
                    </Select>
                }
            >
                <Table
                    dataSource={topRange}
                    rowKey="universityId"
                    pagination={false}
                    bordered
                    className="bg-white shadow-sm"
                    columns={[
                        {
                            title: "#",
                            render: (_record, _row, index: number) => index + 1,
                        },
                        { title: "Tên trường", dataIndex: "universityName" },
                        { title: "Số lượt tìm kiếm", dataIndex: "totalSearches" },
                    ]}
                />
            </Card>

            {/* Biểu đồ chi tiết */}
            <Card
                title="Biểu đồ theo trường"
                className="bg-white shadow-md rounded-md"
            >
                <div className="flex gap-4 mb-4">
                    <Select
                        showSearch
                        placeholder="Chọn trường"
                        value={selectedUniversity}
                        onChange={setSelectedUniversity}
                        style={{ minWidth: 240 }}
                        optionFilterProp="children"
                    >
                        {universities.map((u: University) => (
                            <Option key={u.id} value={u.id}>
                                {u.name}
                            </Option>
                        ))}
                    </Select>

                    <DatePicker placeholder="Từ ngày" onChange={setFrom} />
                    <DatePicker placeholder="Đến ngày" onChange={setTo} />
                    <Button type="primary" onClick={handleLoadTrend} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        Xem biểu đồ
                    </Button>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={trendData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" barSize={30} fill="#8884d8" name="Lượt tìm kiếm"/>
                        <Line type="monotone" dataKey="count" stroke="#ff7300" />
                    </ComposedChart>
                </ResponsiveContainer>

            </Card>
        </div>
    );
};

export default SearchChart;
