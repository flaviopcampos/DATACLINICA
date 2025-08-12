import sqlite3

def check_user_table():
    conn = sqlite3.connect('dataclinica.db')
    cursor = conn.cursor()
    
    print("Estrutura da tabela users:")
    cursor.execute('PRAGMA table_info(users)')
    columns = cursor.fetchall()
    
    for col in columns:
        print(f"  {col[1]} ({col[2]}) - PK: {col[5]}, NOT NULL: {col[3]}")
    
    print("\nUsuários existentes:")
    cursor.execute('SELECT id, email, full_name FROM users LIMIT 5')
    users = cursor.fetchall()
    
    for user in users:
        print(f"  ID: {user[0]}, Email: {user[1]}, Nome: {user[2]}")
    
    conn.close()

if __name__ == "__main__":
    check_user_table()