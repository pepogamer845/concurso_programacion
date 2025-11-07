import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, TrendingDown, Award, BarChart3, Car, Zap, Utensils, Trash2 } from "lucide-react";
import heroImage from "@/assets/hero-earth.jpg";
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Auth from "@/components/Auth";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowDashboard(false);
  };

  if (showDashboard && currentUser) {
    return <Dashboard user={currentUser} onBack={handleLogout} />;
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 backdrop-blur-sm">
              <Leaf className="h-5 w-5 text-primary animate-pulse-eco" />
              <span className="text-sm font-medium text-primary">EcoTrack</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Programando Algoritmos{" "}
              <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                por la Tierra
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Monitorea y reduce tu huella de carbono personal. Transforma tus acciones cotidianas en un impacto positivo para el planeta.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowDashboard(true)}
              >
                <Leaf className="mr-2 h-5 w-5" />
                Comenzar Ahora
              </Button>
              <Button size="lg" variant="outline">
                Conocer Más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Funcionalidades Principales
            </h2>
            <p className="text-muted-foreground">
              Todo lo que necesitas para medir y reducir tu impacto ambiental
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Cálculo de Huella</h3>
              <p className="text-sm text-muted-foreground">
                Algoritmos precisos basados en estándares internacionales para calcular tu CO₂
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Visualización de Datos</h3>
              <p className="text-sm text-muted-foreground">
                Dashboard interactivo con gráficos y tendencias de tu impacto ambiental
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Gamificación</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de logros, puntos y retos para motivar cambios sostenibles
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <Leaf className="h-6 w-6 text-info" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Recomendaciones</h3>
              <p className="text-sm text-muted-foreground">
                Sugerencias personalizadas para reducir emisiones en tu día a día
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Categorías de Monitoreo
              </h2>
              <p className="text-muted-foreground">
                Registra actividades en cuatro áreas clave de impacto ambiental
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-8">
                <Car className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Transporte</h3>
                <p className="text-muted-foreground">
                  Vehículo propio, transporte público, bicicleta y caminata. Calcula emisiones por kilómetro recorrido.
                </p>
              </Card>

              <Card className="p-8">
                <Zap className="mb-4 h-10 w-10 text-warning" />
                <h3 className="mb-2 text-xl font-semibold">Energía Doméstica</h3>
                <p className="text-muted-foreground">
                  Monitorea consumo de electricidad, gas y agua en tu hogar para identificar oportunidades de ahorro.
                </p>
              </Card>

              <Card className="p-8">
                <Utensils className="mb-4 h-10 w-10 text-success" />
                <h3 className="mb-2 text-xl font-semibold">Alimentación</h3>
                <p className="text-muted-foreground">
                  Dieta carnívora, vegetariana, vegana. Calcula el impacto de tus hábitos alimenticios.
                </p>
              </Card>

              <Card className="p-8">
                <Trash2 className="mb-4 h-10 w-10 text-destructive" />
                <h3 className="mb-2 text-xl font-semibold">Gestión de Residuos</h3>
                <p className="text-muted-foreground">
                  Reciclaje, compostaje y residuos generados. Reduce tu impacto con mejores prácticas.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Empieza tu Viaje Sostenible Hoy
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Únete a miles de personas comprometidas con la reducción de su huella de carbono
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowDashboard(true)}
          >
            <Leaf className="mr-2 h-5 w-5" />
            Acceder al Dashboard
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>EcoTrack - Sistema de Monitoreo y Reducción de Huella de Carbono</p>
          <p className="mt-2">Proyecto académico - Programando Algoritmos por la Tierra</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
