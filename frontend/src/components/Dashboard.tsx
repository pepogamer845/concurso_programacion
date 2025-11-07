import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Leaf, TrendingDown, Award, Target } from "lucide-react";
import StatsCards from "./dashboard/StatsCards";
import ActivityForm from "./dashboard/ActivityForm";
import ActivityList from "./dashboard/ActivityList";
import CarbonChart from "./dashboard/CarbonChart";
import Achievements from "./dashboard/Achievements";

interface DashboardProps {
  onBack: () => void;
}

const Dashboard = ({ onBack }: DashboardProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [totalCarbon, setTotalCarbon] = useState(0);

  const handleActivityAdd = (activity: any) => {
    setActivities([...activities, { ...activity, id: Date.now() }]);
    setTotalCarbon(totalCarbon + activity.carbonEmitted);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold">EcoTrack Dashboard</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitorea tu huella de carbono en tiempo real
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Target className="mr-2 h-4 w-4" />
              Mi Objetivo: 150 kg CO₂/mes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Stats Overview */}
        <StatsCards totalCarbon={totalCarbon} activitiesCount={activities.length} />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">
              <TrendingDown className="mr-2 h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Leaf className="mr-2 h-4 w-4" />
              Actividades
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="mr-2 h-4 w-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              Recomendaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Emisiones por Categoría</h3>
                <CarbonChart activities={activities} />
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Registrar Nueva Actividad</h3>
                <ActivityForm onSubmit={handleActivityAdd} />
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Actividades Recientes</h3>
              <ActivityList activities={activities.slice(-5).reverse()} />
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-1">
                <h3 className="mb-4 text-lg font-semibold">Nueva Actividad</h3>
                <ActivityForm onSubmit={handleActivityAdd} />
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Todas las Actividades</h3>
                <ActivityList activities={activities.slice().reverse()} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements totalCarbon={totalCarbon} activitiesCount={activities.length} />
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="p-8">
              <div className="mb-6 text-center">
                <Leaf className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-2xl font-semibold">Recomendaciones Personalizadas</h3>
                <p className="text-muted-foreground">
                  Basadas en tus actividades recientes
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary p-4">
                  <h4 className="mb-2 font-semibold">🚴 Transporte Sostenible</h4>
                  <p className="text-sm text-muted-foreground">
                    Considera usar bicicleta o transporte público para distancias cortas. Podrías reducir hasta 2.3 kg CO₂ por día.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-success p-4">
                  <h4 className="mb-2 font-semibold">💡 Eficiencia Energética</h4>
                  <p className="text-sm text-muted-foreground">
                    Cambia a bombillas LED y desconecta dispositivos en stand-by. Ahorro estimado: 15 kg CO₂/mes.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-accent p-4">
                  <h4 className="mb-2 font-semibold">🥗 Alimentación Consciente</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce el consumo de carne roja 2 días por semana. Impacto: -8 kg CO₂/mes.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-info p-4">
                  <h4 className="mb-2 font-semibold">♻️ Reciclaje Efectivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Separa correctamente plástico, papel y orgánicos. Reduce 5 kg CO₂/mes en procesamiento de residuos.
                  </p>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
