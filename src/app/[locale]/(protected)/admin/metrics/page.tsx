'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type MetricsResponse = {
  ok: boolean;
  days: number;
  generatedAt: string;
  eventCount: number;
  totals: {
    uploads: number;
    rejectedUploads: number;
    convertStarted: number;
    success: number;
    failed: number;
    timeout: number;
    downloadStarted: number;
    downloadFailed: number;
    avgDurationMs: number;
    successRate: number;
    failureRate: number;
    timeoutRate: number;
    acceptanceRate: number;
  };
  failureByType: Record<string, number>;
  byFormat?: Record<
    string,
    {
      uploads: number;
      rejectedUploads: number;
      convertStarted: number;
      success: number;
      failed: number;
      downloadStarted: number;
      downloadFailed: number;
    }
  >;
};

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/metrics?days=7', { cache: 'no-store' });
        if (!response.ok) {
          setMetrics(null);
          return;
        }
        setMetrics((await response.json()) as MetricsResponse);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const totals = metrics?.totals;
  const failEntries = Object.entries(metrics?.failureByType || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const byFormatEntries = Object.entries(metrics?.byFormat || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Conversion Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Last 7 days operational summary for EPUB conversion.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Loading metrics...
          </CardContent>
        </Card>
      ) : !metrics || !totals ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Metrics service unavailable. Please verify converter service and API key.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard title="Uploads" value={`${totals.uploads}`} />
            <MetricCard title="Rejected Uploads" value={`${totals.rejectedUploads}`} />
            <MetricCard title="Acceptance Rate" value={`${(totals.acceptanceRate * 100).toFixed(1)}%`} />
            <MetricCard title="Success Rate" value={`${(totals.successRate * 100).toFixed(1)}%`} />
            <MetricCard title="Failure Rate" value={`${(totals.failureRate * 100).toFixed(1)}%`} />
            <MetricCard title="Avg Duration" value={`${(totals.avgDurationMs / 1000).toFixed(1)}s`} />
            <MetricCard title="Timeout Rate" value={`${(totals.timeoutRate * 100).toFixed(1)}%`} />
            <MetricCard title="Download Fails" value={`${totals.downloadFailed}`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Failure Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {failEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No failed conversions in the selected range.</p>
              ) : (
                <div className="space-y-2">
                  {failEntries.map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Format</CardTitle>
            </CardHeader>
            <CardContent>
              {byFormatEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No format-level events found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4">Format</th>
                        <th className="py-2 pr-4">Uploads</th>
                        <th className="py-2 pr-4">Rejected</th>
                        <th className="py-2 pr-4">Started</th>
                        <th className="py-2 pr-4">Success</th>
                        <th className="py-2 pr-4">Failed</th>
                        <th className="py-2 pr-4">DL Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byFormatEntries.map(([format, row]) => (
                        <tr key={format} className="border-b">
                          <td className="py-2 pr-4 font-medium">{format}</td>
                          <td className="py-2 pr-4">{row.uploads}</td>
                          <td className="py-2 pr-4">{row.rejectedUploads}</td>
                          <td className="py-2 pr-4">{row.convertStarted}</td>
                          <td className="py-2 pr-4">{row.success}</td>
                          <td className="py-2 pr-4">{row.failed}</td>
                          <td className="py-2 pr-4">{row.downloadFailed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
