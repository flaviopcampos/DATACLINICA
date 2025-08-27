from database import get_db
from models import User
from auth import verify_password

def check_admin():
    db = next(get_db())
    user = db.query(User).filter(User.email == 'admin@dataclinica.com.br').first()
    
    if user:
        print(f'Usuário encontrado: {user.email}')
        print(f'Ativo: {user.is_active}')
        print(f'Hash da senha: {user.hashed_password[:50]}...')
        
        # Testar algumas senhas comuns
        test_passwords = ['admin123', 'admin', '123456', 'dataclinica']
        for pwd in test_passwords:
            if verify_password(pwd, user.hashed_password):
                print(f'✅ Senha correta: {pwd}')
                return
        print('❌ Nenhuma das senhas testadas funcionou')
    else:
        print('Usuário não encontrado')

if __name__ == '__main__':
    check_admin()