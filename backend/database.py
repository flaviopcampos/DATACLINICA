from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# PostgreSQL configuration - Render
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://clinica_saas_user:NGyqjoXV9moBEJhgKi5hkS6NQGKJonYu@dpg-d28hmlndiees7384q4ig-a.oregon-postgres.render.com/clinica_saas"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()