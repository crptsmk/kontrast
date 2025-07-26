import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Palette, 
  Brush, 
  Building, 
  Car, 
  Camera, 
  Megaphone,
  MessageSquare,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Filter,
  Calculator,
  Users,
  Award,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Send
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icon mapping for services and process steps
const iconMap = {
  Palette: Palette,
  Brush: Brush,
  Building: Building,
  Car: Car,
  Camera: Camera,
  Megaphone: Megaphone,
  MessageSquare: MessageSquare,
  CheckCircle: CheckCircle,
  Star: Star,
  Sketch: Brush // Using Brush as fallback for Sketch
};

// Header Component
const Header = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Главная', href: 'hero' },
    { name: 'О нас', href: 'about' },
    { name: 'Портфолио', href: 'portfolio' },
    { name: 'Услуги', href: 'services' },
    { name: 'Контакты', href: 'contact' }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Контраст</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`text-gray-300 hover:text-yellow-400 transition-colors ${
                  activeSection === item.href ? 'text-yellow-400' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="flex flex-col space-y-2 mt-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-left py-2"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Hero Section
const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1487452066049-a710f7296400?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxncmFmZml0aXxlbnwwfHx8fDE3NTI4MTI3MTV8MA&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          <span className="text-yellow-400">Контраст</span>
          <br />
          Граффити Студия
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Команда профессионалов уличного граффити и современного стрит-арта. 
          Осуществляем выезд и берём заказы по всей России!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-8 rounded-full transition-colors flex items-center justify-center space-x-2"
          >
            <span>Заказать проект</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold py-4 px-8 rounded-full transition-colors"
          >
            Узнать больше
          </button>
        </div>
      </div>
    </section>
  );
};

// Portfolio Section
const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
    fetchCategories();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`${API}/portfolio`);
      const data = await response.json();
      // Remove duplicates based on title and category
      const uniqueProjects = data.filter((project, index, self) => 
        index === self.findIndex(p => p.title === project.title && p.category === project.category)
      );
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API}/portfolio/categories`);
      const data = await response.json();
      setCategories(['all', ...data.categories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  const categoryNames = {
    all: 'Все работы',
    murals: 'Муралы',
    portraits: 'Портреты',
    commercial: 'Коммерческие',
    abstract: 'Абстракция',
    automotive: 'Автомобили'
  };

  return (
    <section id="portfolio" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Наши <span className="text-yellow-400">Работы</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Профессиональное граффити и стрит-арт для любых объектов
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                activeCategory === category
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {categoryNames[category] || category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Загрузка портфолио...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div key={project.id} className="group relative overflow-hidden rounded-lg bg-gray-800 hover:transform hover:scale-105 transition-all duration-300">
                <div className="aspect-square">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center px-4">
                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      {categoryNames[project.category] || project.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// About Section with Video
const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Section */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe 
                src="https://vk.com/video_ext.php?oid=-28179884&id=456239025&hd=3&autoplay=0" 
                width="100%" 
                height="100%" 
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" 
                frameBorder="0" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
          
          {/* Content Section */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              О студии <span className="text-yellow-400">Контраст</span>
            </h2>
            <div className="space-y-4 text-gray-300 text-lg">
              <p>
                Мы — команда профессиональных художников граффити и стрит-арта с многолетним опытом работы по всей России.
              </p>
              <p>
                Наша студия специализируется на создании уникальных художественных проектов любой сложности — от небольших интерьерных работ до масштабных муралов.
              </p>
              <p>
                Мы используем только качественные материалы и предоставляем гарантию до 5 лет на все виды работ.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                <div className="text-gray-400">Выполненных проектов</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">5 лет</div>
                <div className="text-gray-400">Гарантия качества</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">85</div>
                <div className="text-gray-400">Регионов России</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
                <div className="text-gray-400">Довольных клиентов</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
// Services Section
const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API}/services`);
      const data = await response.json();
      // Remove duplicates based on title
      const uniqueServices = data.filter((service, index, self) => 
        index === self.findIndex(s => s.title === service.title)
      );
      setServices(uniqueServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="services" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Наши <span className="text-yellow-400">Услуги</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Полный спектр услуг по граффити и художественному оформлению
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Загрузка услуг...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => {
              const IconComponent = iconMap[service.icon] || Palette;
              return (
                <div key={service.id} className="bg-gray-900 p-8 rounded-lg hover:bg-gray-800 transition-colors group">
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6 service-icon">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold text-lg">{service.price}</span>
                    <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// Price Calculator Section
const PriceCalculator = () => {
  const [area, setArea] = useState('');
  const [tier, setTier] = useState('basic');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculatePrice = async () => {
    if (!area || area <= 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API}/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: parseFloat(area), tier })
      });
      const data = await response.json();
      setCalculation(data);
    } catch (error) {
      console.error('Error calculating price:', error);
    } finally {
      setLoading(false);
    }
  };

  const tierOptions = {
    basic: { name: 'Базовая', description: 'Простое художественное оформление', price: '1,500 ₽/м²' },
    standard: { name: 'Стандарт', description: 'Детализированная работа с элементами', price: '3,500 ₽/м²' },
    premium: { name: 'Премиум', description: 'Максимальная детализация и сложность', price: '7,000 ₽/м²' }
  };

  return (
    <section id="calculator" className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_graffiti-studio/artifacts/vjhnryf0_u7332619193_A_vibrant_urban_graffiti_mural_with_the_word_text_356fdc1f-f557-4296-b805-6c059c645737_0.png)'
        }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Калькулятор <span className="text-yellow-400">Стоимости</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Рассчитайте предварительную стоимость вашего проекта
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-black/90 backdrop-blur-sm p-8 rounded-lg border border-yellow-400/20">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white font-semibold mb-2">Площадь (м²)</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Введите площадь"
                  className="w-full p-4 bg-gray-800/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Уровень сложности</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full p-4 bg-gray-800/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-600"
                >
                  {Object.entries(tierOptions).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option.name} - {option.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Описание уровня:</h3>
              <p className="text-gray-300">{tierOptions[tier].description}</p>
            </div>

            <button
              onClick={calculatePrice}
              disabled={!area || loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 text-black font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Рассчитать стоимость</span>
                </>
              )}
            </button>

            {calculation && (
              <div className="mt-8 p-6 bg-gray-800/90 rounded-lg border border-yellow-400/30">
                <h3 className="text-xl font-bold text-white mb-4">Результат расчёта:</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Площадь:</span>
                    <span>{calculation.area} м²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Цена за м²:</span>
                    <span>{calculation.breakdown.base_price_per_m2} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Подитог:</span>
                    <span>{calculation.breakdown.subtotal.toLocaleString()} ₽</span>
                  </div>
                  {calculation.breakdown.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Скидка:</span>
                      <span>-{calculation.breakdown.discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-gray-700 pt-2">
                    <span>Итого:</span>
                    <span>{calculation.price.toLocaleString()} ₽</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  * Это предварительная оценка. Финальная стоимость может отличаться в зависимости от сложности проекта.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Process Section
const Process = () => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcess();
  }, []);

  const fetchProcess = async () => {
    try {
      const response = await fetch(`${API}/process`);
      const data = await response.json();
      // Remove duplicates based on step number and title
      const uniqueSteps = data.filter((step, index, self) => 
        index === self.findIndex(s => s.step === step.step && s.title === step.title)
      );
      setSteps(uniqueSteps);
    } catch (error) {
      console.error('Error fetching process:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="process" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Как мы <span className="text-yellow-400">Работаем</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Наш проверенный процесс от идеи до воплощения
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Загрузка процесса...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const IconComponent = iconMap[step.icon] || MessageSquare;
              return (
                <div key={step.id} className="flex items-center mb-12 last:mb-0">
                  <div className="flex-shrink-0 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mr-8">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 font-bold text-lg mr-4">
                        {step.step.toString().padStart(2, '0')}
                      </span>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-8 h-12 w-px bg-gray-700"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// Testimonials Section
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
    fetchFaqs();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API}/testimonials`);
      const data = await response.json();
      // Remove duplicates based on name and text
      const uniqueTestimonials = data.filter((testimonial, index, self) => 
        index === self.findIndex(t => t.name === testimonial.name && t.text === testimonial.text)
      );
      setTestimonials(uniqueTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${API}/faqs`);
      const data = await response.json();
      // Remove duplicates based on question
      const uniqueFaqs = data.filter((faq, index, self) => 
        index === self.findIndex(f => f.question === faq.question)
      );
      setFaqs(uniqueFaqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Отзывы <span className="text-yellow-400">Клиентов</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Что говорят о нас наши клиенты
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Загрузка отзывов...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="bg-black p-8 rounded-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                Часто задаваемые <span className="text-yellow-400">вопросы</span>
              </h3>
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-black p-6 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">{faq.question}</h4>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// Contact Section
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Свяжитесь с <span className="text-yellow-400">Нами</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Готовы обсудить ваш проект? Мы работаем по всей России!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Контактная информация</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-gray-400">Телефон</p>
                  <p className="text-white font-semibold">+7 (996) 936-22-90</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-gray-400">География работы</p>
                  <p className="text-white font-semibold">Вся Россия</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-gray-400">Гарантия</p>
                  <p className="text-white font-semibold">До 5 лет</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-900 rounded-lg">
              <h4 className="text-white font-semibold mb-4">Преимущества работы с нами:</h4>
              <ul className="space-y-2 text-gray-400">
                <li>• Индивидуальный подход к каждому клиенту</li>
                <li>• Профессиональная команда художников</li>
                <li>• Качественные материалы и оборудование</li>
                <li>• Работа в любом регионе России</li>
                <li>• Гарантия на все виды работ</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Оставить заявку</h3>
            {submitted ? (
              <div className="bg-green-900 border border-green-500 p-6 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Спасибо за обращение!</h4>
                <p className="text-gray-300">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше имя"
                    required
                    className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                    required
                    className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Расскажите о вашем проекте..."
                    rows="5"
                    required
                    className="w-full p-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 text-black font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Отправить заявку</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Palette className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">Контраст</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 mb-2">
              © 2024 Контраст. Все права защищены.
            </p>
            <p className="text-gray-500 text-sm">
              Профессиональное граффити по всей России
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    // Seed data on app start
    const seedData = async () => {
      try {
        await fetch(`${API}/seed-data`, { method: 'POST' });
      } catch (error) {
        console.error('Error seeding data:', error);
      }
    };
    seedData();

    // Scroll spy for active section
    const handleScroll = () => {
      const sections = ['hero', 'about', 'portfolio', 'services', 'calculator', 'process', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Services />
        <PriceCalculator />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;