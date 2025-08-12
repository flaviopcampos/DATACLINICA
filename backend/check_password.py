import sqlite3
from passlib.context import CryptContext

# Configuração do contexto de criptografia
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conectar ao banco de dados
conn = sqlite3.connect('dataclinica.db')
cursor = conn.cursor()

# Buscar o usuário admin
cursor.execute("SELECT email, hashed_password FROM users WHERE email = ?", ('admin@dataclinica.com',))
user = cursor.fetchone()

if user:
    email, hashed_password = user
    print(f"Usuário encontrado: {email}")
    print(f"Hash da senha: {hashed_password[:50]}...")
    
    # Testar algumas senhas possíveis
    possible_passwords = ['Admin123!', 'admin123', 'Admin123', 'admin', 'password', '123456']
    
    for password in possible_passwords:
        if pwd_context.verify(password, hashed_password):
            print(f"✓ Senha correta encontrada: {password}")
            break
    else:
        print("✗ Nenhuma das senhas testadas funcionou")
        print("Vou criar um novo hash para 'Admin123!'")
        new_hash = pwd_context.hash('Admin123!')
        print(f"Novo hash: {new_hash}")
        
        # Atualizar a senha no banco
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = ?", (new_hash, 'admin@dataclinica.com'))
        conn.commit()
        print("Senha atualizada no banco de dados!")
else:
    print("Usuário admin não encontrado")

conn.close()