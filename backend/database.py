from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/geoaml")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class MerchantValidation(Base):
    __tablename__ = "merchant_validations"

    id = Column(Integer, primary_key=True, index=True)
    merchant_name = Column(String, nullable=False)
    address = Column(String)
    place_id = Column(String)
    phone = Column(String)
    transaction_amount = Column(Float)
    transaction_type = Column(String)
    
    # Google Places API response
    google_places_data = Column(JSONB)
    
    # Risk assessment results
    risk_score = Column(Float)
    risk_level = Column(String)
    risk_factors = Column(JSONB)
    recommendations = Column(JSONB)
    
    # Validation results
    validation_status = Column(String)  # VALID, SUSPICIOUS, INVALID, ERROR
    search_query = Column(String)
    
    # Metadata
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class MerchantInfo(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    phone = Column(String)
    website = Column(String)
    rating = Column(Float)
    user_ratings_total = Column(Integer)
    business_status = Column(String)
    types = Column(JSONB)
    
    # Location data (for PostGIS integration)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Additional Google Places data
    price_level = Column(Integer)
    opening_hours = Column(JSONB)
    photos = Column(JSONB)
    
    # Metadata
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    last_validated = Column(DateTime)

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")
