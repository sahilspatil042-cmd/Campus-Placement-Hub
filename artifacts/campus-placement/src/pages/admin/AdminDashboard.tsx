import {
  useGetAnalyticsOverview,
  useGetApplicationStatusBreakdown,
  useGetApplicationsTrend,
  useGetPloDashboardOverview,
  useGetPlacementsByCompany,
} from '@workspace/api-client-react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  GraduationCap,
  Inbox,
  LineChart as LineChartIcon,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const numberFormat = new Intl.NumberFormat('en-IN');

function displayNumber(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : numberFormat.format(value);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingDashboard() {
  return (
    <div className="space-y-6" data-testid="state-dashboard-loading" aria-label="Loading placement overview">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="h-[360px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[360px] animate-pulse rounded-xl border bg-card" />
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/20 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground/60" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/75">New activity will appear here.</p>
    </div>
  );
}

function QueueItem({
  label,
  value,
  href,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  href: string;
  icon: typeof Building2;
  tone: 'amber' | 'teal' | 'rose' | 'blue';
}) {
  const toneClasses = {
    amber: 'bg-amber-100/80 text-amber-800',
    teal: 'bg-teal-100/80 text-teal-800',
    rose: 'bg-rose-100/80 text-rose-800',
    blue: 'bg-sky-100/80 text-sky-800',
  };

  return (
    <Link
      to={href}
      data-testid={`link-queue-${label.toLowerCase().replaceAll(' ', '-')}`}
      className="group flex items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/60"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">
          {value === undefined ? 'Awaiting API field' : value === 0 ? 'Queue is clear' : 'Needs review'}
        </span>
      </span>
      <span className="font-mono text-xl font-medium tabular-nums text-foreground">{displayNumber(value)}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function AdminDashboard() {
  const ploQuery = useGetPloDashboardOverview({
    query: { queryKey: ['/api/plo/dashboard/overview'], retry: false },
  });
  const analyticsQuery = useGetAnalyticsOverview({
    query: { queryKey: ['/api/analytics/overview'], retry: false },
  });
  const placementsQuery = useGetPlacementsByCompany({
    query: { queryKey: ['/api/analytics/placements-by-company'], retry: false },
  });
  const trendQuery = useGetApplicationsTrend({
    query: { queryKey: ['/api/analytics/applications-trend'], retry: false },
  });
  const statusQuery = useGetApplicationStatusBreakdown({
    query: { queryKey: ['/api/analytics/application-status-breakdown'], retry: false },
  });

  const isLoading =
    ploQuery.isLoading ||
    analyticsQuery.isLoading ||
    placementsQuery.isLoading ||
    trendQuery.isLoading ||
    statusQuery.isLoading;
  if (isLoading) return <LoadingDashboard />;

  const hasFallbackData = Boolean(analyticsQuery.data);
  const hasAnyData = Boolean(ploQuery.data || hasFallbackData || placementsQuery.data || trendQuery.data || statusQuery.data);
  const isError = !hasAnyData && (ploQuery.isError || analyticsQuery.isError || placementsQuery.isError || trendQuery.isError || statusQuery.isError);

  if (isError) {
    return (
      <Card className="mx-auto mt-10 max-w-xl border-rose-200 bg-rose-50/60" data-testid="state-dashboard-error">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <CircleAlert className="h-5 w-5" />
          </div>
          <CardTitle className="pt-2">Placement overview is unavailable</CardTitle>
          <CardDescription>
            We could not reach the placement data service. Try again, or continue once the service is back online.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            data-testid="button-retry-dashboard"
            onClick={() => {
              void ploQuery.refetch();
              void analyticsQuery.refetch();
              void placementsQuery.refetch();
              void trendQuery.refetch();
              void statusQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overview = ploQuery.data ?? analyticsQuery.data;
  const trend = ploQuery.data?.applicationsTrend ?? trendQuery.data ?? [];
  const statusBreakdown = ploQuery.data?.applicationStatusBreakdown ?? statusQuery.data ?? [];
  const placements = ploQuery.data?.placementsByCompany ?? placementsQuery.data ?? [];
  const placementRate =
    ploQuery.data?.placementRate ??
    analyticsQuery.data?.placementRate ??
    (overview?.totalStudents ? ((overview.placedStudents / overview.totalStudents) * 100) : undefined);

  const kpis = [
    { label: 'Students tracked', value: overview?.totalStudents, icon: GraduationCap, accent: 'text-teal-700 bg-teal-50' },
    { label: 'Active drives', value: overview?.activeDrives, icon: BriefcaseBusiness, accent: 'text-sky-700 bg-sky-50' },
    { label: 'Partner companies', value: overview?.totalCompanies, icon: Building2, accent: 'text-amber-700 bg-amber-50' },
    { label: 'Applications', value: overview?.totalApplications, icon: FileCheck2, accent: 'text-violet-700 bg-violet-50' },
    { label: 'Students placed', value: overview?.placedStudents, icon: BadgeCheck, accent: 'text-emerald-700 bg-emerald-50' },
    { label: 'Recruiters', value: overview?.totalRecruiters, icon: UsersRound, accent: 'text-indigo-700 bg-indigo-50' },
  ];

  return (
    <div className="space-y-6" data-testid="page-plo-dashboard">
      <section className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-teal-200 bg-teal-50/80 text-teal-800" data-testid="status-dashboard-live">
              <Activity className="mr-1.5 h-3 w-3" />
              Operations overview
            </Badge>
            {ploQuery.isError && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800" data-testid="status-dashboard-fallback">
                Analytics fallback
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">Placement desk</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            A quick read on campus hiring activity, approvals, and outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-dashboard-refresh">
          <span className="h-2 w-2 rounded-full bg-teal-500" />
          Live data
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="Placement key metrics">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="border-border/80 shadow-sm" data-testid={`card-kpi-${label.toLowerCase().replaceAll(' ', '-')}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 font-mono text-2xl font-medium tracking-tight text-foreground" data-testid={`value-kpi-${label.toLowerCase().replaceAll(' ', '-')}`}>
                {displayNumber(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="overflow-hidden border-border/80 shadow-sm" data-testid="panel-applications-trend">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChartIcon className="h-4 w-4 text-teal-700" />
                Application activity
              </CardTitle>
              <CardDescription className="mt-1">Monthly applications across all placement drives.</CardDescription>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">{trend.length ? `${trend.length} periods` : 'No activity'}</Badge>
          </CardHeader>
          <CardContent className="h-[300px] p-4 sm:p-6">
            {trend.length === 0 ? (
              <EmptyChart label="No application trend data" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary) / 0.25)' }}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="count" name="Applications" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm" data-testid="panel-review-queue">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              Review queue
            </CardTitle>
            <CardDescription className="mt-1">Approvals waiting for the placement office.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-3">
            <QueueItem label="Company approvals" value={ploQuery.data?.pendingCompanyApprovals} href="/plo/companies" icon={Building2} tone="amber" />
            <QueueItem label="Drive approvals" value={ploQuery.data?.pendingDriveApprovals} href="/plo/drives" icon={BriefcaseBusiness} tone="teal" />
            <QueueItem label="Result verification" value={ploQuery.data?.pendingResultVerification} href="/plo/result-verification" icon={FileCheck2} tone="rose" />
            <QueueItem label="Offer verification" value={ploQuery.data?.pendingOfferVerification} href="/plo/offer-verification" icon={BadgeCheck} tone="blue" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr_0.85fr]">
        <Card className="border-border/80 shadow-sm" data-testid="panel-placements-by-company">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-teal-700" />
              Placements by company
            </CardTitle>
            <CardDescription className="mt-1">Selected candidates by recruiting partner.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] p-4">
            {placements.length === 0 ? (
              <EmptyChart label="No placement outcomes yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placements.slice(0, 6)} layout="vertical" margin={{ top: 4, right: 10, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis dataKey="companyName" type="category" width={92} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Placed" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm" data-testid="panel-application-status">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck2 className="h-4 w-4 text-sky-700" />
              Application pipeline
            </CardTitle>
            <CardDescription className="mt-1">Where current applications stand today.</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[280px] flex-col justify-center gap-4 p-4 sm:flex-row sm:items-center">
            {statusBreakdown.length === 0 ? (
              <div className="w-full"><EmptyChart label="No application statuses yet" /></div>
            ) : (
              <>
                <div className="h-48 w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={52} outerRadius={78} paddingAngle={3}>
                        {statusBreakdown.map((entry: { status: string }, index: number) => (
                          <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2 sm:w-1/2">
                  {statusBreakdown.map((entry: { status: string; count: number }, index: number) => (
                    <div key={entry.status} className="flex items-center gap-2" data-testid={`status-application-${entry.status.toLowerCase()}`}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">{titleCase(entry.status)}</span>
                      <span className="font-mono text-sm tabular-nums text-foreground">{displayNumber(entry.count)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-sm" data-testid="card-placement-rate">
          <CardContent className="flex h-full min-h-[280px] flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--background)/0.1)]">
                <CheckCircle2 className="h-5 w-5 text-teal-300" />
              </span>
              <Badge variant="outline" className="border-[hsl(var(--background)/0.2)] text-[hsl(var(--background)/0.75)]" data-testid="status-placement-rate">
                Outcome
              </Badge>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--background)/0.65)]">Placement rate</p>
              <p className="mt-1 font-mono text-5xl font-medium tracking-[-0.06em]">{placementRate === undefined ? '—' : `${placementRate.toFixed(1)}%`}</p>
              <p className="mt-3 text-xs leading-5 text-[hsl(var(--background)/0.62)]">
                {overview?.placedStudents !== undefined && overview.totalStudents !== undefined
                  ? `${displayNumber(overview.placedStudents)} placed out of ${displayNumber(overview.totalStudents)} students tracked.`
                  : 'Placement rate will appear when the overview service responds.'}
              </p>
            </div>
            <Link to="/plo/statistics" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200" data-testid="link-view-statistics">
              Open statistics <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Placement workspace shortcuts">
        <Link to="/plo/notifications" data-testid="link-dashboard-notifications" className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/30">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><BellRing className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Notifications</span><span className="text-xs text-muted-foreground">Review office updates</span></span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </Link>
        <Link to="/plo/students" data-testid="link-dashboard-students" className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/30">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><GraduationCap className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Student directory</span><span className="text-xs text-muted-foreground">Open profiles and status</span></span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </Link>
        <Link to="/plo/profile" data-testid="link-dashboard-profile" className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50/30">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Clock3 className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Officer profile</span><span className="text-xs text-muted-foreground">Manage account details</span></span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </Link>
      </section>
    </div>
  );
}