import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const CHART_TYPES = ["Bar", "Pie", "Line"];

type Field = { id: string; name: string; type: string };
type CustomChartBuilderProps = {
  fields: Field[];
  data: Record<string, any>[];
};

export default function CustomChartBuilder({ fields, data }: CustomChartBuilderProps) {
  const [chartType, setChartType] = useState("Bar");
  const [xField, setXField] = useState(fields[0]?.name || "");
  const [yField, setYField] = useState(fields[1]?.name || "");

  return (
    <div className="p-6 border rounded mb-4 bg-gray-50">
      <h3 className="font-bold mb-2">Custom Chart Builder</h3>
      <div className="mb-2">
        <label className="mr-2">Chart Type:</label>
        <select value={chartType} onChange={e => setChartType(e.target.value)} className="border rounded px-2 py-1">
          {CHART_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="mr-2">X Field:</label>
        <select value={xField} onChange={e => setXField(e.target.value)} className="border rounded px-2 py-1">
          {fields.map((f: Field) => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="mr-2">Y Field:</label>
        <select value={yField} onChange={e => setYField(e.target.value)} className="border rounded px-2 py-1">
          {fields.map((f: Field) => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
      </div>
      <div className="border rounded p-4 bg-white">
        <ResponsiveContainer width="100%" height={300}>
          <>
            {chartType === "Bar" && (
              <BarChart data={data}>
                <XAxis dataKey={xField} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={yField} fill="#8884d8" />
              </BarChart>
            )}
            {chartType === "Pie" && (
              <PieChart>
                <Pie data={data} dataKey={yField} nameKey={xField} cx="50%" cy="50%" outerRadius={100} label>
                  {data.map((entry: Record<string, any>, index: number) => (
                    <Cell key={`cell-${index}`} fill="#8884d8" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
            {chartType === "Line" && (
              <LineChart data={data}>
                <XAxis dataKey={xField} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yField} stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            )}
          </>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
