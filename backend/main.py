from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import googlemaps
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import difflib
import re
import pandas as pd
import csv
import io
import uuid
import json
from cnpj_service import cnpj_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Locus Merchant Audit - Merchant Validation API",
    description="Merchant validation platform for fraud and AML teams using Google Maps APIs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Maps client
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not GOOGLE_MAPS_API_KEY:
    logger.warning("GOOGLE_MAPS_API_KEY not found in environment variables")
    gmaps = None
else:
    gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

# In-memory storage for batch processing (in production, use a database)
batch_storage = {}

# Pydantic models
class MerchantValidationRequest(BaseModel):
    merchant_name: str
    address: Optional[str] = None
    place_id: Optional[str] = None
    phone: Optional[str] = None
    transaction_amount: Optional[float] = None
    transaction_type: Optional[str] = None

class MerchantInfo(BaseModel):
    place_id: str
    name: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    business_status: Optional[str] = None
    types: List[str] = []
    location: Dict[str, float]
    price_level: Optional[int] = None
    opening_hours: Optional[Dict[str, Any]] = None
    photos: List[str] = []

class AddressComparison(BaseModel):
    provided_address: str
    google_address: str
    similarity_score: float  # 0-100
    is_match: bool
    differences: List[str]

class CNPJData(BaseModel):
    cnpj: str
    company_name: str
    trade_name: Optional[str] = None
    legal_nature: Optional[str] = None
    main_activity: Optional[str] = None
    secondary_activities: List[str] = []
    registration_status: Optional[str] = None
    registration_date: Optional[str] = None
    address: Dict[str, str] = {}
    phone: Optional[str] = None
    email: Optional[str] = None
    share_capital: Optional[str] = None
    company_size: Optional[str] = None
    last_update: Optional[str] = None
    partners: List[Dict[str, Any]] = []

class CNPJComparison(BaseModel):
    cnpj_found: bool
    cnpj_data: Optional[CNPJData] = None
    name_comparison: Optional[Dict[str, Any]] = None
    address_comparison: Optional[Dict[str, Any]] = None
    risk_assessment: Optional[Dict[str, Any]] = None

class RiskAssessment(BaseModel):
    risk_score: float  # 0-100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_factors: List[str]
    recommendations: List[str]

class ValidationResult(BaseModel):
    merchant_info: Optional[MerchantInfo] = None
    risk_assessment: RiskAssessment
    address_comparison: Optional[AddressComparison] = None
    cnpj_comparison: Optional[CNPJComparison] = None
    validation_status: str  # VALID, SUSPICIOUS, INVALID, ERROR
    timestamp: datetime
    search_query: str

class BatchValidationRequest(BaseModel):
    merchants: List[MerchantValidationRequest]

class BatchValidationStatus(BaseModel):
    batch_id: str
    status: str  # PENDING, PROCESSING, COMPLETED, FAILED
    total_merchants: int
    processed_merchants: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    results: Optional[List[ValidationResult]] = None

@app.get("/")
async def root():
    return {
        "message": "Locus Merchant Audit - Merchant Validation API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "google_maps_api": "connected" if gmaps else "not_configured",
        "timestamp": datetime.now().isoformat()
    }

