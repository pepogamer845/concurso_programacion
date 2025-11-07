import { Card } from "@/components/ui/card";
import { TrendingDown, Activity, Target, Award } from "lucide-react";

interface StatsCardsProps {
  totalCarbon: number;
  activitiesCount: number;
}

const StatsCards = ({ totalCarbon, activitiesCount }: StatsCardsProps) => {
  const monthlyGoal = 150;
  const progress = (totalCarbon / monthlyGoal) * 100;
  const daysThisMonth = new Date().getDate();
  const avgPerDay = activitiesCount > 0 ? totalCarbon / daysThisMonth : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Huella Total</p>
            <p className="mt-2 text-3xl font-bold">{totalCarbon.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ este mes</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <TrendingDown className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Actividades</p>
            <p className="mt-2 text-3xl font-bold">{activitiesCount}</p>
            <p className="text-xs text-muted-foreground">registradas</p>
          </div>
          <div className="rounded-full bg-success/10 p-3">
            <Activity className="h-6 w-6 text-success" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Promedio Diario</p>
            <p className="mt-2 text-3xl font-bold">{avgPerDay.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂/día</p>
          </div>
          <div className="rounded-full bg-accent/10 p-3">
            <Target className="h-6 w-6 text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Progreso</p>
            <p className="mt-2 text-3xl font-bold">{Math.min(progress, 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">del objetivo mensual</p>
          </div>
          <div className="rounded-full bg-info/10 p-3">
            <Award className="h-6 w-6 text-info" />
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCards;
