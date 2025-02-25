import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#2563eb",
      dark: "#3b82f6",
    },
  },
};

export const RevenueChart = () => {
  return (
    <div className="h-[350px] w-full mt-4">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 55 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={3}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
              className="stroke-primary"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
