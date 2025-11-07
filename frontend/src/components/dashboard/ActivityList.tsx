import { Card } from "@/components/ui/card";
import { Car, Zap, Utensils, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
  id: number;
  category: string;
  type: string;
  value: number;
  carbonEmitted: number;
  date: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList = ({ activities }: ActivityListProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport": return <Car className="h-5 w-5 text-primary" />;
      case "energy": return <Zap className="h-5 w-5 text-warning" />;
      case "food": return <Utensils className="h-5 w-5 text-success" />;
      case "waste": return <Trash2 className="h-5 w-5 text-destructive" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transport": return "bg-primary/10";
      case "energy": return "bg-warning/10";
      case "food": return "bg-success/10";
      case "waste": return "bg-destructive/10";
      default: return "bg-muted";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No hay actividades registradas aún.</p>
        <p className="mt-2 text-sm">Comienza registrando tu primera actividad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-2 ${getCategoryColor(activity.category)}`}>
                {getCategoryIcon(activity.category)}
              </div>
              <div>
                <p className="font-medium capitalize">
                  {activity.type} - {activity.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.value} unidades • {format(new Date(activity.date), "d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${activity.carbonEmitted < 0 ? 'text-success' : 'text-foreground'}`}>
                {activity.carbonEmitted >= 0 ? '+' : ''}{activity.carbonEmitted.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">kg CO₂</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;
