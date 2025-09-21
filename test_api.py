#!/usr/bin/env python3
"""
Test script for Locus Merchant Audit API
"""

import requests
import json
import sys

API_BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Google Maps API: {data['google_maps_api']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running.")
        return False

def test_merchant_validation():
    """Test merchant validation with a sample request"""
    print("\n🔍 Testing merchant validation...")
    
    # Sample merchant data
    test_data = {
        "merchant_name": "McDonald's",
        "address": "Times Square, New York, NY",
        "transaction_amount": 25.50,
        "transaction_type": "purchase"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/validate-merchant",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Merchant validation successful!")
            print(f"   Status: {data['validation_status']}")
            print(f"   Risk Level: {data['risk_assessment']['risk_level']}")
            print(f"   Risk Score: {data['risk_assessment']['risk_score']}")
            
            if data.get('merchant_info'):
                merchant = data['merchant_info']
                print(f"   Merchant: {merchant['name']}")
                print(f"   Address: {merchant['address']}")
                print(f"   Rating: {merchant.get('rating', 'N/A')}")
            
            return True
        else:
            print(f"❌ Merchant validation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during merchant validation: {str(e)}")
        return False

def test_search_merchants():
    """Test merchant search functionality"""
    print("\n🔍 Testing merchant search...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/search-merchants?query=restaurant&limit=3")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Merchant search successful!")
            print(f"   Found {len(data['results'])} results")
            
            for i, merchant in enumerate(data['results'][:2], 1):
                print(f"   {i}. {merchant['name']} - {merchant.get('address', 'No address')}")
            
            return True
        else:
            print(f"❌ Merchant search failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error during merchant search: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("📍 Locus Merchant Audit API Test Suite")
    print("=" * 40)
    
    tests_passed = 0
    total_tests = 3
    
    # Run tests
    if test_health_check():
        tests_passed += 1
    
    if test_merchant_validation():
        tests_passed += 1
    
    if test_search_merchants():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! The API is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
