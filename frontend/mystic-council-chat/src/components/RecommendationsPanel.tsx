import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Shield, Swords } from "lucide-react";
import heroPlaceholder from "@/assets/hero-placeholder.jpg";

interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
}

const mockHeroes: Recommendation[] = [
  { id: "1", name: "Anti-Mage", category: "Carry", description: "Mobile carry with strong late game" },
  { id: "2", name: "Crystal Maiden", category: "Support", description: "Intelligence support with crowd control" },
  { id: "3", name: "Axe", category: "Tank", description: "Durable initiator with taunt ability" },
];

const mockItems: Recommendation[] = [
  { id: "1", name: "Black King Bar", category: "Core", description: "Spell immunity for carries" },
  { id: "2", name: "Blink Dagger", category: "Mobility", description: "Instant positioning tool" },
  { id: "3", name: "Aghanim's Scepter", category: "Upgrade", description: "Ultimate ability enhancement" },
];

const RecommendationsPanel = () => {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Hero Recommendations */}
      <Card className="ornate-border bg-card/80 backdrop-blur-sm flex-1 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-xl flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Hero Picks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 pb-4 space-y-3">
              {mockHeroes.map((hero) => (
                <div
                  key={hero.id}
                  className="flex items-start gap-3 p-3 rounded-lg ornate-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer glow-hover"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 glow-emerald">
                    <img
                      src={heroPlaceholder}
                      alt={hero.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-cinzel font-semibold text-primary text-sm">
                      {hero.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hero.category}
                    </p>
                    <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
                      {hero.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Item Recommendations */}
      <Card className="ornate-border bg-card/80 backdrop-blur-sm flex-1 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-dota-gold" />
            Item Builds
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 pb-4 space-y-3">
              {mockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg ornate-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer glow-hover"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 glow-gold">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-cinzel font-semibold text-primary text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.category}
                    </p>
                    <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsPanel;