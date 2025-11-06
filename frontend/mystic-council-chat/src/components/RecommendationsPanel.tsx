import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Shield } from "lucide-react";
import { useRandomHeroes } from "@/hooks/useRandomHeroes";
import { useRandomItems } from "@/hooks/useRandomItems";

interface Recommendation {
  id: string;
  name: string;
  img: string;
  category: string;
  description: string;
}

interface RecommendationsPanelProps {
  onItemClick: (query: string) => void;
}

const RecommendationsPanel = ({ onItemClick }: RecommendationsPanelProps) => {
  const heroes = useRandomHeroes(3); // 3 случайных героя
  const items = useRandomItems(3);   // 3 случайных предмета

  const handleHeroClick = (heroName: string) => {
    onItemClick(`Расскажи мне о герое ${heroName}`);
  };

  const handleItemClick = (itemName: string) => {
    onItemClick(`Расскажи мне о предмете ${itemName}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Hero Picks */}
      <Card className="ornate-border bg-card/80 backdrop-blur-sm flex-1 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-xl flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" /> Hero Picks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 pb-4 space-y-3">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="flex items-start gap-3 p-3 rounded-lg ornate-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer glow-hover"
                  onClick={() => handleHeroClick(hero.localized_name)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={hero.img}
                      alt={hero.localized_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-cinzel font-semibold text-primary text-sm">
                      {hero.localized_name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hero.roles.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Item Builds */}
      <Card className="ornate-border bg-card/80 backdrop-blur-sm flex-1 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-dota-gold" /> Item Builds
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 pb-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg ornate-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer glow-hover"
                  onClick={() => handleItemClick(item.name)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
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
