import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ActivityFormProps {
  onSubmit: (activity: any) => void;
}

// Factores de emisión simplificados (kg CO2)
const emissionFactors: Record<string, Record<string, number>> = {
  transport: {
    coche: 0.21, // kg CO2 por km
    autobús: 0.089,
    bicicleta: 0,
    caminar: 0,
  },
  energy: {
    electricidad: 0.5, // kg CO2 por kWh
    gas: 2.3, // kg CO2 por m3
    agua: 0.001, // kg CO2 por litro
  },
  food: {
    carne: 7.2, // kg CO2 por comida
    vegetariano: 2.5,
    vegano: 1.5,
    local: 1.0,
  },
  waste: {
    reciclaje: -0.5, // negativo = ahorro
    compostaje: -0.3,
    general: 1.5,
  },
};

const ActivityForm = ({ onSubmit }: ActivityFormProps) => {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !type || !value) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const numValue = parseFloat(value);
    const factor = emissionFactors[category]?.[type] || 0;
    const carbonEmitted = numValue * factor;

    const activity = {
      category,
      type,
      value: numValue,
      carbonEmitted,
      date: new Date().toISOString(),
    };

    onSubmit(activity);
    
    toast.success(`Actividad registrada: ${carbonEmitted.toFixed(2)} kg CO₂`);
    
    // Reset form
    setCategory("");
    setType("");
    setValue("");
  };

  const getTypes = () => {
    if (!category) return [];
    return Object.keys(emissionFactors[category] || {});
  };

  const getUnit = () => {
    switch (category) {
      case "transport": return "km";
      case "energy": return type === "electricity" ? "kWh" : type === "gas" ? "m³" : "litros";
      case "food": return "comidas";
      case "waste": return "kg";
      default: return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecciona categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transport">🚗 Transporte</SelectItem>
            <SelectItem value="energy">⚡ Energía</SelectItem>
            <SelectItem value="food">🍽️ Alimentación</SelectItem>
            <SelectItem value="waste">♻️ Residuos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {category && (
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              {getTypes().map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type && (
        <div className="space-y-2">
          <Label htmlFor="value">Cantidad ({getUnit()})</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Ingresa cantidad en ${getUnit()}`}
          />
        </div>
      )}

      <Button type="submit" className="w-full">
        Registrar Actividad
      </Button>
    </form>
  );
};

export default ActivityForm;
