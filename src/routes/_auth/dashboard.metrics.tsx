import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
  Users,
} from "lucide-react";
import { getBulkBookings, type Booking } from "@/lib/booking";

interface BookingMetrics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  rescheduled: number;
  completionRate: number;
  cancellationRate: number;
  avgDuration: number;
  upcomingToday: number;
  upcomingWeek: number;
  recentTrend: "up" | "down" | "stable";
  trendPercentage: number;
}

interface TimeSlotStats {
  hour: number;
  count: number;
}

export const Route = createFileRoute("/_auth/dashboard/metrics")({
  component: function() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [metrics, setMetrics] = useState<BookingMetrics | null>(null);
    const [timeSlotStats, setTimeSlotStats] = useState<TimeSlotStats[]>([]);

    useEffect(() => {
      // Replace with your actual data fetching function
      getBulkBookings().then((bookings) => {
        if (bookings) {
          setBookings(bookings);
        }
      });

      // Mock data for demonstration
      const mockBookings: Booking[] = [];
      setBookings(mockBookings);
    }, []);

    useEffect(() => {
      if (bookings.length === 0) return;

      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const pending = bookings.filter((b) => b.status === "pending").length;
      const completed = bookings.filter((b) => b.status === "completed").length;
      const cancelled = bookings.filter((b) => b.status === "cancelled").length;
      const rescheduled = bookings.filter(
        (b) => b.status === "rescheduled"
      ).length;

      const totalFinalized = completed + cancelled;
      const completionRate =
        totalFinalized > 0 ? (completed / totalFinalized) * 100 : 0;
      const cancellationRate =
        totalFinalized > 0 ? (cancelled / totalFinalized) * 100 : 0;

      const avgDuration =
        bookings.length > 0
          ? bookings.reduce((sum, b) => sum + b.duration, 0) / bookings.length
          : 0;

      const upcomingToday = bookings.filter(
        (b) => b.date === today && b.status === "pending"
      ).length;

      const upcomingWeek = bookings.filter(
        (b) =>
          b.date >= today &&
          b.date <= oneWeekFromNow &&
          b.status === "pending"
      ).length;

      // Calculate trend (comparing last 30 days to previous 30 days)
      const lastMonthBookings = bookings.filter(
        (b) => b.date >= oneMonthAgo && b.date < today
      ).length;
      const previousMonthBookings = bookings.filter(
        (b) => b.date >= twoMonthsAgo && b.date < oneMonthAgo
      ).length;

      let recentTrend: "up" | "down" | "stable" = "stable";
      let trendPercentage = 0;

      if (previousMonthBookings > 0) {
        const change =
          ((lastMonthBookings - previousMonthBookings) / previousMonthBookings) *
          100;
        trendPercentage = Math.abs(change);
        if (change > 5) recentTrend = "up";
        else if (change < -5) recentTrend = "down";
      }

      // Time slot analysis
      const hourCounts = new Map<number, number>();
      bookings.forEach((booking) => {
        const hour = parseInt(booking.start_time.split(":")[0]);
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });

      const slots = Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTimeSlotStats(slots);

      setMetrics({
        total: bookings.length,
        pending,
        completed,
        cancelled,
        rescheduled,
        completionRate,
        cancellationRate,
        avgDuration,
        upcomingToday,
        upcomingWeek,
        recentTrend,
        trendPercentage,
      });
    }, [bookings]);

    const formatTime = (hour: number) => {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:00 ${period}`;
    };

    const StatCard = ({
      title,
      value,
      icon: Icon,
      subtitle,
      trend,
      color = "bg-primary/10",
    }: {
      title: string;
      value: string | number;
      icon: any;
      subtitle?: string;
      trend?: { type: "up" | "down" | "stable"; value: number };
      color?: string;
    }) => (
      <div className="flex flex-col rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
              {trend && (
                <Badge
                  variant={
                    trend.type === "up"
                      ? "default"
                      : trend.type === "down"
                        ? "destructive"
                        : "secondary"
                  }
                  className="h-5 px-1.5 text-xs"
                >
                  {trend.type === "up" ? "↑" : trend.type === "down" ? "↓" : "→"}{" "}
                  {trend.value.toFixed(1)}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg ${color} p-2`}>
            <Icon className="size-5 text-foreground" />
          </div>
        </div>
      </div>
    );

    if (!metrics) {
      return (
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      );
    }

    return (
      <div className="flex space-y-6 h-full flex-col p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Booking Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Overview of your booking performance
            </p>
          </div>
          <Badge variant="outline" className="h-7 px-3">
            Last 30 days
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={metrics.total}
            icon={Calendar}
            trend={{
              type: metrics.recentTrend,
              value: metrics.trendPercentage,
            }}
            color="bg-blue-500/10"
          />
          <StatCard
            title="Upcoming Today"
            value={metrics.upcomingToday}
            icon={Clock}
            subtitle={`${metrics.upcomingWeek} this week`}
            color="bg-purple-500/10"
          />
          <StatCard
            title="Completion Rate"
            value={`${metrics.completionRate.toFixed(1)}%`}
            icon={CheckCircle2}
            subtitle={`${metrics.completed} completed`}
            color="bg-green-500/10"
          />
          <StatCard
            title="Avg Duration"
            value={`${Math.round(metrics.avgDuration)}m`}
            icon={TrendingUp}
            subtitle="Per booking"
            color="bg-orange-500/10"
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h3 className="mb-4 text-sm font-medium text-foreground">
              Status Distribution
            </h3>
            <div className="space-y-3">
              {[
                {
                  status: "Pending",
                  count: metrics.pending,
                  color: "bg-yellow-500",
                },
                {
                  status: "Completed",
                  count: metrics.completed,
                  color: "bg-green-500",
                },
                {
                  status: "Cancelled",
                  count: metrics.cancelled,
                  color: "bg-red-500",
                },
                {
                  status: "Rescheduled",
                  count: metrics.rescheduled,
                  color: "bg-blue-500",
                },
              ].map((item) => {
                const percentage =
                  metrics.total > 0 ? (item.count / metrics.total) * 100 : 0;
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${item.color}`} />
                        <span className="text-muted-foreground">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {item.count}
                        </span>
                        <span className="text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Time Slots */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h3 className="mb-4 text-sm font-medium text-foreground">
              Popular Time Slots
            </h3>
            {timeSlotStats.length > 0 ? (
              <div className="space-y-3">
                {timeSlotStats.map((slot, index) => {
                  const maxCount = timeSlotStats[0].count;
                  const percentage = (slot.count / maxCount) * 100;
                  return (
                    <div key={slot.hour} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-5 w-6 justify-center px-0 text-xs"
                          >
                            {index + 1}
                          </Badge>
                          <span className="text-muted-foreground">
                            {formatTime(slot.hour)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {slot.count} bookings
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">
                  No data available yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Performance Insights
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
              <CheckCircle2 className="size-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {metrics.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
              <XCircle className="size-8 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Cancellation Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {metrics.cancellationRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
              <Users className="size-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active Bookings</p>
                <p className="text-lg font-semibold text-foreground">
                  {metrics.pending + metrics.rescheduled}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
})
