from fastapi import FastAPI
from pydantic import BaseModel
from typing_extensions import deprecated
from langchain.messages import AIMessage, ToolMessage
from backend.logic import hero_agent_tool, hero_matchup_tool, player_agent_tool, trim_messages, print_response, router_agent
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent



# === Pydantic модель ===
class Query(BaseModel):
    text: str
    thread_id: int = 1


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # или ["http://localhost:8082"] для фронта
    allow_credentials=True,
    allow_methods=["*"],          # POST, GET, OPTIONS и т.д.
    allow_headers=["*"],          # любые заголовки
)

@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/chat")
def chat(query: Query):
    # Вызываем LLM через router_agent
    response = router_agent.invoke(
        {"messages": [{"role": "user", "content": query.text}]},
        {"configurable": {"thread_id": query.thread_id}}
    )

    # Извлекаем текст последнего ответа
    reply_text = ""
    for msg in response.get("messages", []):
        if isinstance(msg, (AIMessage, ToolMessage)):
            reply_text = msg.content

    # Возвращаем в формате, который ждёт React
    return {"response": reply_text}




