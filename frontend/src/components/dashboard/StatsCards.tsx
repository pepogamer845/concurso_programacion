import { Card } from "@/components/ui/card";
import { TrendingDown, Activity, Target, Award, Trophy, Star } from "lucide-react";

interface StatsCardsProps {
  totalCarbon: number;
  activitiesCount: number;
  userPoints: number;
  userLevel: number;
  carbonGoal: number;
}

const StatsCards = ({ totalCarbon, activitiesCount, userPoints, userLevel, carbonGoal }: StatsCardsProps) => {
  const progress = (totalCarbon / carbonGoal) * 100;
  const daysThisMonth = new Date().getDate();
  const avgPerDay = activitiesCount > 0 ? totalCarbon / daysThisMonth : 0;
  const pointsToNextLevel = (userLevel * 100) - (userPoints % 100);

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
            <p className="text-sm font-medium text-muted-foreground">Puntos Eco</p>
            <p className="mt-2 text-3xl font-bold">{userPoints}</p>
            <p className="text-xs text-muted-foreground">Nivel {userLevel}</p>
          </div>
          <div className="rounded-full bg-warning/10 p-3">
            <Star className="h-6 w-6 text-warning" />
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-warning to-orange-500 transition-all"
              style={{ width: `${((userPoints % 100) / 100) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pointsToNextLevel} puntos para nivel {userLevel + 1}
          </p>
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
            <p className="text-sm font-medium text-muted-foreground">Progreso Objetivo</p>
            <p className="mt-2 text-3xl font-bold">{Math.min(progress, 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{carbonGoal} kg CO₂/mes</p>
          </div>
          <div className="rounded-full bg-info/10 p-3">
            <Target className="h-6 w-6 text-info" />
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
