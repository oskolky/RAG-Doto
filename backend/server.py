from fastapi import FastAPI
from pydantic import BaseModel
from typing_extensions import deprecated

from backend.logic import hero_agent_tool, hero_matchup_tool, player_agent_tool, trim_messages, print_response, router_agent
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langgraph.checkpoint.postgres import PostgresSaver


# === Pydantic модель ===
class Query(BaseModel):
    text: str
    thread_id: int = 1


app = FastAPI()

@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/chat")
def chat(query: Query):
    response = router_agent.invoke(
        {"messages": [{"role": "user", "content": query.text}]},
        {"configurable": {"thread_id": query.thread_id}}
    )
    return {"reply": response}




