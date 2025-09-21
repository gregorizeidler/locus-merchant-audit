# 📍 Locus Merchant Audit - Merchant Validation Platform

<div align="center">

![Locus Merchant Audit](https://img.shields.io/badge/Locus-Merchant_Audit-blue?style=for-the-badge&logo=map-pin&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)

**🚀 A comprehensive merchant validation platform for fraud and AML teams**

*Leverage Google Maps APIs to verify business existence and assess transaction risk through geospatial intelligence*

</div>

---

## 🎯 **Core Features**

<table>
<tr>
<td width="50%">

### 🔍 **Merchant Verification**
- ✅ Real-time business existence validation
- ✅ Google Places API integration
- ✅ Brazilian CNPJ verification (Receita Federal)
- ✅ Comprehensive business data extraction
- ✅ Multi-source verification

### 🧠 **AI-Powered Risk Assessment**
- ✅ Multi-factor risk scoring (0-100 scale)
- ✅ Business reputation analysis
- ✅ CNPJ-based risk factors
- ✅ Transaction pattern detection
- ✅ Automated risk categorization

</td>
<td width="50%">

### 📍 **Address Intelligence**
- ✅ Smart address comparison & matching
- ✅ Similarity scoring with detailed analysis
- ✅ Geographic discrepancy detection
- ✅ Location-based risk factors

### 🗺️ **Visual Verification**
- ✅ Street View integration
- ✅ Interactive Google Maps
- ✅ Business photo galleries
- ✅ Location-based insights

</td>
</tr>
</table>

### 📊 **Batch Processing & Analytics**
- 🔄 **CSV Upload**: Bulk merchant validation with progress tracking
- ⚡ **Background Processing**: Asynchronous validation for large datasets
- 📈 **Real-time Monitoring**: Live status updates and progress indicators
- 📋 **Export Results**: Comprehensive CSV reports for compliance

### 🇧🇷 **Brazilian CNPJ Integration**
- 🏢 **Official Data**: Direct integration with Receita Federal
- 📋 **Company Verification**: Registration status, activities, partners
- 🔍 **Name Matching**: Compare merchant names with official records
- ⚠️ **Risk Factors**: Detect inactive, suspended, or problematic companies

---

## 🏗️ **System Architecture**

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Dashboard] --> B[Google Maps Integration]
        A --> C[Batch Upload Interface]
        A --> D[Real-time Validation Forms]
    end
    
    subgraph "API Layer"
        E[FastAPI Backend] --> F[Validation Engine]
        E --> G[Batch Processor]
        E --> H[Risk Calculator]
    end
    
    subgraph "External Services"
        I[Google Places API] --> J[Business Data]
        I --> K[Location Data]
        I --> L[Street View Images]
    end
    
    subgraph "Data Layer"
        M[PostgreSQL + PostGIS] --> N[Merchant Records]
        M --> O[Validation History]
        M --> P[Risk Assessments]
    end
    
    A --> E
    F --> I
    G --> M
    H --> M
    
    style A fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    style E fill:#009688,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#4285F4,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#336791,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🔄 **Validation Flow**

