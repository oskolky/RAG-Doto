import { useEffect, useState } from "react";
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

interface AbilityRecord {
  dname?: string;
  img?: string;
}

interface QuizRound {
  imageUrl: string;
  correctAnswer: string;
  options: string[];
}

const fallbackAbilityImage = "/fallback-ability.png";

const HeroFiltersPanel = ({
  searchQuery,
  selectedRoles,
  onSearchChange,
  onToggleRole,
  onClearRoles,
}: HeroFiltersPanelProps) => {
  const [abilityPool, setAbilityPool] = useState<{ dname: string; img: string }[]>([]);
  const [quizRound, setQuizRound] = useState<QuizRound | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const response = await fetch("https://api.opendota.com/api/constants/abilities");
        const data = await response.json();
        const normalized = Object.values(data as Record<string, AbilityRecord>)
          .filter((ability) => Boolean(ability?.dname && ability?.img))
          .map((ability) => ({
            dname: ability.dname as string,
            img: `https://cdn.cloudflare.steamstatic.com${ability.img as string}`,
          }));
        setAbilityPool(normalized);
      } catch (error) {
        console.error("Failed to load abilities for quiz:", error);
        setAbilityPool([]);
      }
    };

    fetchAbilities();
  }, []);

  const generateQuizRound = (pool: { dname: string; img: string }[]) => {
    if (pool.length < 4) {
      setQuizRound(null);
      return;
    }

    const correctIndex = Math.floor(Math.random() * pool.length);
    const correct = pool[correctIndex];
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const distractors = shuffledPool
      .filter((item) => item.dname !== correct.dname)
      .slice(0, 3)
      .map((item) => item.dname);

    const options = [correct.dname, ...distractors].sort(() => Math.random() - 0.5);

    setSelectedAnswer(null);
    setQuizRound({
      imageUrl: correct.img,
      correctAnswer: correct.dname,
      options,
    });
  };

  useEffect(() => {
    if (abilityPool.length >= 4 && !quizRound) {
      generateQuizRound(abilityPool);
    }
  }, [abilityPool, quizRound]);

  const isCorrect = selectedAnswer === quizRound?.correctAnswer;

  return (
    <div className="h-full p-4">
      <Card className="border border-white/10 bg-card/75 backdrop-blur-sm shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="font-cinzel text-2xl">Фильтры героев</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto">
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

          <div className="pt-4 border-t border-white/10 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-foreground/90">
              Мини-игра: угадай способность
            </p>

            {!quizRound && (
              <p className="text-sm text-muted-foreground">Загружаю способности для викторины...</p>
            )}

            {quizRound && (
              <div className="space-y-3">
                <img
                  src={quizRound.imageUrl}
                  alt="Ability quiz"
                  className="w-full max-w-[220px] aspect-square mx-auto object-cover rounded-md border border-white/10"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackAbilityImage;
                  }}
                />

                <div className="grid grid-cols-1 gap-2">
                  {quizRound.options.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className="justify-start text-sm h-auto py-2"
                      onClick={() => setSelectedAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {selectedAnswer && (
                  <p className={`text-sm ${isCorrect ? "text-emerald-300" : "text-red-300"}`}>
                    {isCorrect
                      ? "Верно!"
                      : `Неверно. Правильный ответ: ${quizRound.correctAnswer}`}
                  </p>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => generateQuizRound(abilityPool)}
                >
                  Следующая способность
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroFiltersPanel;
