import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dotaRoles = [
  "Carry",
  "Support",
  "Nuker",
  "Disabler",
  "Jungler",
  "Durable",
  "Escape",
  "Pusher",
  "Initiator",
];

interface HeroFiltersPanelProps {
  searchQuery: string;
  selectedRoles: string[];
  onSearchChange: (value: string) => void;
  onToggleRole: (role: string) => void;
  onClearRoles: () => void;
}

const HeroFiltersPanel = ({
  searchQuery,
  selectedRoles,
  onSearchChange,
  onToggleRole,
  onClearRoles,
}: HeroFiltersPanelProps) => {
  return (
    <div className="h-full p-4">
      <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-2xl">Фильтры героев</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-foreground/90">
              Поиск героя
            </p>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Например, Juggernaut"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-base placeholder:text-muted-foreground/80"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-foreground/90">
                Роли
              </p>
              {selectedRoles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-sm"
                  onClick={onClearRoles}
                >
                  Сбросить
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {dotaRoles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRoles.includes(role) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleRole(role)}
                  className="text-sm"
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroFiltersPanel;