def normalize_address(address: str) -> str:
    """Normalize address for comparison"""
    if not address:
        return ""
    
    # Convert to lowercase
    normalized = address.lower()
    
    # Remove common abbreviations and standardize
    replacements = {
        r'\bst\b': 'street',
        r'\bave\b': 'avenue',
        r'\brd\b': 'road',
        r'\bdr\b': 'drive',
        r'\bblvd\b': 'boulevard',
        r'\bapt\b': 'apartment',
        r'\bste\b': 'suite',
        r'\bfl\b': 'floor',
        r'\bn\b': 'north',
        r'\bs\b': 'south',
        r'\be\b': 'east',
        r'\bw\b': 'west',
    }
    
    for pattern, replacement in replacements.items():
        normalized = re.sub(pattern, replacement, normalized)
    
    # Remove extra spaces and punctuation
    normalized = re.sub(r'[^\w\s]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    
    return normalized.strip()

def compare_addresses(provided_address: str, google_address: str) -> AddressComparison:
    """Compare provided address with Google Places address"""
    if not provided_address or not google_address:
        return AddressComparison(
            provided_address=provided_address or "",
            google_address=google_address or "",
            similarity_score=0.0,
            is_match=False,
            differences=["One or both addresses are missing"]
        )
    
    # Normalize addresses
    norm_provided = normalize_address(provided_address)
    norm_google = normalize_address(google_address)
    
    # Calculate similarity using difflib
    similarity = difflib.SequenceMatcher(None, norm_provided, norm_google).ratio() * 100
    
    # Find differences
    differences = []
    if similarity < 90:
        provided_words = set(norm_provided.split())
        google_words = set(norm_google.split())
        
        only_in_provided = provided_words - google_words
        only_in_google = google_words - provided_words
        
        if only_in_provided:
            differences.append(f"Only in provided: {', '.join(only_in_provided)}")
        if only_in_google:
            differences.append(f"Only in Google: {', '.join(only_in_google)}")
    
    return AddressComparison(
        provided_address=provided_address,
        google_address=google_address,
        similarity_score=similarity,
        is_match=similarity >= 80,  # 80% threshold for match
        differences=differences
    )

async def process_cnpj_data(merchant_name: str, merchant_address: Optional[str] = None) -> Optional[CNPJComparison]:
    """Process CNPJ data for Brazilian merchants"""
    try:
        # Try to extract CNPJ from merchant name or address
        cnpj = None
        search_text = f"{merchant_name} {merchant_address or ''}"
        
        cnpj = cnpj_service.extract_cnpj_from_text(search_text)
        
        if not cnpj:
            # If no CNPJ found in text, return None
            return CNPJComparison(
                cnpj_found=False,
                cnpj_data=None,
                name_comparison=None,
                address_comparison=None,
                risk_assessment=None
            )
        
        # Fetch CNPJ data
        cnpj_data = await cnpj_service.get_cnpj_data(cnpj)
        
        if not cnpj_data:
            return CNPJComparison(
                cnpj_found=True,
                cnpj_data=None,
                name_comparison=None,
                address_comparison=None,
                risk_assessment={'error': 'Could not fetch CNPJ data'}
            )
        
        # Compare business names
        name_comparison = cnpj_service.compare_business_names(merchant_name, cnpj_data)
        
        # Compare addresses if available
        address_comparison = None
        if merchant_address and cnpj_data.get('address', {}).get('full_address'):
            cnpj_address = cnpj_data['address']['full_address']
            address_comparison = compare_addresses(merchant_address, cnpj_address)
        
        # Assess CNPJ-specific risk factors
        cnpj_risk = cnpj_service.assess_cnpj_risk_factors(cnpj_data)
        
        return CNPJComparison(
            cnpj_found=True,
            cnpj_data=CNPJData(**cnpj_data),
            name_comparison=name_comparison,
            address_comparison=address_comparison.dict() if address_comparison else None,
            risk_assessment=cnpj_risk
        )
        
    except Exception as e:
        logger.error(f"Error processing CNPJ data: {str(e)}")
        return CNPJComparison(
            cnpj_found=False,
            cnpj_data=None,
            name_comparison=None,
            address_comparison=None,
            risk_assessment={'error': str(e)}
        )

def calculate_risk_score(merchant_info: Optional[MerchantInfo], transaction_amount: Optional[float] = None, address_comparison: Optional[AddressComparison] = None, cnpj_comparison: Optional[CNPJComparison] = None) -> RiskAssessment:
    """
    Calculate risk score based on merchant information and transaction details
    """
    risk_score = 0
    risk_factors = []
    recommendations = []
    
    if not merchant_info:
        return RiskAssessment(
            risk_score=100,
            risk_level="CRITICAL",
            risk_factors=["Merchant not found in Google Places"],
            recommendations=["Investigate merchant existence", "Verify transaction legitimacy"]
        )
    
    # Business status check
    if merchant_info.business_status == "CLOSED_PERMANENTLY":
        risk_score += 40
        risk_factors.append("Business permanently closed")
        recommendations.append("Verify if transaction is legitimate for closed business")
    elif merchant_info.business_status == "CLOSED_TEMPORARILY":
        risk_score += 20
        risk_factors.append("Business temporarily closed")
    
    # Rating and reviews check
    if merchant_info.user_ratings_total is not None:
        if merchant_info.user_ratings_total == 0:
            risk_score += 25
            risk_factors.append("No customer reviews")
            recommendations.append("Verify business legitimacy due to lack of reviews")
        elif merchant_info.user_ratings_total < 10:
            risk_score += 15
            risk_factors.append("Very few customer reviews")
    
    if merchant_info.rating is not None and merchant_info.rating < 3.0:
        risk_score += 15
        risk_factors.append("Low customer rating")
    
    # Business type analysis
    high_risk_types = ["atm", "bank", "casino", "night_club", "liquor_store"]
    medium_risk_types = ["gas_station", "convenience_store", "jewelry_store"]
    
    for business_type in merchant_info.types:
        if business_type in high_risk_types:
            risk_score += 10
            risk_factors.append(f"High-risk business type: {business_type}")
        elif business_type in medium_risk_types:
            risk_score += 5
            risk_factors.append(f"Medium-risk business type: {business_type}")
    
    # Transaction amount analysis
    if transaction_amount:
        if transaction_amount > 10000:  # High value transaction
            risk_score += 15
            risk_factors.append("High-value transaction")
            recommendations.append("Enhanced due diligence for high-value transaction")
        elif transaction_amount > 5000:
            risk_score += 10
            risk_factors.append("Medium-value transaction")
    
    # Missing information penalties
    if not merchant_info.phone:
        risk_score += 10
        risk_factors.append("No phone number available")
    
    if not merchant_info.website:
        risk_score += 5
        risk_factors.append("No website available")
    
    # Address comparison analysis
    if address_comparison:
        if not address_comparison.is_match:
            if address_comparison.similarity_score < 50:
                risk_score += 30
                risk_factors.append("Address mismatch - significant differences")
                recommendations.append("Verify correct merchant location")
            elif address_comparison.similarity_score < 80:
                risk_score += 15
                risk_factors.append("Address mismatch - minor differences")
                recommendations.append("Confirm address details with merchant")
    
    # CNPJ analysis for Brazilian merchants
    if cnpj_comparison and cnpj_comparison.cnpj_found:
        if not cnpj_comparison.cnpj_data:
            risk_score += 25
            risk_factors.append("CNPJ found but data unavailable")
            recommendations.append("Verify CNPJ status manually")
        else:
            # Add CNPJ-specific risk factors
            cnpj_risk = cnpj_comparison.risk_assessment
            if cnpj_risk and cnpj_risk.get('risk_score', 0) > 0:
                cnpj_risk_score = cnpj_risk['risk_score']
                risk_score += min(cnpj_risk_score, 40)  # Cap CNPJ risk at 40 points
                risk_factors.extend(cnpj_risk.get('risk_factors', []))
                recommendations.extend(cnpj_risk.get('recommendations', []))
            
            # Name comparison with CNPJ
            name_comp = cnpj_comparison.name_comparison
            if name_comp and name_comp.get('similarity_score', 0) < 0.6:
                risk_score += 20
                risk_factors.append("Merchant name doesn't match CNPJ registration")
                recommendations.append("Verify business name with official registration")
    
    # Determine risk level
    risk_score = min(risk_score, 100)  # Cap at 100
    
    if risk_score >= 80:
        risk_level = "CRITICAL"
        recommendations.append("Immediate investigation required")
    elif risk_score >= 60:
        risk_level = "HIGH"
        recommendations.append("Enhanced monitoring recommended")
    elif risk_score >= 30:
        risk_level = "MEDIUM"
        recommendations.append("Standard monitoring sufficient")
    else:
        risk_level = "LOW"
        recommendations.append("Low risk - standard processing")
    
    return RiskAssessment(
        risk_score=risk_score,
        risk_level=risk_level,
        risk_factors=risk_factors,
        recommendations=recommendations
    )

def search_merchant_by_name_and_address(name: str, address: Optional[str] = None) -> Optional[MerchantInfo]:
    """
    Search for merchant using name and optionally address
    """
    if not gmaps:
        return None
    
    try:
        # Construct search query
        query = name
        if address:
            query += f" {address}"
        
        # Search for places
        places_result = gmaps.places(query=query, type="establishment")
        
        if not places_result.get("results"):
            return None
        
        # Get the first result (most relevant)
        place = places_result["results"][0]
        place_id = place["place_id"]
        
        # Get detailed information
        details = gmaps.place(place_id=place_id, fields=[
            "place_id", "name", "formatted_address", "formatted_phone_number",
            "website", "rating", "user_ratings_total", "business_status",
            "types", "geometry", "price_level", "opening_hours", "photos"
        ])
        
        place_details = details["result"]
        
        # Extract photos URLs
        photos = []
        if "photos" in place_details:
            for photo in place_details["photos"][:3]:  # Limit to 3 photos
                photo_reference = photo["photo_reference"]
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"
                photos.append(photo_url)
        
        return MerchantInfo(
            place_id=place_details["place_id"],
            name=place_details.get("name", ""),
            address=place_details.get("formatted_address", ""),
            phone=place_details.get("formatted_phone_number"),
            website=place_details.get("website"),
            rating=place_details.get("rating"),
            user_ratings_total=place_details.get("user_ratings_total"),
            business_status=place_details.get("business_status"),
            types=place_details.get("types", []),
            location={
                "lat": place_details["geometry"]["location"]["lat"],
                "lng": place_details["geometry"]["location"]["lng"]
            },
            price_level=place_details.get("price_level"),
            opening_hours=place_details.get("opening_hours"),
            photos=photos
        )
        
    except Exception as e:
        logger.error(f"Error searching merchant: {str(e)}")
        return None

def get_merchant_by_place_id(place_id: str) -> Optional[MerchantInfo]:
    """
    Get merchant information by Google Place ID
    """
    if not gmaps:
        return None
    
    try:
        details = gmaps.place(place_id=place_id, fields=[
            "place_id", "name", "formatted_address", "formatted_phone_number",
            "website", "rating", "user_ratings_total", "business_status",
            "types", "geometry", "price_level", "opening_hours", "photos"
        ])
        
        place_details = details["result"]
        
        # Extract photos URLs
        photos = []
        if "photos" in place_details:
            for photo in place_details["photos"][:3]:  # Limit to 3 photos
                photo_reference = photo["photo_reference"]
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"
                photos.append(photo_url)
        
        return MerchantInfo(
            place_id=place_details["place_id"],
            name=place_details.get("name", ""),
            address=place_details.get("formatted_address", ""),
            phone=place_details.get("formatted_phone_number"),
            website=place_details.get("website"),
            rating=place_details.get("rating"),
            user_ratings_total=place_details.get("user_ratings_total"),
            business_status=place_details.get("business_status"),
            types=place_details.get("types", []),
            location={
                "lat": place_details["geometry"]["location"]["lat"],
                "lng": place_details["geometry"]["location"]["lng"]
            },
            price_level=place_details.get("price_level"),
            opening_hours=place_details.get("opening_hours"),
            photos=photos
        )
        
    except Exception as e:
        logger.error(f"Error getting merchant by place_id: {str(e)}")
        return None

@app.post("/validate-merchant", response_model=ValidationResult)
async def validate_merchant(request: MerchantValidationRequest):
    """
    Validate a merchant using Google Places API and assess risk
    """
    if not gmaps:
        raise HTTPException(status_code=500, detail="Google Maps API not configured")
    
    merchant_info = None
    search_query = ""
    
    try:
        # Try to get merchant by place_id first
        if request.place_id:
            merchant_info = get_merchant_by_place_id(request.place_id)
            search_query = f"place_id: {request.place_id}"
        
        # If no place_id or not found, search by name and address
        if not merchant_info and request.merchant_name:
            merchant_info = search_merchant_by_name_and_address(
                request.merchant_name, 
                request.address
            )
            search_query = f"name: {request.merchant_name}"
            if request.address:
                search_query += f", address: {request.address}"
        
        # Compare addresses if both are available
        address_comparison = None
        if merchant_info and request.address:
            address_comparison = compare_addresses(request.address, merchant_info.address)
        
        # Process CNPJ data for Brazilian merchants
        cnpj_comparison = None
        try:
            cnpj_comparison = await process_cnpj_data(request.merchant_name, request.address)
        except Exception as e:
            logger.warning(f"Error processing CNPJ data: {str(e)}")
        
        # Calculate risk assessment
        risk_assessment = calculate_risk_score(merchant_info, request.transaction_amount, address_comparison, cnpj_comparison)
        
        # Determine validation status
        if not merchant_info:
            validation_status = "INVALID"
        elif risk_assessment.risk_level in ["CRITICAL", "HIGH"]:
            validation_status = "SUSPICIOUS"
        else:
            validation_status = "VALID"
        
        return ValidationResult(
            merchant_info=merchant_info,
            risk_assessment=risk_assessment,
            address_comparison=address_comparison,
            cnpj_comparison=cnpj_comparison,
            validation_status=validation_status,
            timestamp=datetime.now(),
            search_query=search_query
        )
        
    except Exception as e:
        logger.error(f"Error validating merchant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@app.get("/search-merchants")
async def search_merchants(query: str, limit: int = 5):
    """
    Search for merchants by query string
    """
    if not gmaps:
        raise HTTPException(status_code=500, detail="Google Maps API not configured")
    
    try:
        places_result = gmaps.places(query=query, type="establishment")
        
        results = []
        for place in places_result.get("results", [])[:limit]:
            results.append({
                "place_id": place["place_id"],
                "name": place.get("name", ""),
                "address": place.get("formatted_address", ""),
                "rating": place.get("rating"),
                "types": place.get("types", []),
                "business_status": place.get("business_status")
            })
        
        return {"results": results, "query": query}
        
    except Exception as e:
        logger.error(f"Error searching merchants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.get("/cnpj/{cnpj}")
async def get_cnpj_info(cnpj: str):
    """
    Get CNPJ information from Brazilian Federal Revenue Service
    """
    try:
        cnpj_data = await cnpj_service.get_cnpj_data(cnpj)
        
        if not cnpj_data:
            raise HTTPException(status_code=404, detail="CNPJ not found or invalid")
        
        # Assess risk factors
        risk_assessment = cnpj_service.assess_cnpj_risk_factors(cnpj_data)
        
        return {
            "cnpj_data": CNPJData(**cnpj_data),
            "risk_assessment": risk_assessment,
            "timestamp": datetime.now()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching CNPJ {cnpj}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CNPJ lookup error: {str(e)}")

@app.post("/compare-cnpj")
async def compare_merchant_with_cnpj(merchant_name: str, cnpj: str, merchant_address: Optional[str] = None):
    """
    Compare merchant information with CNPJ data
    """
    try:
        cnpj_data = await cnpj_service.get_cnpj_data(cnpj)
        
        if not cnpj_data:
            raise HTTPException(status_code=404, detail="CNPJ not found or invalid")
        
        # Compare business names
        name_comparison = cnpj_service.compare_business_names(merchant_name, cnpj_data)
        
        # Compare addresses if available
        address_comparison = None
        if merchant_address and cnpj_data.get('address', {}).get('full_address'):
            cnpj_address = cnpj_data['address']['full_address']
            address_comparison = compare_addresses(merchant_address, cnpj_address)
        
        # Assess risk factors
        risk_assessment = cnpj_service.assess_cnpj_risk_factors(cnpj_data)
        
        return CNPJComparison(
            cnpj_found=True,
            cnpj_data=CNPJData(**cnpj_data),
            name_comparison=name_comparison,
            address_comparison=address_comparison.dict() if address_comparison else None,
            risk_assessment=risk_assessment
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing merchant with CNPJ {cnpj}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CNPJ comparison error: {str(e)}")

async def process_single_merchant(merchant_request: MerchantValidationRequest) -> ValidationResult:
    """Process a single merchant validation"""
    try:
        merchant_info = None
        search_query = ""
        
        # Try to get merchant by place_id first
        if merchant_request.place_id:
            merchant_info = get_merchant_by_place_id(merchant_request.place_id)
            search_query = f"place_id: {merchant_request.place_id}"
        
        # If no place_id or not found, search by name and address
        if not merchant_info and merchant_request.merchant_name:
            merchant_info = search_merchant_by_name_and_address(
                merchant_request.merchant_name, 
                merchant_request.address
            )
            search_query = f"name: {merchant_request.merchant_name}"
            if merchant_request.address:
                search_query += f", address: {merchant_request.address}"
        
        # Compare addresses if both are available
        address_comparison = None
        if merchant_info and merchant_request.address:
            address_comparison = compare_addresses(merchant_request.address, merchant_info.address)
        
        # Calculate risk assessment
        risk_assessment = calculate_risk_score(merchant_info, merchant_request.transaction_amount, address_comparison)
        
        # Determine validation status
        if not merchant_info:
            validation_status = "INVALID"
        elif risk_assessment.risk_level in ["CRITICAL", "HIGH"]:
            validation_status = "SUSPICIOUS"
        else:
            validation_status = "VALID"
        
        return ValidationResult(
            merchant_info=merchant_info,
            risk_assessment=risk_assessment,
            address_comparison=address_comparison,
            validation_status=validation_status,
            timestamp=datetime.now(),
            search_query=search_query
        )
        
    except Exception as e:
        logger.error(f"Error processing merchant: {str(e)}")
        # Return error result
        return ValidationResult(
            merchant_info=None,
            risk_assessment=RiskAssessment(
                risk_score=100,
                risk_level="CRITICAL",
                risk_factors=[f"Processing error: {str(e)}"],
                recommendations=["Manual review required"]
            ),
            address_comparison=None,
            validation_status="ERROR",
            timestamp=datetime.now(),
            search_query=f"name: {merchant_request.merchant_name}"
        )

def process_batch_validation(batch_id: str, merchants: List[MerchantValidationRequest]):
    """Background task to process batch validation"""
    try:
        batch_storage[batch_id]["status"] = "PROCESSING"
        results = []
        
        for i, merchant in enumerate(merchants):
            # Process single merchant (this would be async in a real implementation)
            import asyncio
            result = asyncio.run(process_single_merchant(merchant))
            results.append(result)
            
            # Update progress
            batch_storage[batch_id]["processed_merchants"] = i + 1
            
            # Small delay to prevent API rate limiting
            import time
            time.sleep(0.1)
        
        # Complete the batch
        batch_storage[batch_id]["status"] = "COMPLETED"
        batch_storage[batch_id]["completed_at"] = datetime.now()
        batch_storage[batch_id]["results"] = results
        
    except Exception as e:
        logger.error(f"Error processing batch {batch_id}: {str(e)}")
        batch_storage[batch_id]["status"] = "FAILED"

@app.post("/upload-csv", response_model=BatchValidationStatus)
async def upload_csv_for_validation(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload CSV file for batch merchant validation"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['merchant_name']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain columns: {', '.join(required_columns)}"
            )
        
        # Convert to merchant requests
        merchants = []
        for _, row in df.iterrows():
            merchant_request = MerchantValidationRequest(
                merchant_name=row['merchant_name'],
                address=row.get('address'),
                place_id=row.get('place_id'),
                phone=row.get('phone'),
                transaction_amount=float(row['transaction_amount']) if pd.notna(row.get('transaction_amount')) else None,
                transaction_type=row.get('transaction_type')
            )
            merchants.append(merchant_request)
        
        # Create batch
        batch_id = str(uuid.uuid4())
        batch_status = BatchValidationStatus(
            batch_id=batch_id,
            status="PENDING",
            total_merchants=len(merchants),
            processed_merchants=0,
            created_at=datetime.now()
        )
        
        # Store batch
        batch_storage[batch_id] = batch_status.dict()
        
        # Start background processing
        background_tasks.add_task(process_batch_validation, batch_id, merchants)
        
        return batch_status
        
    except Exception as e:
        logger.error(f"Error processing CSV upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV processing error: {str(e)}")

@app.get("/batch-status/{batch_id}", response_model=BatchValidationStatus)
async def get_batch_status(batch_id: str):
    """Get status of batch validation"""
    if batch_id not in batch_storage:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch_data = batch_storage[batch_id]
    return BatchValidationStatus(**batch_data)

@app.post("/validate-batch", response_model=BatchValidationStatus)
async def validate_batch(background_tasks: BackgroundTasks, request: BatchValidationRequest):
    """Validate multiple merchants in batch"""
    batch_id = str(uuid.uuid4())
    batch_status = BatchValidationStatus(
        batch_id=batch_id,
        status="PENDING",
        total_merchants=len(request.merchants),
        processed_merchants=0,
        created_at=datetime.now()
    )
    
    # Store batch
    batch_storage[batch_id] = batch_status.dict()
    
    # Start background processing
    background_tasks.add_task(process_batch_validation, batch_id, request.merchants)
    
    return batch_status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
