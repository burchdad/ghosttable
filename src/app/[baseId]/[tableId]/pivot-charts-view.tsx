import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

type PivotAndChartsViewProps = { tableId: string };

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

type ChartDataItem = {
  name: string;
  value: number;
};

type AnalyticsData = {
  count: number;
  sumAmount: number;
  chartData: ChartDataItem[];
  amountDistribution?: { range: string; count: number }[];
  trendData?: { date: string; amount: number }[];
};

export default function PivotAndChartsView({ tableId }: PivotAndChartsViewProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [fields, setFields] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectedField, setSelectedField] = useState<string>("amount");

  useEffect(() => {
    // Simulate Barney GPT suggestions based on schema and data
    // In production, replace with real AI API call
    if (fields.length && data) {
      const suggestions: string[] = [];
      if (fields.some(f => f.name === "amount")) {
        suggestions.push("Show a histogram of Amount distribution.");
        suggestions.push("Add a trend chart for Amount over time.");
        suggestions.push("Set up an automation: If Amount > 1000, notify the team.");
      }
      if (fields.some(f => f.type === "checkbox")) {
        suggestions.push("Show percentage of Active vs Inactive records.");
        suggestions.push("Set up an automation: When Active is checked, set Amount to 0.");
      }
      setAiSuggestions(suggestions);
    }
    fetch(`/api/analytics?table_id=${tableId}&field=${selectedField}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, [tableId, selectedField]);

  useEffect(() => {
    fetch(`/api/fields?table_id=${tableId}`)
      .then(res => res.json())
      .then(setFields)
      .catch(() => setFields([]));
  }, [tableId]);

  return (
    <>
      {/* Scheduled Reports & Real-Time Dashboard Controls */}
      <div className="border rounded p-4 bg-green-50 mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-bold mb-2 text-green-700">Scheduled Reports</h3>
          <form onSubmit={e => { e.preventDefault(); alert('Report scheduled! (Demo)'); }} className="flex gap-2 items-center">
            <input type="email" placeholder="Email" className="border rounded px-2 py-1" required />
            <select className="border rounded px-2 py-1" defaultValue="daily">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button type="submit" className="border px-3 py-2 rounded bg-green-600 text-white">Schedule</button>
          </form>
        </div>
        <div>
          <h3 className="font-bold mb-2 text-green-700">Real-Time Dashboard</h3>
          <label className="flex items-center gap-2">
            <input type="checkbox" onChange={e => window.location.reload()} />
            <span>Enable Live Updates (Demo)</span>
          </label>
        </div>
      </div>
      {/* Documentation & Sharing Panel */}
      <div className="border rounded p-4 bg-blue-50 mb-4">
        <h3 className="font-bold mb-2 text-blue-700">Dashboard Documentation & Sharing</h3>
        <div className="mb-2 text-blue-900">
          <b>Table:</b> {tableId}<br />
          <b>Fields:</b> {fields.map(f => f.name).join(", ")}
        </div>
        <div className="mb-2 text-blue-900">
          <b>Charts:</b> Summary Cards, Amount Distribution, Trend Analysis, Bar, Pie, Line
        </div>
        <div className="mb-2 text-blue-900">
          <b>Automations:</b> {aiSuggestions.length > 0 ? aiSuggestions.filter(s => s.toLowerCase().includes("automation")).join("; ") : "None suggested"}
        </div>
        <button
          className="border px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            alert(`Dashboard link copied to clipboard!\n${url}`);
          }}
        >
          Copy Dashboard Link
        </button>
      </div>
      {/* Barney GPT Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <div className="border rounded p-4 bg-purple-50 mb-4">
          <h3 className="font-bold mb-2 text-purple-700">Barney GPT Suggestions</h3>
          <ul className="list-disc pl-6 text-purple-900">
            {aiSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Pivot & Charts</h2>
        {/* Field Selector */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Field:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedField}
            onChange={e => setSelectedField(e.target.value)}
          >
            {fields.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
        {data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded p-4 shadow">
                <div className="text-gray-500">Records</div>
                <div className="text-2xl font-bold">{data?.count}</div>
              </div>
              <div className="bg-white border rounded p-4 shadow">
                <div className="text-gray-500">Sum Amount</div>
                <div className="text-2xl font-bold">{data?.sumAmount}</div>
              </div>
              <div className="bg-white border rounded p-4 shadow">
                <div className="text-gray-500">Active %</div>
                <div className="text-2xl font-bold">{data?.count ? ((data?.chartData?.[0]?.value / data?.count) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>

            {/* Amount Distribution (Histogram) */}
            {data.amountDistribution && (
              <div className="border rounded p-4 bg-gray-50 mb-4">
                  <h3 className="font-bold mb-2">Amount Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.amountDistribution}>
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            )}

            {/* Trend Analysis (Amount over Time) */}
            {data.trendData && data.trendData.length > 0 && (
              <div className="border rounded p-4 bg-gray-50 mb-4">
                  <h3 className="font-bold mb-2">Amount Trend Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data?.trendData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#0088FE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            )}

            {/* Bar Chart */}
            <div className="border rounded p-4 bg-gray-50 mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {data?.chartData?.map((entry: ChartDataItem, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="border rounded p-4 bg-gray-50 mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data?.chartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="border rounded p-4 bg-gray-50 mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Advanced Analytics Placeholder */}
            <div className="border rounded p-4 bg-yellow-50 mb-4">
              <h3 className="font-bold mb-2">Advanced Analytics (Coming Soon)</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Field correlations</li>
                <li>Trend analysis</li>
                <li>Custom pivots</li>
                <li>Forecasting</li>
                <li>Outlier detection</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-gray-400">Loading analytics…</div>
        )}
      </div>
    </>
  );
}
