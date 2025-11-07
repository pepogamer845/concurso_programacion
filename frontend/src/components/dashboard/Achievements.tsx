import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap, Leaf, Target } from "lucide-react";

interface AchievementsProps {
  totalCarbon: number;
  activitiesCount: number;
}

const Achievements = ({ totalCarbon, activitiesCount }: AchievementsProps) => {
  const achievements = [
    {
      id: 1,
      title: "Primer Paso",
      description: "Registra tu primera actividad",
      icon: Star,
      unlocked: activitiesCount >= 1,
      progress: Math.min(activitiesCount, 1),
      total: 1,
    },
    {
      id: 2,
      title: "Comprometido",
      description: "Registra 10 actividades",
      icon: Zap,
      unlocked: activitiesCount >= 10,
      progress: Math.min(activitiesCount, 10),
      total: 10,
    },
    {
      id: 3,
      title: "Eco Guerrero",
      description: "Registra 50 actividades",
      icon: Trophy,
      unlocked: activitiesCount >= 50,
      progress: Math.min(activitiesCount, 50),
      total: 50,
    },
    {
      id: 4,
      title: "Guardián del Planeta",
      description: "Registra 100 actividades",
      icon: Leaf,
      unlocked: activitiesCount >= 100,
      progress: Math.min(activitiesCount, 100),
      total: 100,
    },
    {
      id: 5,
      title: "Emisiones Conscientes",
      description: "Mantente por debajo de 150 kg CO₂/mes",
      icon: Target,
      unlocked: totalCarbon > 0 && totalCarbon <= 150,
      progress: totalCarbon > 0 ? Math.min(150, totalCarbon) : 0,
      total: 150,
    },
    {
      id: 6,
      title: "Campeón Sostenible",
      description: "Mantente por debajo de 100 kg CO₂/mes",
      icon: Award,
      unlocked: totalCarbon > 0 && totalCarbon <= 100,
      progress: totalCarbon > 0 ? Math.min(100, totalCarbon) : 0,
      total: 100,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Tus Logros</h3>
            <p className="mt-2 text-muted-foreground">
              Has desbloqueado {unlockedCount} de {achievements.length} logros
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-12 w-12 text-primary" />
            <div className="text-right">
              <p className="text-3xl font-bold">{unlockedCount}</p>
              <p className="text-sm text-muted-foreground">logros</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-background/50">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.total) * 100;

          return (
            <Card
              key={achievement.id}
              className={`p-6 transition-all ${
                achievement.unlocked
                  ? "border-primary bg-primary/5"
                  : "opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`rounded-full p-3 ${
                    achievement.unlocked ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      achievement.unlocked ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Desbloqueado
                  </Badge>
                )}
              </div>

              <h4 className="mt-4 font-semibold">{achievement.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {achievement.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>
                    {achievement.progress} / {achievement.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      achievement.unlocked
                        ? "bg-gradient-to-r from-primary to-success"
                        : "bg-muted-foreground"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
