import React from 'react';
import CountUp from 'react-countup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, BarChart3, Briefcase, Target, TrendingUp, Timer } from 'lucide-react';

interface DashboardStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  activeProjects: number;
  avgHoursPerDay: number;
  avgHoursPerWeek: number;
  workingDaysThisMonth: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statsData = [
    {
      title: "Today's Hours",
      value: stats.todayHours,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      suffix: "h",
      description: "Hours logged today"
    },
    {
      title: "This Month",
      value: stats.monthHours,
      icon: BarChart3,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      suffix: "h",
      description: `${stats.workingDaysThisMonth} working days`
    },
    {
      title: "Avg Hours/Day",
      value: stats.avgHoursPerDay,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
      suffix: "h",
      description: "Daily average this month"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: Briefcase,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      suffix: "",
      description: "Projects worked on"
    },
    {
      title: "Working Days",
      value: stats.workingDaysThisMonth,
      icon: Timer,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      suffix: " days",
      description: "Days logged this month"
    },
    {
      title: "This Week",
      value: stats.weekHours,
      icon: Calendar,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
      suffix: "h",
      description: "7-day total"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={index} className="card-enhanced hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-1">
                <div className="text-2xl font-bold text-slate-900">
                  <CountUp
                    end={stat.value}
                    duration={1.5}
                    decimals={stat.suffix === 'h' ? 1 : 0}
                    preserveValue
                  />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {stat.suffix}
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-slate-500">
                  <span>{stat.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
