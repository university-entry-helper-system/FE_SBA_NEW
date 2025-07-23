import React, { useEffect, useState } from "react";
import { DatePicker, Select, Table, Card, Button, ConfigProvider } from "antd";
import dayjs from "dayjs";
import {
    getSearchStatsByUniversity,
    getSearchTrendOfOne,
} from "../../api/stats";
import { getAllUniversities } from "../../api/university";
import { Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { AcademicCapIcon, ChartBarIcon, CalendarIcon } from "@heroicons/react/24/outline";
import "../../css/SearchChart.css"; // Assuming you have some custom styles

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

const SearchChart: React.FC = () => {
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
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4a90e2',
                    borderRadius: 8,
                    colorBgContainer: '#ffffff',
                },
                components: {
                    Table: {
                        headerBg: '#f0f4f8',
                        rowHoverBg: '#f8fafc',
                    },
                    Card: {
                        headerBg: '#f0f4f8',
                    },
                },
            }}
        >
            <div className=" min-h-screen bg-white p-6" style={{ paddingTop: '24px' }} >
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-gray-700 mb-6 text-center"
                >
                    Thống Kê Tìm Kiếm
                </motion.h1>

                {/* Top hôm nay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <AcademicCapIcon style={{ width: '16px', height: '16px' }} className="text-gray-700" />
                                <span className="text-lg font-semibold text-gray-700">Top 10 Trường Được Tìm Kiếm Hôm Nay</span>
                            </div>
                        }
                        className="mb-6 shadow-md rounded-lg border border-gray-200 bg-white"
                    >
                        <Table
                            dataSource={topToday}
                            rowKey="universityId"
                            pagination={false}
                            columns={[
                                {
                                    title: "#",
                                    render: (_record, _row, index: number) => (
                                        <span className="font-medium text-gray-700">{index + 1}</span>
                                    ),
                                    width: 60,
                                },
                                {
                                    title: "Tên Trường",
                                    dataIndex: "universityName",
                                    render: (text) => <span className="text-gray-800">{text}</span>,
                                },
                                {
                                    title: "Số Lượt Tìm Kiêm",
                                    dataIndex: "totalSearches",
                                    render: (text) => (
                                        <span className="font-semibold text-blue-600">{text}</span>
                                    ),
                                },
                            ]}
                            className="rounded-lg"
                        />
                    </Card>
                </motion.div>

                {/* Top theo tuần/tháng */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <ChartBarIcon style={{ width: '16px', height: '16px' }} className="text-gray-700" />
                                <span className="text-lg font-semibold text-gray-700">Top 10 Trường Theo Khoảng Thời Gian</span>
                            </div>
                        }
                        className="mb-6 shadow-md rounded-lg border border-gray-200 bg-white"
                        extra={
                            <Select
                                value={type}
                                onChange={(val) => { setType(val); fetchRangeStats(val); }}
                                className="w-32 text-gray-700 bg-white border border-gray-300 rounded-md"
                                classNames={{
                                    popup: { root: 'bg-white text-gray-700 rounded-md' },
                                }}
                            >
                                <Option value="week">Trong Tuần</Option>
                                <Option value="month">Trong Tháng</Option>
                            </Select>
                        }
                    >
                        <Table
                            dataSource={topRange}
                            rowKey="universityId"
                            pagination={{ pageSize: 10 }} // Giới hạn 10 phần tử mỗi trang
                            bordered
                            scroll={{ y: 300 }} // Bảng có thể cuộn dọc
                            columns={[
                                {
                                    title: "#",
                                    render: (_record, _row, index: number) => (
                                        <span className="font-medium text-gray-700">{index + 1}</span>
                                    ),
                                    width: 60,
                                },
                                {
                                    title: "Tên Trường",
                                    dataIndex: "universityName",
                                    render: (text) => <span className="text-gray-800">{text}</span>,
                                },
                                {
                                    title: "Số Lượt Tìm Kiếm",
                                    dataIndex: "totalSearches",
                                    render: (text) => (
                                        <span className="font-semibold text-green-600">{text}</span>
                                    ),
                                },
                            ]}
                            className="rounded-lg"
                        />
                    </Card>
                </motion.div>

                {/* Biểu đồ chi tiết */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <ChartBarIcon style={{ width: '16px', height: '16px' }} className="text-gray-700" />
                                <span className="text-lg font-semibold text-gray-700">Biểu Đồ Tìm Kiếm Theo Trường</span>
                            </div>
                        }
                        className="shadow-md rounded-lg border border-gray-200 bg-white"
                    >
                        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <Select
                                showSearch
                                placeholder="Chọn trường"
                                value={selectedUniversity}
                                onChange={setSelectedUniversity}
                                className="w-full sm:w-64 bg-white border border-gray-300 rounded-md"
                                optionFilterProp="children"
                                classNames={{
                                    popup: { root: 'bg-white text-gray-700 rounded-md' },
                                }}
                            >
                                {universities.map((u: University) => (
                                    <Option key={u.id} value={u.id}>
                                        {u.name}
                                    </Option>
                                ))}
                            </Select>
                            <DatePicker
                                placeholder="Từ ngày"
                                onChange={setFrom}
                                className="w-full sm:w-40 bg-white border border-gray-300 rounded-md"
                                suffixIcon={<CalendarIcon style={{ width: '16px', height: '16px' }} className="text-blue-600" />}
                                classNames={{
                                    popup: { root: 'bg-white text-gray-700 rounded-md' },
                                }}
                            />
                            <DatePicker
                                placeholder="Đến ngày"
                                onChange={setTo}
                                className="w-full sm:w-40 bg-white border border-gray-300 rounded-md"
                                suffixIcon={<CalendarIcon style={{ width: '16px', height: '16px' }} className="text-blue-600" />}
                                classNames={{
                                    popup: { root: 'bg-white text-gray-700 rounded-md' },
                                }}
                            />
                            <Button
                                type="primary"
                                onClick={handleLoadTrend}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                                icon={<ChartBarIcon style={{ width: '16px', height: '16px' }} />}
                            >
                                Xem Biểu Đồ
                            </Button>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart
                                data={trendData}
                                margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#4b5563', fontSize: 12 }}
                                    tickLine={{ stroke: '#4b5563' }}
                                />
                                <YAxis
                                    tick={{ fill: '#4b5563', fontSize: 12 }}
                                    tickLine={{ stroke: '#4b5563' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: 10 }} />
                                <Bar
                                    dataKey="count"
                                    barSize={30}
                                    fill="#4a90e2"
                                    name="Lượt Tìm Kiếm"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6ab04c"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#6ab04c' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                </motion.div>
            </div>
        </ConfigProvider>
    );
};

export default SearchChart;