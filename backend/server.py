from fastapi import FastAPI
from pydantic import BaseModel
from langchain.messages import AIMessage, ToolMessage
from backend.logic import print_response, router_agent




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

    response_text = print_response(response)
    # Возвращаем в формате, который ждёт React
    return {"response": response}




