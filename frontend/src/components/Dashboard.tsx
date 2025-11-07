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
import ProgressChart from "./dashboard/ProgressChart";

interface DashboardProps {
  user: any;
  onBack: () => void;
}

const Dashboard = ({ user, onBack }: DashboardProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  const [userLevel, setUserLevel] = useState(user?.level || 1);

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
                  ¡Hola, {user?.name}! Nivel {userLevel} • {userPoints} puntos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Objetivo: {user?.profile?.carbonGoal || 100} kg CO₂/mes
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Progress Tracking */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tu Progreso</h2>
          <ProgressChart user={user} activities={activities} />
        </div>

        {/* Stats Overview */}
        <StatsCards
          totalCarbon={totalCarbon}
          activitiesCount={activities.length}
          userPoints={userPoints}
          userLevel={userLevel}
          carbonGoal={user?.profile?.carbonGoal || 100}
        />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
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
            <TabsTrigger value="challenges">
              Retos
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              Ranking
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
                  Basadas en tus patrones de uso y preferencias
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary p-4">
                  <h4 className="mb-2 font-semibold">🚴 Transporte Sostenible</h4>
                  <p className="text-sm text-muted-foreground">
                    Como usas automóvil frecuentemente, considera bicicleta para distancias menores a 5km. Podrías reducir 2.3 kg CO₂/día.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-success p-4">
                  <h4 className="mb-2 font-semibold">💡 Eficiencia Energética</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu consumo eléctrico es alto. Cambia a LED y usa electrodomésticos eficientes. Ahorro: 15 kg CO₂/mes.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-accent p-4">
                  <h4 className="mb-2 font-semibold">🥗 Alimentación Consciente</h4>
                  <p className="text-sm text-muted-foreground">
                    Como omnívoro, reduce carne roja 2 días/semana. Prueba opciones vegetarianas locales.
                  </p>
                </Card>

                <Card className="border-l-4 border-l-info p-4">
                  <h4 className="mb-2 font-semibold">♻️ Reciclaje Efectivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Mejora tu separación de residuos. Organiza contenedores específicos para cada tipo de material.
                  </p>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Retos Activos</h3>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-warning p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">🚴 Semana sin Auto</h4>
                      <span className="text-sm bg-warning/10 text-warning px-2 py-1 rounded">3/7 días</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Usa bicicleta, caminar o transporte público toda la semana.
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{width: '43%'}}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recompensa: 50 puntos + Insignia "Eco Rider"</p>
                  </Card>

                  <Card className="border-l-4 border-l-success p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">🥗 Mes Vegetariano</h4>
                      <span className="text-sm bg-success/10 text-success px-2 py-1 rounded">12/30 días</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Come al menos una comida vegetariana al día durante el mes.
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{width: '40%'}}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recompensa: 100 puntos + Insignia "Green Eater"</p>
                  </Card>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Retos Completados</h3>
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-primary p-4 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">Primeros Pasos</h4>
                        <p className="text-sm text-muted-foreground">Registraste tu primera actividad</p>
                      </div>
                      <span className="ml-auto text-sm font-medium text-primary">+10 pts</span>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="p-8">
              <div className="mb-6 text-center">
                <Award className="mx-auto mb-4 h-12 w-12 text-warning" />
                <h3 className="mb-2 text-2xl font-semibold">Ranking Comunitario</h3>
                <p className="text-muted-foreground">
                  Compite con otros usuarios por el menor impacto ambiental
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-warning p-4 bg-gradient-to-r from-warning/10 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-warning text-white rounded-full font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">EcoWarrior</h4>
                      <p className="text-sm text-muted-foreground">Colombia • 150.5 kg CO₂/mes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-warning">1,250 pts</p>
                      <p className="text-xs text-muted-foreground">Nivel 8</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-gray-400 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-400 text-white rounded-full font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">GreenHero</h4>
                      <p className="text-sm text-muted-foreground">México • 120.3 kg CO₂/mes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-600">1,180 pts</p>
                      <p className="text-xs text-muted-foreground">Nivel 7</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-amber-600 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-600 text-white rounded-full font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{user?.name || 'Tú'}</h4>
                      <p className="text-sm text-muted-foreground">{user?.country || 'Colombia'} • {totalCarbon.toFixed(1)} kg CO₂/mes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{userPoints} pts</p>
                      <p className="text-xs text-muted-foreground">Nivel {userLevel}</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-gray-400 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-400 text-white rounded-full font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">PlanetSaver</h4>
                      <p className="text-sm text-muted-foreground">Argentina • 98.7 kg CO₂/mes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-600">950 pts</p>
                      <p className="text-xs text-muted-foreground">Nivel 6</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">📊 Comparación Global</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Promedio Mundial</p>
                    <p className="font-bold">480 kg CO₂/mes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tu Posición</p>
                    <p className="font-bold text-amber-600">#3 en Colombia</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
