import { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
  img: string;
  category: string;
  description: string;
}

export const useRandomItems = (count: number = 3) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("https://api.opendota.com/api/constants/items");
        const data = await res.json();


        // Преобразуем в массив и уберем "не предметы" (например, "recipe")
        const allItems: Item[] = Object.keys(data)
          .filter((key) => data[key].img) // оставляем только с изображением
          .map((key) => ({
            id: key,
            name: data[key].dname || key,
            img: `https://cdn.cloudflare.steamstatic.com${data[key].img}`,
            category: data[key].qual || "Unknown",
            description: data[key].desc || "",
          }));

        // Берем случайные count предметов
        const shuffled = allItems.sort(() => 0.5 - Math.random());
        setItems(shuffled.slice(0, count));
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };

    fetchItems();
  }, [count]);

  return items;
};
