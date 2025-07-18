#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Moscow Graffiti Studio
Tests all backend endpoints systematically
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://cccae5f5-2dd3-45b4-ac2c-53317ac1cd33.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_seed_data(self):
        """Test data seeding endpoint - CRITICAL: Must run first"""
        print("\n=== Testing Data Seeding (POST /api/seed-data) ===")
        try:
            response = self.session.post(f"{self.base_url}/seed-data")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "успешно" in data["message"]:
                    self.log_test("Data Seeding", True, f"Response: {data['message']}")
                    return True
                else:
                    self.log_test("Data Seeding", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Data Seeding", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Data Seeding", False, f"Exception: {str(e)}")
            return False
    
    def test_portfolio_apis(self):
        """Test portfolio endpoints"""
        print("\n=== Testing Portfolio APIs ===")
        
        # Test GET /api/portfolio
        try:
            response = self.session.get(f"{self.base_url}/portfolio")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check structure of first item
                    first_item = data[0]
                    required_fields = ['id', 'title', 'category', 'image', 'description']
                    if all(field in first_item for field in required_fields):
                        self.log_test("GET Portfolio", True, f"Retrieved {len(data)} portfolio items")
                    else:
                        missing = [f for f in required_fields if f not in first_item]
                        self.log_test("GET Portfolio", False, f"Missing fields: {missing}")
                else:
                    self.log_test("GET Portfolio", False, "Empty or invalid response format")
            else:
                self.log_test("GET Portfolio", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Portfolio", False, f"Exception: {str(e)}")
        
        # Test GET /api/portfolio/categories
        try:
            response = self.session.get(f"{self.base_url}/portfolio/categories")
            if response.status_code == 200:
                data = response.json()
                if "categories" in data and isinstance(data["categories"], list):
                    categories = data["categories"]
                    expected_categories = ['murals', 'portraits', 'commercial', 'abstract', 'automotive']
                    if any(cat in categories for cat in expected_categories):
                        self.log_test("GET Portfolio Categories", True, f"Categories: {categories}")
                    else:
                        self.log_test("GET Portfolio Categories", False, f"Unexpected categories: {categories}")
                else:
                    self.log_test("GET Portfolio Categories", False, "Invalid response format")
            else:
                self.log_test("GET Portfolio Categories", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Portfolio Categories", False, f"Exception: {str(e)}")
    
    def test_services_api(self):
        """Test services endpoint"""
        print("\n=== Testing Services API ===")
        
        try:
            response = self.session.get(f"{self.base_url}/services")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check structure
                    first_service = data[0]
                    required_fields = ['id', 'title', 'description', 'price', 'icon']
                    if all(field in first_service for field in required_fields):
                        # Check for Russian content
                        russian_content = any('₽' in service.get('price', '') for service in data)
                        if russian_content:
                            self.log_test("GET Services", True, f"Retrieved {len(data)} services with Russian pricing")
                        else:
                            self.log_test("GET Services", True, f"Retrieved {len(data)} services (no Russian pricing detected)")
                    else:
                        missing = [f for f in required_fields if f not in first_service]
                        self.log_test("GET Services", False, f"Missing fields: {missing}")
                else:
                    self.log_test("GET Services", False, "Empty or invalid response format")
            else:
                self.log_test("GET Services", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Services", False, f"Exception: {str(e)}")
    
    def test_contact_form(self):
        """Test contact form submission"""
        print("\n=== Testing Contact Form API ===")
        
        # Test data with realistic Russian names
        test_contact = {
            "name": "Анна Смирнова",
            "phone": "+7 (495) 123-45-67",
            "email": "anna.smirnova@example.com",
            "message": "Здравствуйте! Интересует оформление стены в кафе. Площадь примерно 15 м². Можете рассчитать стоимость?"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/contact",
                json=test_contact,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "message" in data:
                    # Check for Russian response
                    if "Спасибо" in data["message"] or "свяжемся" in data["message"]:
                        self.log_test("POST Contact Form", True, f"Success message: {data['message']}")
                    else:
                        self.log_test("POST Contact Form", True, f"Success but non-Russian message: {data['message']}")
                else:
                    self.log_test("POST Contact Form", False, f"Invalid response format: {data}")
            else:
                self.log_test("POST Contact Form", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST Contact Form", False, f"Exception: {str(e)}")
    
    def test_price_calculator(self):
        """Test price calculator with different scenarios"""
        print("\n=== Testing Price Calculator API ===")
        
        # Test scenarios
        test_cases = [
            {"area": 10, "tier": "basic", "expected_discount": 0},
            {"area": 25, "tier": "standard", "expected_discount": 5},
            {"area": 60, "tier": "premium", "expected_discount": 10},
        ]
        
        for i, test_case in enumerate(test_cases):
            try:
                response = self.session.post(
                    f"{self.base_url}/calculate-price",
                    json={"area": test_case["area"], "tier": test_case["tier"]},
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['price', 'breakdown', 'tier', 'area']
                    if all(field in data for field in required_fields):
                        breakdown = data['breakdown']
                        actual_discount = breakdown.get('discount', 0)
                        if actual_discount == test_case['expected_discount']:
                            self.log_test(f"Price Calculator Case {i+1}", True, 
                                        f"Area: {test_case['area']}m², Tier: {test_case['tier']}, Price: {data['price']:.0f}₽, Discount: {actual_discount}%")
                        else:
                            self.log_test(f"Price Calculator Case {i+1}", False, 
                                        f"Expected discount {test_case['expected_discount']}%, got {actual_discount}%")
                    else:
                        missing = [f for f in required_fields if f not in data]
                        self.log_test(f"Price Calculator Case {i+1}", False, f"Missing fields: {missing}")
                else:
                    self.log_test(f"Price Calculator Case {i+1}", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Price Calculator Case {i+1}", False, f"Exception: {str(e)}")
        
        # Test invalid tier
        try:
            response = self.session.post(
                f"{self.base_url}/calculate-price",
                json={"area": 10, "tier": "invalid"},
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 400:
                self.log_test("Price Calculator Invalid Tier", True, "Correctly rejected invalid tier")
            else:
                self.log_test("Price Calculator Invalid Tier", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Price Calculator Invalid Tier", False, f"Exception: {str(e)}")
    
    def test_content_apis(self):
        """Test content management APIs"""
        print("\n=== Testing Content APIs ===")
        
        # Test testimonials
        try:
            response = self.session.get(f"{self.base_url}/testimonials")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    first_testimonial = data[0]
                    required_fields = ['id', 'name', 'role', 'text', 'rating']
                    if all(field in first_testimonial for field in required_fields):
                        # Check for Russian content
                        russian_names = any(any(ord(char) > 127 for char in item.get('name', '')) for item in data)
                        self.log_test("GET Testimonials", True, f"Retrieved {len(data)} testimonials, Russian content: {russian_names}")
                    else:
                        missing = [f for f in required_fields if f not in first_testimonial]
                        self.log_test("GET Testimonials", False, f"Missing fields: {missing}")
                else:
                    self.log_test("GET Testimonials", False, "Empty or invalid response")
            else:
                self.log_test("GET Testimonials", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Testimonials", False, f"Exception: {str(e)}")
        
        # Test FAQs
        try:
            response = self.session.get(f"{self.base_url}/faqs")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    first_faq = data[0]
                    required_fields = ['id', 'question', 'answer', 'order']
                    if all(field in first_faq for field in required_fields):
                        self.log_test("GET FAQs", True, f"Retrieved {len(data)} FAQs")
                    else:
                        missing = [f for f in required_fields if f not in first_faq]
                        self.log_test("GET FAQs", False, f"Missing fields: {missing}")
                else:
                    self.log_test("GET FAQs", False, "Empty or invalid response")
            else:
                self.log_test("GET FAQs", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET FAQs", False, f"Exception: {str(e)}")
        
        # Test process steps
        try:
            response = self.session.get(f"{self.base_url}/process")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    first_step = data[0]
                    required_fields = ['id', 'step', 'title', 'description', 'icon']
                    if all(field in first_step for field in required_fields):
                        # Check if steps are ordered
                        steps = [item['step'] for item in data]
                        ordered = steps == sorted(steps)
                        self.log_test("GET Process Steps", True, f"Retrieved {len(data)} process steps, ordered: {ordered}")
                    else:
                        missing = [f for f in required_fields if f not in first_step]
                        self.log_test("GET Process Steps", False, f"Missing fields: {missing}")
                else:
                    self.log_test("GET Process Steps", False, "Empty or invalid response")
            else:
                self.log_test("GET Process Steps", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Process Steps", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests in the correct order"""
        print(f"🚀 Starting Backend API Tests for Moscow Graffiti Studio")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # 1. CRITICAL: Seed data first (populates database)
        seed_success = self.test_seed_data()
        
        if not seed_success:
            print("\n❌ CRITICAL: Data seeding failed. Other tests may not work properly.")
            print("Continuing with other tests anyway...")
        
        # 2. Test all other endpoints
        self.test_portfolio_apis()
        self.test_services_api()
        self.test_contact_form()
        self.test_price_calculator()
        self.test_content_apis()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)