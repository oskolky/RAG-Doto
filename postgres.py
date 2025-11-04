import psycopg

DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

try:
    conn = psycopg.connect(DB_URI)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(cur.fetchone())
    conn.close()
except Exception as e:
    print("Ошибка соединения:", e)
