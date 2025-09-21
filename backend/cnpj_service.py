"""
CNPJ Service - Integration with Brazilian Federal Revenue Service data
"""

import httpx
import re
import logging
from typing import Optional, Dict, Any
from unidecode import unidecode
import asyncio

logger = logging.getLogger(__name__)

class CNPJService:
    """Service to interact with Brazilian CNPJ data"""
    
    def __init__(self):
        # Using ReceitaWS API as it's free and reliable
        self.base_url = "https://www.receitaws.com.br/v1/cnpj"
        self.timeout = 10.0
        
    def clean_cnpj(self, cnpj: str) -> str:
        """Clean CNPJ string, removing non-numeric characters"""
        if not cnpj:
            return ""
        return re.sub(r'[^0-9]', '', cnpj)
    
    def validate_cnpj_format(self, cnpj: str) -> bool:
        """Validate CNPJ format (14 digits)"""
        clean_cnpj = self.clean_cnpj(cnpj)
        return len(clean_cnpj) == 14 and clean_cnpj.isdigit()
    
    def extract_cnpj_from_text(self, text: str) -> Optional[str]:
        """Extract CNPJ from text using regex patterns"""
        if not text:
            return None
            
        # Pattern for CNPJ: XX.XXX.XXX/XXXX-XX
        cnpj_pattern = r'\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b'
        matches = re.findall(cnpj_pattern, text)
        
        for match in matches:
            clean_cnpj = self.clean_cnpj(match)
            if self.validate_cnpj_format(clean_cnpj):
                return clean_cnpj
        
        return None
    
    async def get_cnpj_data(self, cnpj: str) -> Optional[Dict[str, Any]]:
        """
        Fetch CNPJ data from Receita Federal via ReceitaWS API
        """
        clean_cnpj = self.clean_cnpj(cnpj)
        
        if not self.validate_cnpj_format(clean_cnpj):
            logger.warning(f"Invalid CNPJ format: {cnpj}")
            return None
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/{clean_cnpj}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check if the response contains error
                    if data.get('status') == 'ERROR':
                        logger.warning(f"CNPJ API error for {clean_cnpj}: {data.get('message')}")
                        return None
                    
                    return self._normalize_cnpj_data(data)
                
                elif response.status_code == 429:
                    logger.warning("CNPJ API rate limit exceeded")
                    return None
                
                else:
                    logger.error(f"CNPJ API error: {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout fetching CNPJ data for {clean_cnpj}")
            return None
        except Exception as e:
            logger.error(f"Error fetching CNPJ data for {clean_cnpj}: {str(e)}")
            return None
    
    def _normalize_cnpj_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize CNPJ data from ReceitaWS API"""
        return {
            'cnpj': raw_data.get('cnpj', ''),
            'company_name': raw_data.get('nome', ''),
            'trade_name': raw_data.get('fantasia', ''),
            'legal_nature': raw_data.get('natureza_juridica', ''),
            'main_activity': raw_data.get('atividade_principal', [{}])[0].get('text', '') if raw_data.get('atividade_principal') else '',
            'secondary_activities': [act.get('text', '') for act in raw_data.get('atividades_secundarias', [])],
            'registration_status': raw_data.get('situacao', ''),
            'registration_date': raw_data.get('abertura', ''),
            'address': {
                'street': raw_data.get('logradouro', ''),
                'number': raw_data.get('numero', ''),
                'complement': raw_data.get('complemento', ''),
                'neighborhood': raw_data.get('bairro', ''),
                'city': raw_data.get('municipio', ''),
                'state': raw_data.get('uf', ''),
                'zip_code': raw_data.get('cep', ''),
                'full_address': self._build_full_address(raw_data)
            },
            'phone': raw_data.get('telefone', ''),
            'email': raw_data.get('email', ''),
            'share_capital': raw_data.get('capital_social', ''),
            'company_size': raw_data.get('porte', ''),
            'last_update': raw_data.get('ultima_atualizacao', ''),
            'partners': raw_data.get('qsa', [])
        }
    
    def _build_full_address(self, data: Dict[str, Any]) -> str:
        """Build full address from CNPJ data"""
        parts = []
        
        if data.get('logradouro'):
            street_part = data['logradouro']
            if data.get('numero'):
                street_part += f", {data['numero']}"
            if data.get('complemento'):
                street_part += f", {data['complemento']}"
            parts.append(street_part)
        
        if data.get('bairro'):
            parts.append(data['bairro'])
        
        if data.get('municipio'):
            city_part = data['municipio']
            if data.get('uf'):
                city_part += f", {data['uf']}"
            parts.append(city_part)
        
        if data.get('cep'):
            parts.append(f"CEP: {data['cep']}")
        
        return " - ".join(parts)
    
    def compare_business_names(self, merchant_name: str, cnpj_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compare merchant name with CNPJ registered names"""
        if not merchant_name or not cnpj_data:
            return {
                'company_name_match': False,
                'trade_name_match': False,
                'similarity_score': 0.0,
                'best_match': None
            }
        
        # Normalize names for comparison
        merchant_normalized = unidecode(merchant_name.lower().strip())
        company_name = cnpj_data.get('company_name', '')
        trade_name = cnpj_data.get('trade_name', '')
        
        company_normalized = unidecode(company_name.lower().strip()) if company_name else ''
        trade_normalized = unidecode(trade_name.lower().strip()) if trade_name else ''
        
        # Calculate similarities
        company_similarity = self._calculate_name_similarity(merchant_normalized, company_normalized)
        trade_similarity = self._calculate_name_similarity(merchant_normalized, trade_normalized)
        
        # Determine best match
        best_match = None
        best_score = 0.0
        
        if company_similarity > trade_similarity:
            best_match = 'company_name'
            best_score = company_similarity
        elif trade_similarity > 0:
            best_match = 'trade_name'
            best_score = trade_similarity
        
        return {
            'company_name_match': company_similarity >= 0.8,
            'trade_name_match': trade_similarity >= 0.8,
            'company_name_similarity': company_similarity,
            'trade_name_similarity': trade_similarity,
            'similarity_score': max(company_similarity, trade_similarity),
            'best_match': best_match,
            'best_match_name': company_name if best_match == 'company_name' else trade_name
        }
    
    def _calculate_name_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two business names"""
        if not name1 or not name2:
            return 0.0
        
        # Simple word-based similarity
        words1 = set(name1.split())
        words2 = set(name2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def assess_cnpj_risk_factors(self, cnpj_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk factors based on CNPJ data"""
        risk_factors = []
        risk_score = 0
        
        if not cnpj_data:
            return {
                'risk_factors': ['CNPJ data not available'],
                'risk_score': 20,
                'recommendations': ['Verify business registration manually']
            }
        
        # Check registration status
        status = cnpj_data.get('registration_status', '').upper()
        if 'BAIXADA' in status or 'SUSPENSA' in status:
            risk_factors.append(f"Company status: {status}")
            risk_score += 40
        elif 'INAPTA' in status:
            risk_factors.append(f"Company status: {status}")
            risk_score += 25
        
        # Check if it's a recent registration (less than 6 months)
        registration_date = cnpj_data.get('registration_date', '')
        if registration_date:
            try:
                from datetime import datetime
                reg_date = datetime.strptime(registration_date, '%d/%m/%Y')
                months_since_registration = (datetime.now() - reg_date).days / 30
                
                if months_since_registration < 6:
                    risk_factors.append("Recently registered company (< 6 months)")
                    risk_score += 15
            except:
                pass
        
        # Check for missing contact information
        if not cnpj_data.get('phone'):
            risk_factors.append("No phone number registered")
            risk_score += 10
        
        if not cnpj_data.get('email'):
            risk_factors.append("No email registered")
            risk_score += 5
        
        # Check company size
        company_size = cnpj_data.get('company_size', '').upper()
        if 'MEI' in company_size:
            risk_factors.append("Micro Individual Entrepreneur (MEI)")
            risk_score += 5
        
        recommendations = []
        if risk_score > 30:
            recommendations.append("Enhanced due diligence recommended")
        if risk_score > 50:
            recommendations.append("Consider additional verification steps")
        if not risk_factors:
            recommendations.append("CNPJ data appears normal")
        
        return {
            'risk_factors': risk_factors,
            'risk_score': min(risk_score, 100),
            'recommendations': recommendations
        }

# Global instance
cnpj_service = CNPJService()
