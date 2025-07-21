import "../../css/AdminDashboard.css";
import { useState } from "react";
import { getDailyVisitCounts } from "../../api/stats";
import { DatePicker, Button } from "antd";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer } from "recharts";

import  { Dayjs } from "dayjs";

const VisitChart = () => {
    const [from, setFrom] = useState<Dayjs | null>(null);
    const [to, setTo] = useState<Dayjs | null>(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchChart = async () => {
        if (!from || !to) return;
        setLoading(true);
        try {
            const res = await getDailyVisitCounts({
                from: from?.format("YYYY-MM-DD"),
                to: to?.format("YYYY-MM-DD")
            });
            setData(res.data.result);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-[72px] p-6">  // thử với 64–80px tùy chiều cao navbar
            <h1 className="text-2xl font-bold mb-4">Biểu đồ lượt truy cập</h1>
            <div className="flex gap-4 mb-6">
                <DatePicker placeholder="Từ ngày" onChange={setFrom} format="YYYY-MM-DD" />
                <DatePicker placeholder="Đến ngày" onChange={setTo} format="YYYY-MM-DD" />
                <Button type="primary" onClick={fetchChart} loading={loading}>
                    Tải dữ liệu
                </Button>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" barSize={30} fill="#8884d8" name="Lượt truy cập" />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" name="Xu hướng" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VisitChart;