```mermaid
flowchart TD
    Start([🚀 Start Validation]) --> Input{Input Type?}
    
    Input -->|Single| Single[📝 Single Merchant Form]
    Input -->|Batch| Batch[📊 CSV Upload]
    
    Single --> Search[🔍 Google Places Search]
    Batch --> Parse[📋 Parse CSV Data]
    Parse --> Queue[⏳ Queue Processing]
    Queue --> Search
    
    Search --> Found{Merchant Found?}
    Found -->|Yes| Extract[📊 Extract Business Data]
    Found -->|No| NotFound[❌ Merchant Not Found]
    
    Extract --> Address{Address Provided?}
    Address -->|Yes| Compare[📍 Compare Addresses]
    Address -->|No| CNPJ[🇧🇷 Check CNPJ Data]
    Compare --> CNPJ
    CNPJ --> Risk[🧠 Calculate Risk Score]
    
    Risk --> Level{Risk Level?}
    Level -->|Low| Valid[✅ Valid - Low Risk]
    Level -->|Medium| Monitor[⚠️ Monitor - Medium Risk]
    Level -->|High| Suspicious[🚨 Suspicious - High Risk]
    Level -->|Critical| Critical[🔴 Critical - Immediate Review]
    
    NotFound --> Invalid[❌ Invalid - Not Found]
    
    Valid --> Report[📋 Generate Report]
    Monitor --> Report
    Suspicious --> Report
    Critical --> Report
    Invalid --> Report
    
    Report --> End([✨ Complete])
    
    style Start fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style Valid fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style Monitor fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    style Suspicious fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    style Critical fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    style Invalid fill:#607D8B,stroke:#333,stroke-width:2px,color:#fff
    style End fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🚀 **Quick Start Guide**

### 📋 **Prerequisites**
```bash
✅ Python 3.8+
✅ Node.js 16+
✅ PostgreSQL with PostGIS
✅ Google Maps API Key
```

### ⚡ **One-Command Setup**
```bash
# Clone and start the application
git clone <repository-url>
cd geoaml
./start.sh
```

### 🔧 **Manual Setup**

<details>
<summary><b>🐍 Backend Setup</b></summary>

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your Google Maps API key

# Start backend server
cd backend
python main.py
```
</details>

<details>
<summary><b>⚛️ Frontend Setup</b></summary>

```bash
# Install dependencies
cd frontend
npm install

# Configure environment
cp env.example .env
# Edit .env with your Google Maps API key

# Start development server
npm run dev
```
</details>

### 🌐 **Access Points**
| Service | URL | Description |
|---------|-----|-------------|
| 🎨 **Frontend** | http://localhost:3000 | Main dashboard interface |
| 🔧 **Backend API** | http://localhost:8000 | REST API endpoints |
| 📚 **API Docs** | http://localhost:8000/docs | Interactive API documentation |

---

## 📡 **API Endpoints**

### 🔍 **Single Merchant Validation**
```http
POST /validate-merchant
Content-Type: application/json

{
  "merchant_name": "Example Restaurant",
  "address": "123 Main St, City, State",
  "transaction_amount": 150.00,
  "transaction_type": "purchase"
}
```

<details>
<summary><b>📄 Response Example</b></summary>

```json
{
  "merchant_info": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Example Restaurant",
    "address": "123 Main St, City, State 12345",
    "rating": 4.2,
    "user_ratings_total": 127,
    "business_status": "OPERATIONAL",
    "types": ["restaurant", "food", "establishment"]
  },
  "risk_assessment": {
    "risk_score": 25.0,
    "risk_level": "LOW",
    "risk_factors": ["No specific risk factors identified"],
    "recommendations": ["Low risk - standard processing"]
  },
  "address_comparison": {
    "similarity_score": 95.5,
    "is_match": true,
    "differences": []
  },
  "validation_status": "VALID"
}
```
</details>

### 📊 **Batch Processing**
```http
POST /upload-csv
Content-Type: multipart/form-data

file: merchants.csv
```

```http
GET /batch-status/{batch_id}
```

### 🔍 **Merchant Search**
```http
GET /search-merchants?query=restaurant&limit=5
```

### 🇧🇷 **CNPJ Verification**
```http
GET /cnpj/{cnpj}
```

```http
POST /compare-cnpj
Content-Type: application/json

{
  "merchant_name": "Magazine Luiza",
  "cnpj": "05.570.714/0001-59",
  "merchant_address": "Rua Voluntários da Pátria, São Paulo"
}
```

---

## 🧠 **Risk Scoring Algorithm**

<div align="center">

### 🎯 **Multi-Dimensional Risk Assessment**

</div>

