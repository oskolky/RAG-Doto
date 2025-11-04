from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langchain.tools import tool
from langchain.messages import AIMessage, ToolMessage, RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langchain.agents import create_agent, AgentState
from langgraph.checkpoint.postgres import PostgresSaver
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime
from typing import Any
import requests
import os



# ===== BEFORE MODEL =====
def load_heroes():
    url = "https://api.opendota.com/api/heroes"
    heroes = requests.get(url).json()
    hero_map = {h["localized_name"].lower(): h["id"] for h in heroes}
    return hero_map

HEROES = load_heroes()
HEROES_REVERSE = {v: k for k, v in HEROES.items()}


@before_model
def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """Keep only the last few messages to fit context window."""
    messages = state["messages"]

    if len(messages) <= 3:
        return None

    first_msg = messages[0]
    recent_messages = messages[-3:] if len(messages) % 2 == 0 else messages[-4:]
    new_messages = [first_msg] + recent_messages

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            *new_messages
        ]
    }

# ===== TOOLS =====
@tool
def get_hero_name_by_id(hero_id: int) -> str:
    """Возвращает имя героя по его hero_id."""
    return HEROES_REVERSE.get(hero_id)

@tool
def get_hero_id_by_name(hero_name: str) -> int:
    """Возвращает hero_id по имени героя."""
    return HEROES.get(hero_name.lower())


@tool
def get_hero_stats(hero_id: int) -> str:
    """Возвращает базовую статистику героя из OpenDota API."""
    try:
        url = f"https://api.opendota.com/api/heroes/{hero_id}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return f"Герой: {data.get('localized_name')}\nТип атаки: {data.get('attack_type')}\nРоли: {', '.join(data.get('roles', []))}"
        return f"Ошибка при запросе героя {hero_id}: {response.status_code}"
    except Exception as e:
        return f"Ошибка: {e}"

@tool
def get_hero_matchups(hero_id: int) -> str:
    """Возвращает топ-5 контрпиков и топ-5 героев, которых контрит выбранный герой."""
    try:
        url = f"https://api.opendota.com/api/heroes/{hero_id}/matchups"
        response = requests.get(url)
        if response.status_code != 200:
            return f"Ошибка при получении матчапов: {response.status_code}"

        matchups = response.json()
        heroes = requests.get("https://api.opendota.com/api/heroStats").json()
        hero_map = {h["id"]: h["localized_name"] for h in heroes}

        for m in matchups:
            m["winrate"] = m["wins"] / max(1, m["games_played"])

        worst = sorted(matchups, key=lambda x: x["winrate"])[:5]
        best = sorted(matchups, key=lambda x: x["winrate"], reverse=True)[:5]

        result = f"Матчапы для героя {hero_id}:\n\n❌ Топ-5 контрпиков:\n"
        for m in worst:
            result += f"- {hero_map.get(m['hero_id'], '—')}: {round(m['winrate']*100,2)}%\n"
        result += "\n✅ Топ-5 героев, которых контрит герой:\n"
        for m in best:
            result += f"- {hero_map.get(m['hero_id'], '—')}: {round(m['winrate']*100,2)}%\n"
        return result
    except Exception as e:
        return f"Ошибка: {e}"

@tool
def get_hero_benchmarks(hero_id: int) -> str:
    """Возвращает медианные показатели (benchmarks) выбранного героя."""
    try:
        url = f"https://api.opendota.com/api/benchmarks?hero_id={hero_id}"
        response = requests.get(url)
        if response.status_code != 200:
            return f"Ошибка при запросе: {response.status_code}"
        data = response.json().get("result", {})
        result = f"Медианные бенчмарки для героя {hero_id}:\n"
        for metric, values in data.items():
            median = next((v["value"] for v in values if abs(v["percentile"]-0.5)<1e-9), None)
            if median is not None:
                result += f"- {metric}: {median}\n"
        return result
    except Exception as e:
        return f"Ошибка: {e}"

@tool
def get_recent_matches(account_id: str, limit: int = 5) -> str:
    """Возвращает последние N матчей игрока с краткой статистикой (K/D/A и результат)."""
    try:
        url = f"https://api.opendota.com/api/players/{account_id}/matches"
        response = requests.get(url, params={"limit": limit})
        if response.status_code != 200:
            return f"Ошибка OpenDota API: {response.status_code}"

        matches = response.json()
        if not matches:
            return f"Для игрока {account_id} нет матчей."

        lines = []
        for m in matches:
            hero_id = m.get("hero_id")
            kills = m.get("kills", 0)
            deaths = m.get("deaths", 0)
            assists = m.get("assists", 0)
            radiant_win = m.get("radiant_win")
            is_radiant = m.get("player_slot", 0) < 128
            win = (radiant_win and is_radiant) or (not radiant_win and not is_radiant)
            lines.append(
                f"Матч {m.get('match_id')}: Герой {get_hero_name_by_id(hero_id)}, K/D/A {kills}/{deaths}/{assists}, {'Победа' if win else 'Поражение'}"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Ошибка: {e}"

# ===== API KEY =====
os.environ["OPENAI_API_KEY"] = "sk-2d927361ddd446859c94aa9f9442bd95"
os.environ["OPENAI_API_BASE"] = "https://api.deepseek.com/v1"

# ===== AGENTS =====
hero_agent = create_agent(
    model=ChatOpenAI(model="deepseek-chat", temperature=0.1),
    tools=[get_hero_stats, get_hero_benchmarks, get_hero_id_by_name],
    system_prompt="Ты умный помощник, который помогает с анализом данных героев Dota 2"
)

hero_matchups_agent = create_agent(
    model=ChatOpenAI(model="deepseek-chat", temperature=0.1),
    tools=[get_hero_matchups, get_hero_id_by_name],
    system_prompt="Ты умный помощник по матчапам Dota 2"
)

player_agent = create_agent(
    model=ChatOpenAI(model="deepseek-chat", temperature=0.1),
    tools=[get_recent_matches],
    system_prompt="Ты специалист по игрокам Dota 2"
)

# ===== AGENT TOOLS =====
@tool
def hero_agent_tool(query: str):
    """Вызов агента для анализа героя."""
    return hero_agent.invoke({"messages":[{"role":"user","content":query}]})["messages"][-1].content

@tool
def hero_matchup_tool(query: str):
    """Вызов агента для  матчапов героя."""
    return hero_matchups_agent.invoke({"messages":[{"role":"user","content":query}]})["messages"][-1].content

@tool
def player_agent_tool(query: str):
    """Вызов агента для  матчей игрока."""
    return player_agent.invoke({"messages":[{"role":"user","content":query}]})["messages"][-1].content

def print_response(resp):
    texts = []
    for msg in resp["messages"]:
        if isinstance(msg, (AIMessage, ToolMessage)):
            texts.append(msg.content)
    if texts:
        print(texts[-1])

# ===== ROUTER AGENT =====

router_agent = create_agent(
    model=ChatOpenAI(model="deepseek-chat", temperature=0.1),
    tools=[hero_agent_tool, hero_matchup_tool, player_agent_tool],
    system_prompt=(
        "Ты управляющий агент."
        "Если запрос про героя — hero_agent_tool, "
        "если про матчапы — hero_matchup_tool, "
        "если про игрока — player_agent_tool."
    )

)



# ===== TEST =====
if __name__ == "__main__":
    response = router_agent.invoke(
        {"messages": [{"role": "user", "content": "Отправь мне привет"}]},
        {"configurable": {"thread_id": "1"}},
    )

    print_response(response)
