import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface Activity {
  category: string;
  carbonEmitted: number;
}

interface CarbonChartProps {
  activities: Activity[];
}

const CarbonChart = ({ activities }: CarbonChartProps) => {
  const categoryData = useMemo(() => {
    const categories = {
      transport: { total: 0, label: "Transporte", color: "bg-primary" },
      energy: { total: 0, label: "Energía", color: "bg-warning" },
      food: { total: 0, label: "Alimentación", color: "bg-success" },
      waste: { total: 0, label: "Residuos", color: "bg-destructive" },
    };

    activities.forEach((activity) => {
      if (categories[activity.category as keyof typeof categories]) {
        categories[activity.category as keyof typeof categories].total += activity.carbonEmitted;
      }
    });

    const total = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);

    return Object.entries(categories).map(([key, data]) => ({
      key,
      ...data,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }));
  }, [activities]);

  const maxValue = Math.max(...categoryData.map(d => d.total), 1);

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No hay datos para mostrar.</p>
        <p className="mt-2 text-sm">Registra actividades para ver el gráfico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryData.map((category) => (
        <div key={category.key} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{category.label}</span>
            <span className="text-muted-foreground">
              {category.total.toFixed(1)} kg CO₂ ({category.percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${category.color}`}
              style={{ width: `${(category.total / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}

      <Card className="mt-6 bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total de Emisiones</span>
          <span className="text-lg font-bold">
            {categoryData.reduce((sum, cat) => sum + cat.total, 0).toFixed(1)} kg CO₂
          </span>
        </div>
      </Card>
    </div>
  );
};

export default CarbonChart;
