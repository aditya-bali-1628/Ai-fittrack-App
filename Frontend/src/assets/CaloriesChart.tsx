import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';

const CaloriesChart = () => {

    const { allActivityLogs, allFoodLogs } = useAppContext();

    const getData = () => {
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const dailyFood = allFoodLogs.filter(log => log.createdAt?.split('T')[0] === dateString);
            const dailyActivity = allActivityLogs.filter(log => log.createdAt?.split('T')[0] === dateString);

            const intake = dailyFood.reduce((sum, item) => sum + item.calories, 0);
            const burn = dailyActivity.reduce((sum, item) => sum + (item.calories || 0), 0);

            data.push({
                name: dayName,
                Intake: intake,
                Burn: burn,
                date: dateString
            });
        }
        return data;
    };

    const data = getData();

    return (
        <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                        className="dark:stroke-slate-700"
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        className="dark:text-slate-400"
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        className="dark:text-slate-400"
                    />

                    <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            padding: "8px",
                        }}
                    />

                    <Legend
                        iconType="circle"
                        wrapperStyle={{
                            paddingTop: "6px",
                            fontSize: "12px",
                        }}
                    />

                    <Bar
                        dataKey="Intake"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={10}
                        name="Intake"
                    />

                    <Bar
                        dataKey="Burn"
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                        barSize={10}
                        name="Burn"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CaloriesChart;
