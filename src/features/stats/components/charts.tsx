"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function shorten(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// ───────────── Giảng viên: đăng ký theo đề tài ─────────────

const registrationConfig = {
  accepted: { label: "Đã nhận", color: "var(--chart-3)" },
  pending: { label: "Chờ phản hồi", color: "var(--chart-4)" },
  rejected: { label: "Từ chối", color: "var(--chart-5)" },
} satisfies ChartConfig;

export type TopicRegistrationDatum = { title: string; accepted: number; pending: number; rejected: number };

/**
 * Biểu đồ cột ngang xếp chồng. Biểu đồ chỉ để nhìn nhanh; cùng số liệu luôn có
 * một bảng (sr-only) cho trình đọc màn hình, nên biểu đồ được ẩn khỏi cây trợ năng.
 */
export function RegistrationsByTopicChart({ data }: { data: TopicRegistrationDatum[] }) {
  return (
    <>
      <ChartContainer
        config={registrationConfig}
        className="w-full"
        style={{ height: Math.max(180, data.length * 48 + 70) }}
        aria-hidden="true"
      >
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barSize={18}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="title"
            width={170}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: string) => shorten(value, 24)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="accepted" stackId="status" fill="var(--color-accepted)" isAnimationActive={false} />
          <Bar dataKey="pending" stackId="status" fill="var(--color-pending)" isAnimationActive={false} />
          <Bar dataKey="rejected" stackId="status" fill="var(--color-rejected)" isAnimationActive={false} />
        </BarChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Số đăng ký theo đề tài và trạng thái</caption>
        <thead>
          <tr>
            <th scope="col">Đề tài</th>
            <th scope="col">Đã nhận</th>
            <th scope="col">Chờ phản hồi</th>
            <th scope="col">Từ chối</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.title}>
              <th scope="row">{row.title}</th>
              <td>{row.accepted}</td>
              <td>{row.pending}</td>
              <td>{row.rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ───────────── Quản trị: đề tài theo bộ môn ─────────────

const departmentConfig = {
  open: { label: "Đang nhận", color: "var(--chart-1)" },
  closed: { label: "Đã đóng", color: "var(--chart-2)" },
} satisfies ChartConfig;

export type DepartmentTopicDatum = { name: string; open: number; closed: number };

export function TopicsByDepartmentChart({ data }: { data: DepartmentTopicDatum[] }) {
  return (
    <>
      <ChartContainer config={departmentConfig} className="h-72 w-full" aria-hidden="true">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barSize={28}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(value: string) => shorten(value.replace("Vật lý ", "VL "), 14)}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="open" stackId="status" fill="var(--color-open)" isAnimationActive={false} />
          <Bar dataKey="closed" stackId="status" fill="var(--color-closed)" isAnimationActive={false} />
        </BarChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Số đề tài theo bộ môn</caption>
        <thead>
          <tr>
            <th scope="col">Bộ môn</th>
            <th scope="col">Đang nhận</th>
            <th scope="col">Đã đóng</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{row.open}</td>
              <td>{row.closed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
