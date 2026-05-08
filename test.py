from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen2.5:7b",
    temperature=0.1
)

response = llm.invoke("Кто контрит Pudge?")
print(response.content)