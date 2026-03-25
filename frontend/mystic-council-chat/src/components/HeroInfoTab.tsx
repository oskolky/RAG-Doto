import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords } from "lucide-react";
import { Link } from "react-router-dom";

interface Hero {
  id: number;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
}

const attrToLabel: Record<string, string> = {
  all: "Universal",
  str: "Strength",
  agi: "Agility",
  int: "Intelligence",
};

const attrBadgeClass: Record<string, string> = {
  str: "bg-red-500/15 text-red-300 border border-red-400/40",
  agi: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40",
  int: "bg-sky-500/15 text-sky-300 border border-sky-400/40",
  all: "bg-violet-500/15 text-violet-300 border border-violet-400/40",
};

const tabOrder = ["all", "str", "agi", "int"] as const;

interface HeroInfoTabProps {
  searchQuery: string;
  selectedRoles: string[];
}

const renderHeroCard = (hero: Hero) => (
  <Link
    key={hero.id}
    to={`/heroes/${hero.id}`}
    className="flex items-start gap-3 p-3.5 rounded-lg border border-white/10 bg-secondary/20 hover:bg-secondary/35 hover:border-primary/40 transition-colors"
  >
    <img
      src={hero.img}
      alt={hero.localized_name}
      className="w-14 h-14 rounded-md object-cover shrink-0"
    />
    <div className="min-w-0">
      <p className="font-cinzel font-semibold text-lg text-primary leading-tight">
        {hero.localized_name}
      </p>
      <div className="flex gap-1.5 mt-1.5">
        <Badge
          variant="secondary"
          className={`text-sm ${attrBadgeClass[hero.primary_attr] ?? attrBadgeClass.all}`}
        >
          {(attrToLabel[hero.primary_attr] ?? hero.primary_attr).toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {hero.attack_type}
        </Badge>
      </div>
      <p className="text-base text-muted-foreground mt-1.5 line-clamp-2">
        {hero.roles.join(", ")}
      </p>
    </div>
  </Link>
);

const HeroInfoTab = ({ searchQuery, selectedRoles }: HeroInfoTabProps) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const response = await fetch("https://api.opendota.com/api/constants/heroes");
        const data = await response.json();
        const allHeroes: Hero[] = Object.values(data).map((hero: any) => ({
          id: hero.id,
          localized_name: hero.localized_name,
          primary_attr: hero.primary_attr,
          attack_type: hero.attack_type,
          roles: hero.roles,
          img: `https://cdn.cloudflare.steamstatic.com${hero.img}`,
        }));
        setHeroes(allHeroes);
      } catch (error) {
        console.error("Failed to load heroes:", error);
      }
    };

    fetchHeroes();
  }, []);

  const sortedHeroes = useMemo(
    () =>
      [...heroes].sort((a, b) =>
        a.localized_name.localeCompare(b.localized_name, "ru")
      ),
    [heroes]
  );

  const filteredHeroes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sortedHeroes.filter((hero) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        hero.localized_name.toLowerCase().includes(normalizedQuery);

      const matchesRoles =
        selectedRoles.length === 0 ||
        selectedRoles.every((role) => hero.roles.includes(role));

      return matchesQuery && matchesRoles;
    });
  }, [sortedHeroes, searchQuery, selectedRoles]);

  const heroesByAttr = useMemo(() => {
    return tabOrder.reduce<Record<string, Hero[]>>((acc, attr) => {
      acc[attr] =
        attr === "all"
          ? filteredHeroes
          : filteredHeroes.filter((hero) => hero.primary_attr === attr);
      return acc;
    }, {});
  }, [filteredHeroes]);

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-cinzel text-2xl flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Все герои
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-base">Все</TabsTrigger>
              <TabsTrigger value="str" className="text-base">Strength</TabsTrigger>
              <TabsTrigger value="agi" className="text-base">Agility</TabsTrigger>
              <TabsTrigger value="int" className="text-base">Intelligence</TabsTrigger>
              <TabsTrigger value="all-universal" className="text-base">Universal</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroesByAttr.all?.map(renderHeroCard)}
              </div>
            </TabsContent>
            <TabsContent value="str">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroesByAttr.str?.map(renderHeroCard)}
              </div>
            </TabsContent>
            <TabsContent value="agi">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroesByAttr.agi?.map(renderHeroCard)}
              </div>
            </TabsContent>
            <TabsContent value="int">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroesByAttr.int?.map(renderHeroCard)}
              </div>
            </TabsContent>
            <TabsContent value="all-universal">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroesByAttr.all
                  ?.filter((hero) => hero.primary_attr === "all")
                  .map(renderHeroCard)}
              </div>
            </TabsContent>
          </Tabs>

          {filteredHeroes.length === 0 && (
            <p className="text-base text-muted-foreground mt-4">
              Ничего не найдено. Попробуй изменить поиск или роли.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroInfoTab;
