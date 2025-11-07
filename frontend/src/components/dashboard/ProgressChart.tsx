import { Card } from "@/components/ui/card";
import { TrendingDown, Calendar, BarChart3 } from "lucide-react";

interface ProgressChartProps {
  user: any;
  activities: any[];
}

const ProgressChart = ({ user, activities }: ProgressChartProps) => {
  // Calculate progress for different time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const dailyActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= today;
  });

  const weeklyActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= weekStart;
  });

  const monthlyActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= monthStart;
  });

  const dailyCarbon = dailyActivities.reduce((sum, activity) => sum + (activity.carbonEmitted || 0), 0);
  const weeklyCarbon = weeklyActivities.reduce((sum, activity) => sum + (activity.carbonEmitted || 0), 0);
  const monthlyCarbon = monthlyActivities.reduce((sum, activity) => sum + (activity.carbonEmitted || 0), 0);

  const carbonGoal = user?.profile?.carbonGoal || 100;
  const dailyProgress = (dailyCarbon / (carbonGoal / 30)) * 100; // Daily goal estimate
  const weeklyProgress = (weeklyCarbon / (carbonGoal / 4)) * 100; // Weekly goal estimate
  const monthlyProgress = (monthlyCarbon / carbonGoal) * 100;

  const progressData = [
    {
      period: "Hoy",
      icon: Calendar,
      carbon: dailyCarbon,
      activities: dailyActivities.length,
      progress: Math.min(dailyProgress, 100),
      color: dailyProgress > 100 ? "text-red-500" : "text-green-500",
      bgColor: dailyProgress > 100 ? "bg-red-500" : "bg-green-500",
    },
    {
      period: "Esta Semana",
      icon: BarChart3,
      carbon: weeklyCarbon,
      activities: weeklyActivities.length,
      progress: Math.min(weeklyProgress, 100),
      color: weeklyProgress > 100 ? "text-red-500" : "text-blue-500",
      bgColor: weeklyProgress > 100 ? "bg-red-500" : "bg-blue-500",
    },
    {
      period: "Este Mes",
      icon: TrendingDown,
      carbon: monthlyCarbon,
      activities: monthlyActivities.length,
      progress: Math.min(monthlyProgress, 100),
      color: monthlyProgress > 100 ? "text-red-500" : "text-primary",
      bgColor: monthlyProgress > 100 ? "bg-red-500" : "bg-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {progressData.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${item.bgColor.replace('bg-', 'bg-opacity-10 bg-')}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{item.period}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.activities} actividades
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CO₂ Emitido</span>
                <span className={`font-bold ${item.color}`}>
                  {item.carbon.toFixed(1)} kg
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progreso</span>
                <span className={`font-bold ${item.color}`}>
                  {item.progress.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.bgColor}`}
                  style={{ width: `${Math.min(item.progress, 100)}%` }}
                />
              </div>

              {item.period === "Este Mes" && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Objetivo: {carbonGoal} kg</span>
                    <span>
                      {monthlyCarbon < carbonGoal
                        ? `-${(carbonGoal - monthlyCarbon).toFixed(1)} kg`
                        : `+${(monthlyCarbon - carbonGoal).toFixed(1)} kg`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ProgressChart;