| **Category** | **Weight** | **Risk Factors** | **Points** |
|--------------|------------|------------------|------------|
| 🏢 **Business Verification** | 40% | Business not found | +100 (Critical) |
| | | Permanently closed | +40 |
| | | Temporarily closed | +20 |
| ⭐ **Reputation Analysis** | 40% | No customer reviews | +25 |
| | | Very few reviews (<10) | +15 |
| | | Low rating (<3.0) | +15 |
| | | Missing phone number | +10 |
| | | No website | +5 |
| 🏪 **Business Type Risk** | 20% | High-risk types (ATM, Casino) | +10 each |
| | | Medium-risk types (Gas Station) | +5 each |
| 📍 **Address Verification** | 30% | Significant mismatch (<50%) | +30 |
| | | Minor mismatch (50-80%) | +15 |
| 🇧🇷 **CNPJ Verification** | 40% | Company inactive/suspended | +40 |
| | | Name mismatch with registration | +20 |
| | | Recently registered (<6 months) | +15 |
| | | Missing contact information | +10 |
| 💰 **Transaction Analysis** | 25% | High value (>$10,000) | +15 |
| | | Medium value (>$5,000) | +10 |

### 🚦 **Risk Categories**

<table>
<tr>
<td align="center" style="background-color: #E8F5E8;">

**🟢 LOW RISK**  
*0-29 points*  
Standard Processing

</td>
<td align="center" style="background-color: #FFF3CD;">

**🟡 MEDIUM RISK**  
*30-59 points*  
Enhanced Monitoring

</td>
<td align="center" style="background-color: #F8D7DA;">

**🔴 HIGH RISK**  
*60-79 points*  
Enhanced Due Diligence

</td>
<td align="center" style="background-color: #E2D3F3;">

**🟣 CRITICAL RISK**  
*80-100 points*  
Immediate Investigation

</td>
</tr>
</table>

---

## 🗺️ **Google Maps Integration**

### 🔌 **APIs Utilized**
- **🏢 Places API**: Business information and verification
- **📍 Geocoding API**: Address to coordinates conversion  
- **🗺️ Maps JavaScript API**: Interactive map visualization
- **👁️ Street View Static API**: Visual business verification
- **🇧🇷 ReceitaWS API**: Brazilian CNPJ data from Receita Federal

### ✨ **Features**
- 📍 Interactive merchant location mapping
- 📸 Business photo galleries from Google Places
- ⏰ Real-time operating hours display
- ⭐ Customer reviews and ratings integration
- 🏷️ Automatic business type classification
- 👁️ Street View modal for visual verification
- 🇧🇷 Brazilian CNPJ verification and risk assessment
- 📋 Official company data from Receita Federal
- 👥 Business partners and registration information

---

## 🛡️ **Security & Compliance**

<table>
<tr>
<td width="50%">

### 🔐 **Security Features**
- 🔑 Environment-based API key management
- ✅ Comprehensive input validation
- 🛡️ Pydantic model validation
- 🚫 Built-in rate limiting
- 📝 Comprehensive error handling

</td>
<td width="50%">

### 📋 **Compliance Ready**
- 📊 Complete audit trail capabilities
- 📈 Risk assessment documentation
- 📋 Exportable compliance reports
- 🕐 Timestamped validation records
- 📁 Structured data storage

</td>
</tr>
</table>

---

## 💾 **Database Schema**

### 📊 **Core Tables**

**🏢 Merchants Table**
- Cached merchant information from Google Places
- Location coordinates (PostGIS ready)
- Business metadata and validation history

**📋 Merchant Validations Table**  
- Individual validation requests and results
- Risk assessment data with detailed scoring
- Transaction context and audit information

**📈 Batch Processing Table**
- Batch job status and progress tracking
- Background processing metadata
- Results aggregation and reporting

---

## 🔧 **Development & Testing**

### 🧪 **Running Tests**
```bash
# Backend API tests
python test_api.py

# Frontend component tests  
cd frontend && npm test

# Integration tests
./run_integration_tests.sh
```

