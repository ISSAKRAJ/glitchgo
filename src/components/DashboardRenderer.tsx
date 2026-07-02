import React from 'react';
import {
  Card,
  Title,
  BarChart,
  LineChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell
} from '@tremor/react';

interface DashboardRendererProps {
  data: any[];
}

/**
 * DashboardRenderer dynamically analyzes database query output and renders
 * a LineChart (for timeseries data), a BarChart (for categorical data),
 * or fallbacks to a clean, paginated Tremor Table when charts aren't applicable.
 */
export default function DashboardRenderer({ data }: DashboardRendererProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-400 text-center py-6">
        No query results available to display.
      </Card>
    );
  }

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  // 1. Identify candidate index key (string or date representation)
  let indexKey = '';
  const dateIndicators = ['date', 'time', 'timestamp', 'month', 'year', 'day', 'created_at', 'updated_at', 'period'];
  
  // Try to find matching date keywords
  indexKey = keys.find(k => dateIndicators.includes(k.toLowerCase())) || '';

  if (!indexKey) {
    // Try to find category / label keyword indicators
    const catIndicators = ['category', 'name', 'status', 'label', 'key', 'id', 'type', 'country', 'city'];
    indexKey = keys.find(k => catIndicators.includes(k.toLowerCase())) || '';
  }

  if (!indexKey) {
    // Try to find the first string column
    indexKey = keys.find(k => typeof firstRow[k] === 'string') || '';
  }

  if (!indexKey) {
    // Fallback to first column key
    indexKey = keys[0] || '';
  }

  // 2. Identify metric keys (numeric values, excluding the indexKey)
  const metricKeys = keys.filter(k => {
    if (k === indexKey) return false;
    const val = firstRow[k];
    return typeof val === 'number';
  });

  // 3. Determine if indexKey points to a time-series column
  const isDateKey =
    dateIndicators.includes(indexKey.toLowerCase()) ||
    (typeof firstRow[indexKey] === 'string' &&
      !isNaN(Date.parse(String(firstRow[indexKey]))) &&
      isNaN(Number(firstRow[indexKey])));

  const valueFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
  };

  // Render Logic
  // Case A: Has metric columns + Time-Series index -> Line Chart
  if (metricKeys.length > 0 && isDateKey) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl">
        <Title className="text-zinc-200 text-sm font-semibold mb-2">Trend Analysis (Line Chart)</Title>
        <LineChart
          data={data}
          index={indexKey}
          categories={metricKeys}
          colors={['indigo', 'emerald', 'violet', 'amber', 'rose']}
          valueFormatter={valueFormatter}
          className="h-72 mt-4 text-zinc-300"
        />
      </Card>
    );
  }

  // Case B: Has metric columns + Categorical index -> Bar Chart
  if (metricKeys.length > 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl">
        <Title className="text-zinc-200 text-sm font-semibold mb-2">Metrics Summary (Bar Chart)</Title>
        <BarChart
          data={data}
          index={indexKey}
          categories={metricKeys}
          colors={['indigo', 'emerald', 'violet', 'amber', 'rose']}
          valueFormatter={valueFormatter}
          className="h-72 mt-4 text-zinc-300"
        />
      </Card>
    );
  }

  // Case C: Fallback to high-fidelity Table
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl overflow-hidden">
      <Title className="text-zinc-200 text-sm font-semibold mb-4">Results Table</Title>
      <div className="overflow-x-auto">
        <Table className="mt-4">
          <TableHead>
            <TableRow className="border-zinc-800">
              {keys.map((key) => (
                <TableHeaderCell key={key} className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] py-3 px-4">
                  {key}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-zinc-800">
            {data.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-zinc-900/30 transition-colors border-zinc-800">
                {keys.map((key) => (
                  <TableCell key={key} className="text-zinc-300 font-mono py-2.5 px-4 text-xs">
                    {typeof item[key] === 'object' && item[key] !== null
                      ? JSON.stringify(item[key])
                      : String(item[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
