from database import get_db
from models import User
from auth import get_password_hash

def reset_admin_password():
    db = next(get_db())
    user = db.query(User).filter(User.email == 'admin@dataclinica.com.br').first()
    
    if user:
        # Resetar senha para 'admin123'
        new_password = 'admin123'
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        print(f'✅ Senha do usuário {user.email} resetada para: {new_password}')
    else:
        print('❌ Usuário admin não encontrado')
    
    db.close()

if __name__ == '__main__':
    reset_admin_password()