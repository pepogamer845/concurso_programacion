import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    dietType: "omnivore",
    transportMode: "car",
    householdSize: 1,
    carbonGoal: 100,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Real API call to user service
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;

        // Get user profile
        const profileResponse = await fetch('http://localhost:8000/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();

          // Get user achievements and points
          const achievementsResponse = await fetch('http://localhost:8003/achievements', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const achievements = achievementsResponse.ok ? await achievementsResponse.json() : [];

          const user = {
            ...userData,
            token,
            achievements,
            points: 150, // This should come from analytics service
            level: 2, // This should be calculated based on points
          };

          toast({
            title: "¡Bienvenido!",
            description: `Hola ${user.name}, has iniciado sesión exitosamente.`,
          });

          onLogin(user);
        } else {
          throw new Error("Error al obtener perfil de usuario");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Credenciales inválidas");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Real API call to user service
      const registerPayload = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        country: registerData.country,
        diet_type: registerData.dietType,
        transport_mode: registerData.transportMode,
        household_size: registerData.householdSize,
        carbon_goal: registerData.carbonGoal,
      };

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerPayload),
      });

      if (response.ok) {
        const userData = await response.json();

        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.",
        });

        // Automatically login after registration
        const loginResponse = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          const token = loginData.access_token;

          const user = {
            ...userData,
            token,
            achievements: [],
            points: 10,
            level: 1,
          };

          onLogin(user);
        } else {
          // Registration successful but login failed - user can login manually
          setTimeout(() => {
            // Switch to login tab
            const loginTab = document.querySelector('[value="login"]') as HTMLElement;
            if (loginTab) loginTab.click();
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear la cuenta");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">EcoTrack</h1>
          </div>
          <p className="text-muted-foreground">
            Tu compañero para reducir la huella de carbono
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-country">País</Label>
                  <Input
                    id="register-country"
                    type="text"
                    placeholder="Tu país"
                    value={registerData.country}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, country: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Correo electrónico</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diet-type">Tipo de dieta</Label>
                  <select
                    id="diet-type"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={registerData.dietType}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, dietType: e.target.value })
                    }
                  >
                    <option value="omnivore">Omnívoro</option>
                    <option value="vegetarian">Vegetariano</option>
                    <option value="vegan">Vegano</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport-mode">Transporte principal</Label>
                  <select
                    id="transport-mode"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={registerData.transportMode}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, transportMode: e.target.value })
                    }
                  >
                    <option value="car">Automóvil</option>
                    <option value="public">Transporte público</option>
                    <option value="bicycle">Bicicleta</option>
                    <option value="walk">Caminar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="household-size">Tamaño del hogar</Label>
                  <Input
                    id="household-size"
                    type="number"
                    min="1"
                    max="10"
                    value={registerData.householdSize}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, householdSize: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbon-goal">Objetivo CO₂ (kg/mes)</Label>
                  <Input
                    id="carbon-goal"
                    type="number"
                    min="50"
                    max="500"
                    value={registerData.carbonGoal}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, carbonGoal: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;