import { useEffect, useState } from "react";

interface Hero {
  id: number;
  name: string;          // внутреннее имя
  localized_name: string; // отображаемое имя
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;           // рабочая ссылка на картинку
}

export const useRandomHeroes = (count: number = 3) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const res = await fetch("https://api.opendota.com/api/constants/heroes");
        const data = await res.json();

        // Преобразуем объект в массив
        const heroesArray = Object.values(data);

        // Перемешиваем массив и выбираем N героев
        const shuffled = heroesArray.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        // Добавляем рабочие ссылки на картинки
        const heroesWithImg = selected.map((h: any) => ({
          id: h.id,
          name: h.name,
          localized_name: h.localized_name,
          primary_attr: h.primary_attr,
          attack_type: h.attack_type,
          roles: h.roles,
          img: `https://cdn.cloudflare.steamstatic.com${h.img}`,
        }));

        setHeroes(heroesWithImg);
      } catch (err) {
        console.error("Ошибка загрузки героев:", err);
      }
    };

    fetchHeroes();
  }, [count]);

  return heroes;
};
