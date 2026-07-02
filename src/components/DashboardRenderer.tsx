import React from 'react';
import {
  Card,
  Title,
  BarChart,
  AreaChart,
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
 * DashboardRenderer dynamically analyzes database query output with strict
 * Data Analyst heuristics to determine whether to render an AreaChart, BarChart, or Table.
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

  // 1. RULE 1: Detect raw entity columns or excessive text columns
  const entityPatterns = /email|name|description|password|title|body|url|website|address|phone|slug|comment|content/i;
  let hasEntityColumns = false;
  let textColumnCount = 0;

  keys.forEach((key) => {
    const val = firstRow[key];
    if (typeof val === 'string') {
      textColumnCount++;
      if (entityPatterns.test(key)) {
        hasEntityColumns = true;
      }
    }
  });

  // If there are columns indicating raw entity data or if there are > 3 text columns, ALWAYS render a Table.
  if (hasEntityColumns || textColumnCount > 3) {
    return renderTable(data, keys);
  }

  // 2. RULE 2: Exclude identifiers from metric calculations (Y-Axis Y-Values)
  const isIdentifier = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return lowerKey === 'id' || lowerKey === 'uuid' || lowerKey.endsWith('_id') || lowerKey.endsWith('id');
  };

  // Find candidate index columns (for the X-Axis)
  const dateIndicators = ['date', 'time', 'timestamp', 'month', 'year', 'day', 'created_at', 'updated_at', 'period'];
  let indexKey = keys.find(k => dateIndicators.includes(k.toLowerCase())) || '';

  if (!indexKey) {
    // Look for string columns that are NOT identifiers
    indexKey = keys.find(k => typeof firstRow[k] === 'string' && !isIdentifier(k)) || '';
  }

  if (!indexKey) {
    // If no clean index key found, use the first key (which might be an ID)
    indexKey = keys[0] || '';
  }

  // Filter keys for numeric metrics, strictly excluding identifiers
  const metricKeys = keys.filter(k => {
    if (k === indexKey) return false;
    if (isIdentifier(k)) return false;
    const val = firstRow[k];
    return typeof val === 'number';
  });

  // 3. RULE 3: Chart Choice (Single Date/String index + 1 or more non-ID numeric columns)
  if (metricKeys.length > 0 && indexKey) {
    const isDateKey =
      dateIndicators.includes(indexKey.toLowerCase()) ||
      (typeof firstRow[indexKey] === 'string' &&
        !isNaN(Date.parse(String(firstRow[indexKey]))) &&
        isNaN(Number(firstRow[indexKey])));

    const valueFormatter = (number: number) => {
      return Intl.NumberFormat('us').format(number).toString();
    };

    if (isDateKey) {
      // Time-series -> AreaChart
      return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl">
          <Title className="text-zinc-200 text-xs font-bold tracking-wider uppercase mb-2">Trend Analysis (Area Chart)</Title>
          <AreaChart
            data={data}
            index={indexKey}
            categories={metricKeys}
            colors={['indigo', 'emerald', 'violet', 'amber', 'rose']}
            valueFormatter={valueFormatter}
            className="h-72 mt-4 text-zinc-300"
          />
        </Card>
      );
    } else {
      // Categorical -> BarChart
      return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl">
          <Title className="text-zinc-200 text-xs font-bold tracking-wider uppercase mb-2">Metrics Summary (Bar Chart)</Title>
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
  }

  // 4. RULE 4: Fallback to Table
  return renderTable(data, keys);
}

/**
 * Standard dynamic Tremor Table renderer.
 */
function renderTable(data: any[], keys: string[]) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-xl overflow-hidden">
      <Title className="text-zinc-200 text-xs font-bold tracking-wider uppercase mb-4">Results Table</Title>
      <div className="overflow-x-auto">
        <Table className="mt-2">
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