### 📊 **Sample Data**
Use the provided `sample_merchants.csv` for testing batch validation:
```csv
merchant_name,address,transaction_amount,transaction_type
McDonald's,Times Square New York NY,25.50,purchase
Starbucks,Broadway New York,12.75,purchase
Apple Store,Fifth Avenue New York,999.99,purchase
```

---

## 🐳 **Docker Deployment**

### 🚀 **Quick Deploy**
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### ⚙️ **Environment Configuration**
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/geoaml
SECRET_KEY=your_secret_key_here
```

---

## 🤝 **Contributing**

<div align="center">

**We welcome contributions! 🎉**

[![Contributors](https://img.shields.io/badge/Contributors-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Issues](https://img.shields.io/badge/Issues-Open-blue?style=for-the-badge)](https://github.com/your-repo/issues)
[![Pull Requests](https://img.shields.io/badge/PRs-Welcome-orange?style=for-the-badge)](https://github.com/your-repo/pulls)

</div>

1. 🍴 Fork the repository
2. 🌟 Create a feature branch
3. ✨ Make your changes
4. 🧪 Add comprehensive tests
5. 📝 Update documentation
6. 🚀 Submit a pull request

---

## 📄 **License**

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**This project is licensed under the MIT License**

</div>

---

## 🇧🇷 **Brazilian CNPJ Integration**

### 📋 **What is CNPJ?**
CNPJ (Cadastro Nacional da Pessoa Jurídica) is the Brazilian federal tax ID for companies, similar to EIN in the US. It's a 14-digit number that uniquely identifies every business entity in Brazil.

### 🔍 **How It Works**
1. **🔍 Automatic Detection**: The system automatically extracts CNPJ numbers from merchant names and addresses
2. **🌐 Real-time Lookup**: Queries the Brazilian Federal Revenue Service database via ReceitaWS API
3. **📊 Data Enrichment**: Retrieves official company information including:
   - Company name (Razão Social) and trade name (Nome Fantasia)
   - Registration status (Active, Inactive, Suspended)
   - Business activities and legal nature
   - Registered address and contact information
   - Partners and shareholders information
   - Registration date and last update

### ⚠️ **Risk Factors Detected**
- **🔴 Inactive Companies**: Businesses that are permanently closed or suspended
- **📅 Recent Registration**: Companies registered less than 6 months ago
- **📞 Missing Contact**: No phone number or email registered
- **📝 Name Mismatch**: Merchant name doesn't match official registration
- **🏢 Business Type**: MEI (Micro Individual Entrepreneur) classification

### 📊 **Sample CNPJ Data**
```json
{
  "cnpj": "05.570.714/0001-59",
  "company_name": "MAGAZINE LUIZA S.A.",
  "trade_name": "MAGAZINE LUIZA",
  "registration_status": "ATIVA",
  "main_activity": "Comércio varejista de mercadorias em geral",
  "registration_date": "25/01/1957",
  "address": {
    "street": "Rua Voluntários da Pátria, 1465",
    "city": "São Paulo",
    "state": "SP"
  },
  "partners": [
    {"nome": "LUIZA HELENA TRAJANO", "qual": "Diretor"}
  ]
}
```

### 🎯 **Benefits for AML Teams**
- **✅ Official Verification**: Data directly from Brazilian government
- **🚨 Fraud Detection**: Identify fake or inactive businesses
- **📈 Enhanced Due Diligence**: Complete business background information
- **🔍 Network Analysis**: Understand business ownership structure
- **⚡ Automated Processing**: No manual CNPJ lookups required

---

## 🔗 **External Resources**

<div align="center">

[![Google Maps Platform](https://img.shields.io/badge/Google_Maps-Platform-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![FastAPI Docs](https://img.shields.io/badge/FastAPI-Documentation-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Docs](https://img.shields.io/badge/React-Documentation-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Documentation-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)

</div>

---

<div align="center">

*Empowering financial institutions with intelligent merchant validation*

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Powered by Google Maps](https://img.shields.io/badge/Powered%20by-Google%20Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)

</div>