from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Контраст Граффити Студия API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class PortfolioProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str  # 'murals', 'portraits', 'commercial', 'abstract', 'automotive'
    image: str  # base64 encoded image
    description: str
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PortfolioProjectCreate(BaseModel):
    title: str
    category: str
    image: str
    description: str
    featured: bool = False

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    icon: str
    title: str
    description: str
    price: str
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    message: str
    status: str = "new"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactSubmissionCreate(BaseModel):
    name: str
    phone: str
    email: str
    message: str

class PriceCalculation(BaseModel):
    area: float
    tier: str  # 'basic', 'standard', 'premium'
    
class PriceCalculationResult(BaseModel):
    price: float
    breakdown: Dict[str, Any]
    tier: str
    area: float

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    text: str
    rating: int
    approved: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProcessStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step: int
    title: str
    description: str
    icon: str
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Portfolio endpoints
@api_router.get("/portfolio", response_model=List[PortfolioProject])
async def get_portfolio():
    projects = await db.portfolio.find().to_list(1000)
    return [PortfolioProject(**project) for project in projects]

@api_router.get("/portfolio/categories")
async def get_portfolio_categories():
    categories = await db.portfolio.distinct("category")
    return {"categories": categories}

@api_router.post("/portfolio", response_model=PortfolioProject)
async def create_portfolio_project(project: PortfolioProjectCreate):
    project_dict = project.dict()
    project_obj = PortfolioProject(**project_dict)
    await db.portfolio.insert_one(project_obj.dict())
    return project_obj

# Services endpoints
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({"active": True}).sort("order", 1).to_list(1000)
    return [Service(**service) for service in services]

# Contact endpoints
@api_router.post("/contact")
async def submit_contact(contact: ContactSubmissionCreate):
    contact_dict = contact.dict()
    contact_obj = ContactSubmission(**contact_dict)
    await db.contact_submissions.insert_one(contact_obj.dict())
    
    # TODO: Add SMTP and Telegram integration here
    return {"success": True, "message": "Спасибо за обращение! Мы свяжемся с вами в ближайшее время."}

# Price calculator endpoint
@api_router.post("/calculate-price", response_model=PriceCalculationResult)
async def calculate_price(calculation: PriceCalculation):
    # Pricing logic based on tier and area
    base_prices = {
        "basic": 1500,    # ₽ per m²
        "standard": 3500, # ₽ per m²
        "premium": 7000   # ₽ per m²
    }
    
    if calculation.tier not in base_prices:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    base_price = base_prices[calculation.tier]
    total_price = base_price * calculation.area
    
    # Add complexity multiplier for larger areas
    if calculation.area > 50:
        total_price *= 0.9  # 10% discount for large areas
    elif calculation.area > 20:
        total_price *= 0.95  # 5% discount for medium areas
    
    breakdown = {
        "base_price_per_m2": base_price,
        "area": calculation.area,
        "subtotal": base_price * calculation.area,
        "discount": 0 if calculation.area <= 20 else (5 if calculation.area <= 50 else 10),
        "total": total_price,
        "tier_description": {
            "basic": "Простое художественное оформление",
            "standard": "Детализированная работа с элементами",
            "premium": "Премиальная работа с максимальной детализацией"
        }[calculation.tier]
    }
    
    return PriceCalculationResult(
        price=total_price,
        breakdown=breakdown,
        tier=calculation.tier,
        area=calculation.area
    )

# Content endpoints
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    testimonials = await db.testimonials.find({"approved": True}).to_list(1000)
    return [Testimonial(**testimonial) for testimonial in testimonials]

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find({"active": True}).sort("order", 1).to_list(1000)
    return [FAQ(**faq) for faq in faqs]

@api_router.get("/process", response_model=List[ProcessStep])
async def get_process_steps():
    steps = await db.process_steps.find({"active": True}).sort("step", 1).to_list(1000)
    return [ProcessStep(**step) for step in steps]

