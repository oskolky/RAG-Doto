import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import backgroundImage from "@/assets/dota-map-background.jpg";

interface HeroDetailsData {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  base_health?: number;
  base_mana?: number;
  base_armor?: number;
  move_speed?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;
}

interface AbilityDetails {
  dname?: string;
  desc?: string;
  img?: string;
  behavior?: string | string[];
}

interface HeroAbilityCard {
  id: string;
  name: string;
  description: string;
  img: string;
  isPassive: boolean;
}

const attrLabels: Record<string, string> = {
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

const fallbackAbilityImage = "/fallback-ability.png";

const HeroDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hero, setHero] = useState<HeroDetailsData | null>(null);
  const [abilities, setAbilities] = useState<HeroAbilityCard[]>([]);
  const [heroQuestion, setHeroQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [isAskingAssistant, setIsAskingAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const heroId = Number(id);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        setIsLoading(true);
        setAbilities([]);

        const heroesResponse = await fetch("https://api.opendota.com/api/constants/heroes");
        const heroesData = await heroesResponse.json();
        const foundHero = (Object.values(heroesData) as any[]).find(
          (item) => item.id === heroId
        );

        if (!foundHero) {
          setHero(null);
          return;
        }

        setHero({
          id: foundHero.id,
          name: foundHero.name,
          localized_name: foundHero.localized_name,
          primary_attr: foundHero.primary_attr,
          attack_type: foundHero.attack_type,
          roles: foundHero.roles,
          img: `https://cdn.cloudflare.steamstatic.com${foundHero.img}`,
          base_health: foundHero.base_health,
          base_mana: foundHero.base_mana,
          base_armor: foundHero.base_armor,
          move_speed: foundHero.move_speed,
          base_attack_min: foundHero.base_attack_min,
          base_attack_max: foundHero.base_attack_max,
          str_gain: foundHero.str_gain,
          agi_gain: foundHero.agi_gain,
          int_gain: foundHero.int_gain,
        });

        const [heroAbilitiesResponse, abilitiesResponse] = await Promise.all([
          fetch("https://api.opendota.com/api/constants/hero_abilities"),
          fetch("https://api.opendota.com/api/constants/abilities"),
        ]);

        const heroAbilitiesData = await heroAbilitiesResponse.json();
        const abilitiesData = await abilitiesResponse.json();

        const heroAbilityIds: string[] =
          heroAbilitiesData?.[foundHero.name]?.abilities?.filter(
            (abilityId: string) => abilityId !== "generic_hidden"
          ) ?? [];

        const heroAbilityCards: HeroAbilityCard[] = heroAbilityIds
          .map((abilityId) => {
            const details: AbilityDetails | undefined = abilitiesData?.[abilityId];
            if (!details) return null;

            const abilityName = details.dname ?? abilityId;
            const description = details.desc ?? "Описание отсутствует.";
            const abilityImg = details.img
              ? `https://cdn.cloudflare.steamstatic.com${details.img}`
              : fallbackAbilityImage;
            const behaviorText = Array.isArray(details.behavior)
              ? details.behavior.join(" ")
              : details.behavior ?? "";
            const isPassive = behaviorText.toLowerCase().includes("passive");

            return {
              id: abilityId,
              name: abilityName,
              description,
              img: abilityImg,
              isPassive,
            };
          })
          .filter((ability): ability is HeroAbilityCard => ability !== null);

        setAbilities(heroAbilityCards);
      } catch (error) {
        console.error("Failed to load hero details:", error);
        setHero(null);
        setAbilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!Number.isNaN(heroId)) {
      fetchHero();
    } else {
      setIsLoading(false);
      setHero(null);
    }
  }, [heroId]);

  const handleAskAssistant = async () => {
    if (!hero || !heroQuestion.trim()) return;

    try {
      setIsAskingAssistant(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Ты помощник по Dota 2. Ответь максимально кратко, 2-4 коротких предложения, без markdown, без списков, без эмодзи. Герой: ${hero.localized_name}. Вопрос пользователя: ${heroQuestion.trim()}`,
          thread_id: hero.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setAssistantAnswer(String(data?.response ?? "Ассистент не вернул ответ."));
    } catch (error) {
      console.error("Failed to get hero assistant answer:", error);
      setAssistantAnswer("Не удалось получить ответ ассистента. Попробуй еще раз.");
    } finally {
      setIsAskingAssistant(false);
    }
  };

  const attrName = useMemo(() => {
    if (!hero) return "";
    return attrLabels[hero.primary_attr] ?? hero.primary_attr;
  }, [hero]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      <div className="relative z-10 px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/", { state: { activeTab: "heroes" } })}
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>

          {isLoading && (
            <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Загружаю данные героя...
              </CardContent>
            </Card>
          )}

          {!isLoading && !hero && (
            <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Герой не найден.
              </CardContent>
            </Card>
          )}

          {!isLoading && hero && (
            <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="font-cinzel text-3xl flex items-center gap-2">
                  <Swords className="h-6 w-6 text-primary" />
                  {hero.localized_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={hero.img}
                    alt={hero.localized_name}
                    className="w-28 h-28 rounded-lg object-cover shrink-0"
                  />
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-sm ${attrBadgeClass[hero.primary_attr] ?? attrBadgeClass.all}`}
                      >
                        {attrName}
                      </Badge>
                      <Badge variant="outline" className="text-sm">{hero.attack_type}</Badge>
                    </div>
                    <p className="text-base text-muted-foreground">
                      Роли: {hero.roles.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-base">
                  <div className="p-3 rounded-lg bg-secondary/30">HP: {hero.base_health ?? "-"}</div>
                  <div className="p-3 rounded-lg bg-secondary/30">Mana: {hero.base_mana ?? "-"}</div>
                  <div className="p-3 rounded-lg bg-secondary/30">Armor: {hero.base_armor ?? "-"}</div>
                  <div className="p-3 rounded-lg bg-secondary/30">Move Speed: {hero.move_speed ?? "-"}</div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    Attack: {hero.base_attack_min ?? "-"} - {hero.base_attack_max ?? "-"}
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    STR/AGI/INT gain: {hero.str_gain ?? "-"} / {hero.agi_gain ?? "-"} /{" "}
                    {hero.int_gain ?? "-"}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-cinzel text-2xl text-primary">Вопрос ассистенту по герою</h3>
                  <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                    <Textarea
                      value={heroQuestion}
                      onChange={(event) => setHeroQuestion(event.target.value)}
                      placeholder={`Например: как лучше играть на ${hero.localized_name} в начале игры?`}
                      className="min-h-[90px] text-base bg-background/60"
                    />
                    <Button
                      onClick={handleAskAssistant}
                      disabled={isAskingAssistant || !heroQuestion.trim()}
                    >
                      {isAskingAssistant ? "Отправляю..." : "Спросить ассистента"}
                    </Button>
                    {assistantAnswer && (
                      <div className="p-3 rounded-md bg-background/50 border border-white/10">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                          {assistantAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-cinzel text-3xl text-primary">Способности</h3>
                  {abilities.length === 0 ? (
                    <p className="text-base text-muted-foreground">
                      Для этого героя не найдено способностей.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {abilities.map((ability) => (
                        <div
                          key={ability.id}
                          className="p-4 rounded-lg bg-secondary/30 flex items-start gap-4"
                        >
                          {ability.img ? (
                            <img
                              src={ability.img}
                              alt={ability.name}
                              className="w-14 h-14 rounded-md object-cover shrink-0"
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = fallbackAbilityImage;
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-md bg-muted shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-lg font-semibold">
                              {ability.name}
                              {ability.isPassive ? " (passive)" : ""}
                            </p>
                            <p className="text-base text-muted-foreground mt-1.5 leading-relaxed">
                              {ability.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroDetails;