# Seed data endpoint (for development)
@api_router.post("/seed-data")
async def seed_data():
    # Clear existing data
    await db.portfolio.delete_many({})
    await db.services.delete_many({})
    await db.testimonials.delete_many({})
    await db.faqs.delete_many({})
    await db.process_steps.delete_many({})
    
    # Sample portfolio projects with real images
    portfolio_projects = [
        {
            "id": str(uuid.uuid4()),
            "title": "Граффити в переходе",
            "category": "murals",
            "image": "https://images.unsplash.com/photo-1487452066049-a710f7296400?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxncmFmZml0aXxlbnwwfHx8fDE3NTI4MTI3MTV8MA&ixlib=rb-4.1.0&q=85",
            "description": "Масштабная работа в подземном переходе с яркими цветами и современным дизайном.",
            "featured": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Абстрактное граффити",
            "category": "abstract",
            "image": "https://images.unsplash.com/photo-1604716053460-3f66248bf8de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxncmFmZml0aXxlbnwwfHx8fDE3NTI4MTI3MTV8MA&ixlib=rb-4.1.0&q=85",
            "description": "Красочная абстрактная композиция с геометрическими элементами.",
            "featured": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Персонаж граффити",
            "category": "portraits",
            "image": "https://images.unsplash.com/photo-1581850518616-bcb8077a2336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxncmFmZml0aXxlbnwwfHx8fDE3NTI4MTI3MTV8MA&ixlib=rb-4.1.0&q=85",
            "description": "Яркий персонаж с детализированной прорисовкой и эмоциональным выражением.",
            "featured": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Коммерческое оформление",
            "category": "commercial",
            "image": "https://images.pexels.com/photos/1227511/pexels-photo-1227511.jpeg",
            "description": "Профессиональное оформление торгового центра с корпоративными элементами.",
            "featured": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Стрит-арт композиция",
            "category": "murals",
            "image": "https://images.unsplash.com/photo-1530406831759-15c5c0cbce8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBhcnR8ZW58MHx8fHwxNzUyODEyNzIyfDA&ixlib=rb-4.1.0&q=85",
            "description": "Уличная композиция в знаменитом переулке с множеством художественных элементов.",
            "featured": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Оформление автомобиля",
            "category": "automotive",
            "image": "https://images.unsplash.com/photo-1583225238311-0278ade1070d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxzdHJlZXQlMjBhcnR8ZW58MHx8fHwxNzUyODEyNzIyfDA&ixlib=rb-4.1.0&q=85",
            "description": "Эксклюзивное оформление автомобиля с художественными элементами.",
            "featured": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Services based on real VK data
    services = [
        {
            "id": str(uuid.uuid4()),
            "icon": "Palette",
            "title": "Арт за день",
            "description": "Быстрое и качественное художественное оформление любого объекта за один день.",
            "price": "30,000 ₽",
            "order": 1,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "icon": "Brush",
            "title": "Художественное оформление",
            "description": "Профессиональное граффити и стрит-арт оформление стен, фасадов и интерьеров.",
            "price": "1,500–7,000 ₽/м²",
            "order": 2,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "icon": "Building",
            "title": "Реактивная смена облика помещений",
            "description": "Быстрое преображение интерьера с помощью современных граффити техник.",
            "price": "от 50,000 ₽",
            "order": 3,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "icon": "Car",
            "title": "Оформление автомобилей",
            "description": "Эксклюзивное художественное оформление автомобилей и мотоциклов.",
            "price": "от 80,000 ₽",
            "order": 4,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "icon": "Camera",
            "title": "Создание фотозоны",
            "description": "Дизайн и создание уникальных фотозон для мероприятий и заведений.",
            "price": "от 40,000 ₽",
            "order": 5,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "icon": "Megaphone",
            "title": "Реклама любой сложности",
            "description": "Наружная реклама с элементами граффити и стрит-арта.",
            "price": "от 25,000 ₽",
            "order": 6,
            "active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Testimonials
    testimonials = [
        {
            "id": str(uuid.uuid4()),
            "name": "Алексей Петров",
            "role": "Владелец кафе",
            "text": "Ребята из 'Контраст' превратили наше кафе в настоящее произведение искусства! Клиенты в восторге от нового интерьера.",
            "rating": 5,
            "approved": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Мария Иванова",
            "role": "Директор по маркетингу",
            "text": "Заказывали оформление офиса. Работа выполнена быстро и качественно. Гарантия 5 лет - это серьёзно!",
            "rating": 5,
            "approved": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Дмитрий Козлов",
            "role": "Владелец автосервиса",
            "text": "Сделали крутое граффити на стене автосервиса. Теперь это местная достопримечательность! Рекомендую всем.",
            "rating": 5,
            "approved": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # FAQs
    faqs = [
        {
            "id": str(uuid.uuid4()),
            "question": "Сколько времени занимает выполнение работы?",
            "answer": "Время выполнения зависит от сложности проекта. Простые работы выполняем за 1-2 дня, сложные проекты могут занимать до недели.",
            "order": 1,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "question": "Предоставляете ли гарантию на работу?",
            "answer": "Да, мы предоставляем гарантию до 5 лет на все виды работ при соблюдении условий эксплуатации.",
            "order": 2,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "question": "Работаете ли вы по всей России?",
            "answer": "Да, мы осуществляем выезд и берём заказы по всей территории России.",
            "order": 3,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "question": "Как рассчитывается стоимость работы?",
            "answer": "Стоимость рассчитывается индивидуально в зависимости от сложности, площади и материалов. Используйте наш калькулятор для предварительной оценки.",
            "order": 4,
            "active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Process steps
    process_steps = [
        {
            "id": str(uuid.uuid4()),
            "step": 1,
            "title": "Консультация",
            "description": "Обсуждаем ваши идеи и пожелания, определяем объём работ и бюджет.",
            "icon": "MessageSquare",
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "step": 2,
            "title": "Эскиз",
            "description": "Создаём детальный эскиз будущей работы с учётом всех ваших пожеланий.",
            "icon": "Sketch",
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "step": 3,
            "title": "Согласование",
            "description": "Согласовываем эскиз, вносим правки и утверждаем финальный вариант.",
            "icon": "CheckCircle",
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "step": 4,
            "title": "Выполнение",
            "description": "Приступаем к работе с использованием качественных материалов.",
            "icon": "Brush",
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "step": 5,
            "title": "Сдача проекта",
            "description": "Завершаем работу, убираем за собой и сдаём готовый проект.",
            "icon": "Star",
            "active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert data
    await db.portfolio.insert_many(portfolio_projects)
    await db.services.insert_many(services)
    await db.testimonials.insert_many(testimonials)
    await db.faqs.insert_many(faqs)
    await db.process_steps.insert_many(process_steps)
    
    return {"message": "Данные успешно загружены"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()