import { query, one } from './db.js'
import { hashPassword, slugify } from './auth.js'

const img = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const PHOTO = {
  villa1: '1613490493576-7fde63acd811',
  villa2: '1600596542815-ffad4c1539a9',
  villa3: '1545324418-cc1a3fa10c00',
  villa4: '1613977257363-707ba9348227',
  villa5: '1600047509807-ba8f99d2cdde',
  house1: '1568605114967-8130f3a36994',
  house2: '1570129477492-45c003edd2be',
  house3: '1580587771525-78b9dba3b914',
  house4: '1512917774080-9991f1c4c750',
  living1: '1600585154340-be6161a56a0c',
  living2: '1600607687939-ce8a6c25118c',
  living3: '1600210492486-724fe5c67fb0',
  living4: '1600607687920-4e2a09cf159d',
  living5: '1600573472550-8090b5e0745e',
  living6: '1600585154526-990dced4db0d',
  living7: '1600566753190-17f0baa2a6c3',
  interior1: '1502672260266-1c1ef2d93688',
  interior2: '1493809842364-78817add7ffb',
  interior3: '1449844908441-8829872d2607',
  interior4: '1600047509358-9dc75507daeb',
  interior5: '1600566753086-00f18fb6b3ea',
  commercial1: '1486406146926-c627a92ad1ab',
  commercial2: '1497366754035-f200968a6e72',
  commercial3: '1497366811353-6870744d04b2',
  agent1: '1500648767791-00dcc994a43e',
  agent2: '1494790108377-be9c29b29330',
  agent3: '1507003211169-0a1dd7228f2d',
  agent4: '1438761681033-6461ffad8d80',
  agent5: '1472099645785-5658abf4ff4e',
  agent6: '1544005313-94ddf0286df2',
}

const CATEGORIES = [
  {
    slug: 'houses',
    name_en: 'Houses',
    name_fa: 'خانه‌ها',
    desc_en: 'Family homes with private gardens and quiet streets.',
    desc_fa: 'خانه‌های خانوادگی با حیاط خصوصی و کوچه‌های آرام.',
    icon: 'home',
    image: img(PHOTO.house1, 1200),
  },
  {
    slug: 'apartments',
    name_en: 'Apartments',
    name_fa: 'آپارتمان‌ها',
    desc_en: 'City living with concierge services and skyline views.',
    desc_fa: 'زندگی شهری با خدمات کانیرج و نمای شهر.',
    icon: 'building',
    image: img(PHOTO.interior1, 1200),
  },
  {
    slug: 'villas',
    name_en: 'Luxury Villas',
    name_fa: 'ویلاهای لوکس',
    desc_en: 'Signature estates with pools, privacy and craftsmanship.',
    desc_fa: 'عمارت‌های خاص با استخر، حریم خصوصی و معماری ممتاز.',
    icon: 'crown',
    image: img(PHOTO.villa1, 1200),
  },
  {
    slug: 'commercial',
    name_en: 'Commercial',
    name_fa: 'تجاری',
    desc_en: 'Offices, retail and mixed-use investment assets.',
    desc_fa: 'دفاتر، خرده‌فروشی و دارایی‌های سرمایه‌گذاری چندمنظوره.',
    icon: 'briefcase',
    image: img(PHOTO.commercial1, 1200),
  },
  {
    slug: 'land',
    name_en: 'Land & Plots',
    name_fa: 'زمین و قطعات',
    desc_en: 'Build-ready plots in established, high-growth districts.',
    desc_fa: 'قطعات آماده ساخت در مناطق شناخته‌شده و رو به رشد.',
    icon: 'land',
    image: img(PHOTO.house3, 1200),
  },
]

const CITIES = [
  { slug: 'dubai', name_en: 'Dubai', name_fa: 'دبی', country_en: 'United Arab Emirates', country_fa: 'امارات متحده عربی', image: img(PHOTO.villa5, 1200), lat: 25.2048, lng: 55.2708,
    areas: [['Palm Jumeirah', 'پالم جمیرا'], ['Dubai Marina', 'مارینا دبی'], ['Downtown Dubai', 'مرکز دبی'], ['Emirates Hills', 'امارات هیلز'], ['Business Bay', 'بیزینس بی']] },
  { slug: 'lahore', name_en: 'Lahore', name_fa: 'لاهور', country_en: 'Pakistan', country_fa: 'پاکستان', image: img(PHOTO.house2, 1200), lat: 31.5204, lng: 74.3587,
    areas: [['DHA Phase 5', 'فاز ۵ دی‌اچ‌ای'], ['Gulberg', 'گلبرگ'], ['Bahria Town', 'بحریا تاون'], ['Model Town', 'مدل تاون'], ['Johar Town', 'جوهر تاون']] },
  { slug: 'karachi', name_en: 'Karachi', name_fa: 'کراچی', country_en: 'Pakistan', country_fa: 'پاکستان', image: img(PHOTO.house3, 1200), lat: 24.8607, lng: 67.0011,
    areas: [['Clifton', 'کلیفتون'], ['DHA Phase 8', 'فاز ۸ دی‌اچ‌ای'], ['Gulshan-e-Iqbal', 'گلشن اقبال']] },
  { slug: 'islamabad', name_en: 'Islamabad', name_fa: 'اسلام‌آباد', country_en: 'Pakistan', country_fa: 'پاکستان', image: img(PHOTO.house4, 1200), lat: 33.6844, lng: 73.0479,
    areas: [['F-7', 'اف ۷'], ['E-11', 'ای ۱۱'], ['Bahria Enclave', 'بحریا انکلیو'], ['DHA Phase 2', 'فاز ۲ دی‌اچ‌ای']] },
  { slug: 'abu-dhabi', name_en: 'Abu Dhabi', name_fa: 'ابوظبی', country_en: 'United Arab Emirates', country_fa: 'امارات متحده عربی', image: img(PHOTO.villa3, 1200), lat: 24.4539, lng: 54.3773,
    areas: [['Saadiyat Island', 'جزیره سعدیات'], ['Al Reem Island', 'جزیره ال‌ریم'], ['Khalifa City', 'شهر خلیفه']] },
  { slug: 'tehran', name_en: 'Tehran', name_fa: 'تهران', country_en: 'Iran', country_fa: 'ایران', image: img(PHOTO.commercial1, 1200), lat: 35.6892, lng: 51.389,
    areas: [['Zafaraniyeh', 'زعفرانیه'], ['Elahieh', 'الهیه'], ['Saadat Abad', 'سعادت‌آباد'], ['Tajrish', 'تجریش']] },
]

const AMENITIES = [
  ['pool', 'Swimming Pool', 'استخر شنا', 'waves'],
  ['garden', 'Garden', 'باغ و حیاط', 'trees'],
  ['parking', 'Parking', 'پارکینگ', 'car'],
  ['security', '24/7 Security', 'نگهبانی ۲۴ ساعته', 'shield'],
  ['elevator', 'Elevator', 'آسانسور', 'lift'],
  ['balcony', 'Balcony', 'بالکن', 'balcony'],
  ['ac', 'Air Conditioning', 'تهویه مطبوع', 'wind'],
  ['smart-home', 'Smart Home', 'خانه هوشمند', 'cpu'],
  ['gym', 'Gym', 'سالن ورزشی', 'dumbbell'],
  ['storage', 'Storage Room', 'انباری', 'box'],
]

const AGENTS = [
  {
    slug: 'sara-ahmadi', name_en: 'Sara Ahmadi', name_fa: 'سارا احمدی',
    title_en: 'Senior Property Advisor', title_fa: 'مشاور ارشد املاک',
    bio_en: 'Sara has guided more than 300 families through landmark purchases in Dubai and Tehran. She is known for patient, data-led advice and discreet handling of off-market listings.',
    bio_fa: 'سارا بیش از ۳۰۰ خانواده را در خریدهای شاخص دبی و تهران همراهی کرده است. او به مشاوره صبورانه و مبتنی بر داده و مدیریت محرمانه فهرست‌های خارج از بازار شناخته می‌شود.',
    phone: '+971 50 118 4420', email: 'sara@estatepro.dev', avatar: img(PHOTO.agent2, 600),
    languages: ['English', 'Persian', 'Arabic'], spec_en: 'Luxury Residential', spec_fa: 'مسکونی لوکس', experience: 11,
  },
  {
    slug: 'daniel-karimi', name_en: 'Daniel Karimi', name_fa: 'دنیل کریمی',
    title_en: 'Luxury Homes Specialist', title_fa: 'متخصص خانه‌های لوکس',
    bio_en: 'Daniel focuses on waterfront villas and branded residences. He negotiates with an architect’s eye for detail and a broker’s sense of timing.',
    bio_fa: 'دنیل بر ویلاهای ساحلی و اقامتگاه‌های برند تمرکز دارد. او با نگاه دقیق یک معمار و درک زمان‌بندی یک مشاور مذاکره می‌کند.',
    phone: '+971 50 764 2299', email: 'daniel@estatepro.dev', avatar: img(PHOTO.agent1, 600),
    languages: ['English', 'German'], spec_en: 'Waterfront Villas', spec_fa: 'ویلاهای ساحلی', experience: 9,
  },
  {
    slug: 'ayesha-malik', name_en: 'Ayesha Malik', name_fa: 'عایشه ملک',
    title_en: 'Residential Consultant', title_fa: 'مشاور مسکونی',
    bio_en: 'Ayesha covers Lahore and Islamabad, helping first-time buyers and returning families compare neighbourhoods with honest, side-by-side guidance.',
    bio_fa: 'عایشه در لاهور و اسلام‌آباد فعالیت می‌کند و به خریداران اولین خانه و خانواده‌های بازگشته کمک می‌کند محله‌ها را با راهنمایی صادقانه مقایسه کنند.',
    phone: '+92 300 442 8890', email: 'ayesha@estatepro.dev', avatar: img(PHOTO.agent3, 600),
    languages: ['English', 'Urdu', 'Punjabi'], spec_en: 'Family Homes', spec_fa: 'خانه‌های خانوادگی', experience: 7,
  },
  {
    slug: 'reza-tehrani', name_en: 'Reza Tehrani', name_fa: 'رضا تهرانی',
    title_en: 'Investment Advisor', title_fa: 'مشاور سرمایه‌گذاری',
    bio_en: 'Reza builds rental portfolios across northern Tehran and advises diaspora clients on currency-aware acquisitions.',
    bio_fa: 'رضا سبدهای اجاره‌ای در شمال تهران می‌سازد و به مشتریان خارج از کشور در خریدهای ارزآگاه مشاوره می‌دهد.',
    phone: '+98 912 884 5521', email: 'reza@estatepro.dev', avatar: img(PHOTO.agent5, 600),
    languages: ['Persian', 'English'], spec_en: 'Investment Property', spec_fa: 'املاک سرمایه‌گذاری', experience: 13,
  },
  {
    slug: 'omar-alfarsi', name_en: 'Omar Al Farsi', name_fa: 'عمر الفارسی',
    title_en: 'Commercial Leasing Lead', title_fa: 'مسئول اجاره تجاری',
    bio_en: 'Omar leases office floors and retail units across Business Bay and Blue Area, structuring terms that protect both landlord and tenant.',
    bio_fa: 'عمر طبقات اداری و واحدهای خرده‌فروشی در بیزینس بی و بلو ایریا را اجاره می‌دهد و شرایطی تنظیم می‌کند که منافع مالک و مستأجر را حفظ کند.',
    phone: '+971 55 902 1177', email: 'omar@estatepro.dev', avatar: img(PHOTO.agent6, 600),
    languages: ['Arabic', 'English'], spec_en: 'Commercial', spec_fa: 'تجاری', experience: 8,
  },
  {
    slug: 'niloofar-sadeghi', name_en: 'Niloofar Sadeghi', name_fa: 'نیلوفر صادقی',
    title_en: 'Client Relations Manager', title_fa: 'مدیر ارتباط با مشتریان',
    bio_en: 'Niloofar makes sure every viewing, document and handover happens on time, and stays in touch long after the keys are handed over.',
    bio_fa: 'نیلوفر مطمئن می‌شود هر بازدید، سند و تحویل به‌موقع انجام شود و پس از تحویل کلید نیز ارتباط را حفظ می‌کند.',
    phone: '+98 912 337 6604', email: 'niloofar@estatepro.dev', avatar: img(PHOTO.agent4, 600),
    languages: ['Persian', 'English', 'French'], spec_en: 'Client Care', spec_fa: 'تجربه مشتری', experience: 6,
  },
]

const P = (o) => o

const PROPERTIES = [
  P({
    slug: 'palm-jumeirah-signature-villa', category: 'villas', listing: 'sale',
    title_en: 'Signature Beachfront Villa on Palm Jumeirah',
    title_fa: 'ویلای ساحلی شاخص در پالم جمیرا',
    price: 18500000, currency: 'AED', city: 'dubai', neighborhood: 'Palm Jumeirah',
    address: 'Frond K, Palm Jumeirah, Dubai',
    beds: 6, baths: 7, area: 820, parking: 3, floor: 'Ground + 1', year: 2021,
    furnishing: 'furnished', featured: true, verified: true, agent: 'daniel-karimi',
    images: ['villa1', 'living1', 'villa3', 'living3'],
    amenities: ['pool', 'garden', 'parking', 'security', 'smart-home', 'ac', 'gym'],
    desc_en:
      'Set on a quiet frond of Palm Jumeirah, this six-bedroom villa pairs a 22-metre private beach frontage with interiors by a Milanese studio. Floor-to-ceiling glass frames the Dubai skyline across the water, while the double-height living room opens onto a shaded terrace and infinity pool.\n\nThe main suite occupies the entire upper level, with a dressing room, spa bathroom and private terrace. A landscaped garden, gym, staff quarters and a three-car garage complete the property. Viewings are by appointment and can be arranged at short notice.',
    desc_fa:
      'این ویلای شش‌خوابه در یکی از فرودهای آرام پالم جمیرا قرار دارد و ۲۲ متر ساحل خصوصی را با طراحی داخلی یک استودیوی میلانی ترکیب می‌کند. شیشه‌های سراسری، خط آسمان دبی را در آن سوی آب قاب می‌گیرند و نشیمن دو طبقه به تراس سایه‌دار و استخر بی‌نهایت باز می‌شود.\n\nسوئیت اصلی تمام طبقه بالا را در اختیار دارد؛ با اتاق لباس، حمام اسپا و تراس خصوصی. باغ طراحی‌شده، سالن ورزشی، اتاق خدمه و گاراژ سه‌ماشینه نیز بخشی از ملک هستند. بازدید با هماهنگی قبلی و در کوتاه‌ترین زمان ممکن انجام می‌شود.',
  }),
  P({
    slug: 'marina-sky-penthouse', category: 'apartments', listing: 'rent',
    title_en: 'Sky Penthouse with Marina Views',
    title_fa: 'پنت‌هاوس آسمانی با نمای مارینا',
    price: 45000, currency: 'AED', city: 'dubai', neighborhood: 'Dubai Marina',
    address: 'Marina Gate 2, Dubai Marina, Dubai',
    beds: 3, baths: 4, area: 310, parking: 2, floor: '48', year: 2019,
    furnishing: 'furnished', featured: true, verified: true, agent: 'sara-ahmadi',
    images: ['living2', 'interior1', 'living6', 'interior4'],
    amenities: ['pool', 'gym', 'balcony', 'security', 'elevator', 'ac', 'smart-home', 'parking'],
    desc_en:
      'A fully furnished penthouse on the 48th floor with wrap-around glazing, a private plunge pool and uninterrupted views of the marina and the sea beyond.\n\nThe apartment offers three en-suite bedrooms, a chef’s kitchen with integrated appliances, a study and a 40 m² entertaining terrace. Building amenities include a residents’ pool, gym, cinema and 24-hour concierge. Available unfurnished on request.',
    desc_fa:
      'پنت‌هاوسی مبله در طبقه ۴۸ با شیشه‌های سراسری، استخر کوچک خصوصی و نمای بی‌وقفه از مارینا و دریا.\n\nاین آپارتمان سه اتاق خواب با سرویس اختصاصی، آشپزخانه حرفه‌ای با لوازم داخلی، اتاق کار و تراسی ۴۰ متری برای پذیرایی دارد. امکانات ساختمان شامل استخر ساکنان، سالن ورزشی، سینما و کانیرج ۲۴ ساعته است. در صورت درخواست، بدون مبلمان نیز قابل اجاره است.',
  }),
  P({
    slug: 'emirates-hills-estate', category: 'villas', listing: 'sale',
    title_en: 'Contemporary Estate in Emirates Hills',
    title_fa: 'عمارت مدرن در امارات هیلز',
    price: 32000000, currency: 'AED', city: 'dubai', neighborhood: 'Emirates Hills',
    address: 'Sector E, Emirates Hills, Dubai',
    beds: 7, baths: 8, area: 1150, parking: 4, floor: 'Ground + 2', year: 2022,
    furnishing: 'semi', featured: true, verified: true, agent: 'daniel-karimi',
    images: ['villa4', 'living4', 'villa2', 'living5'],
    amenities: ['pool', 'garden', 'parking', 'security', 'smart-home', 'ac', 'gym', 'elevator', 'storage'],
    desc_en:
      'Overlooking the Montgomerie golf course, this newly completed estate spans three levels linked by a sculptural staircase and private lift. Travertine, walnut and bronze detail run throughout.\n\nSeven bedroom suites, a home cinema, wine room, spa with hammam, and a staff wing sit alongside a 25-metre pool and landscaped gardens. The property is offered with a full smart-home and security package.',
    desc_fa:
      'این عمارت تازه‌ساخت با نمای زمین گلف مونتگومری، سه طبقه را با پله‌ای مجسمه‌وار و آسانسور خصوصی به هم متصل می‌کند. سنگ تراورتن، چوب گردو و جزئیات برنزی در تمام فضاها به کار رفته است.\n\nهفت سوئیت خواب، سینمای خانگی، اتاق شراب، اسپا با حمام ترکی و بخش خدمه در کنار استخری ۲۵ متری و باغ‌های طراحی‌شده قرار دارند. ملک با بسته کامل خانه هوشمند و امنیتی ارائه می‌شود.',
  }),
  P({
    slug: 'downtown-boulevard-residence', category: 'apartments', listing: 'sale',
    title_en: 'Boulevard Residence Facing Burj Khalifa',
    title_fa: 'اقامتگاه بلوار با نمای برج خلیفه',
    price: 6200000, currency: 'AED', city: 'dubai', neighborhood: 'Downtown Dubai',
    address: 'Boulevard Central, Downtown Dubai',
    beds: 2, baths: 3, area: 168, parking: 1, floor: '31', year: 2017,
    furnishing: 'unfurnished', featured: false, verified: true, agent: 'sara-ahmadi',
    images: ['interior2', 'living1', 'interior5', 'living7'],
    amenities: ['pool', 'gym', 'balcony', 'security', 'elevator', 'ac', 'parking'],
    desc_en:
      'A bright two-bedroom residence with direct Burj Khalifa views and a balcony that catches the evening light. The open-plan living and dining area is finished in pale oak with stone worktops.\n\nThe building offers a rooftop pool, gym and 24-hour security, with Dubai Mall and the metro a short walk away. An ideal first purchase or rental investment in the city’s most liquid district.',
    desc_fa:
      'اقامتگاهی روشن با دو اتاق خواب، نمای مستقیم برج خلیفه و بالکنی که نور عصر را در خود می‌گیرد. نشیمن و غذاخوری یکپارچه با چوب بلوط روشن و سطوح سنگی اجرا شده است.\n\nساختمان استخر بام، سالن ورزشی و نگهبانی ۲۴ ساعته دارد و دبی مال و مترو در فاصله کوتاهی قرار دارند. گزینه‌ای مناسب برای اولین خرید یا سرمایه‌گذاری اجاره در پرگردش‌ترین منطقه شهر.',
  }),
  P({
    slug: 'dha-phase-5-modern-home', category: 'houses', listing: 'sale',
    title_en: 'Modern Family Home in DHA Phase 5',
    title_fa: 'خانه مدرن خانوادگی در فاز ۵ دی‌اچ‌ای',
    price: 185000000, currency: 'PKR', city: 'lahore', neighborhood: 'DHA Phase 5',
    address: 'Block Q, DHA Phase 5, Lahore',
    beds: 5, baths: 6, area: 465, parking: 2, floor: 'Ground + 1', year: 2020,
    furnishing: 'semi', featured: true, verified: true, agent: 'ayesha-malik',
    images: ['house1', 'living3', 'house2', 'interior3'],
    amenities: ['garden', 'parking', 'security', 'ac', 'storage', 'balcony'],
    desc_en:
      'A thoughtfully planned five-bedroom home on a quiet street in DHA Phase 5, five minutes from the main boulevard schools and market.\n\nThe ground floor holds a drawing room, family lounge, guest bedroom and an open kitchen with a breakfast bar. Upstairs, four bedrooms surround a shared lounge that opens to a rear terrace. Solar panels, a water filtration system and a fully fitted security camera network are already installed.',
    desc_fa:
      'خانه‌ای پنج‌خوابه با نقشه‌ای دقیق در کوچه‌ای آرام از فاز ۵ دی‌اچ‌ای، پنج دقیقه تا مدارس و بازار بلوار اصلی.\n\nطبقه همکف شامل اتاق پذیرایی، نشیمن خانوادگی، اتاق خواب مهمان و آشپزخانه‌ای باز با میز صبحانه است. در طبقه بالا چهار اتاق خواب گرد یک نشیمن مشترک قرار دارند که به تراس پشتی باز می‌شود. پنل‌های خورشیدی، سیستم تصفیه آب و شبکه کامل دوربین مداربسته نصب شده است.',
  }),
  P({
    slug: 'gulberg-executive-apartment', category: 'apartments', listing: 'rent',
    title_en: 'Executive Apartment in Gulberg',
    title_fa: 'آپارتمان اداری در گلبرگ',
    price: 350000, currency: 'PKR', city: 'lahore', neighborhood: 'Gulberg',
    address: 'Main Boulevard, Gulberg III, Lahore',
    beds: 3, baths: 3, area: 210, parking: 2, floor: '9', year: 2018,
    furnishing: 'furnished', featured: false, verified: true, agent: 'ayesha-malik',
    images: ['interior1', 'living6', 'interior4', 'living4'],
    amenities: ['gym', 'elevator', 'security', 'ac', 'parking', 'balcony', 'pool'],
    desc_en:
      'A serviced three-bedroom apartment in the heart of Gulberg, fully furnished and ready to move into. Rent includes building maintenance, backup power and weekly housekeeping.\n\nResidents share a rooftop pool, gym and residents’ lounge. Ideal for executives relocating to Lahore or families between homes.',
    desc_fa:
      'آپارتمان سه‌خوابه با خدمات کامل در قلب گلبرگ، کاملاً مبله و آماده سکونت. اجاره شامل هزینه‌های ساختمان، برق پشتیبان و نظافت هفتگی است.\n\nساکنان از استخر بام، سالن ورزشی و نشیمن مشترک استفاده می‌کنند. مناسب برای مدیرانی که به لاهور منتقل می‌شوند یا خانواده‌هایی که در حال جابه‌جایی هستند.',
  }),
  P({
    slug: 'bahria-town-corner-villa', category: 'villas', listing: 'sale',
    title_en: 'Corner Villa with Private Lawn in Bahria Town',
    title_fa: 'ویلای نبش با چمن خصوصی در بحریا تاون',
    price: 96000000, currency: 'PKR', city: 'lahore', neighborhood: 'Bahria Town',
    address: 'Sector C, Bahria Town, Lahore',
    beds: 4, baths: 5, area: 380, parking: 2, floor: 'Ground + 1', year: 2019,
    furnishing: 'unfurnished', featured: false, verified: false, agent: 'ayesha-malik',
    images: ['house3', 'living2', 'villa5', 'interior5'],
    amenities: ['garden', 'parking', 'security', 'ac', 'storage'],
    desc_en:
      'A corner plot villa with a wraparound lawn and a wide frontage that gives the home an unusually open feel. Four bedrooms, a formal drawing room and a separate family lounge.\n\nBahria Town offers gated security, parks, schools and a commercial strip within walking distance. The property is offered vacant and ready for a new owner’s finishing touches.',
    desc_fa:
      'ویلایی نبش با چمن دورتادور و نمای عریض که حس باز بودن فضا را دوچندان می‌کند. چهار اتاق خواب، اتاق پذیرایی رسمی و نشیمن خانوادگی مجزا.\n\nبحریا تاون با حراست دروازه‌ای، پارک‌ها، مدارس و نوار تجاری در فاصله پیاده‌روی خدمات ارائه می‌دهد. ملک خالی و آماده برای سلیقه مالک جدید تحویل داده می‌شود.',
  }),
  P({
    slug: 'clifton-sea-view-apartment', category: 'apartments', listing: 'rent',
    title_en: 'Sea-View Apartment in Clifton',
    title_fa: 'آپارتمان با نمای دریا در کلیفتون',
    price: 285000, currency: 'PKR', city: 'karachi', neighborhood: 'Clifton',
    address: 'Block 4, Clifton, Karachi',
    beds: 3, baths: 3, area: 195, parking: 1, floor: '12', year: 2016,
    furnishing: 'semi', featured: false, verified: true, agent: 'omar-alfarsi',
    images: ['interior3', 'living5', 'living7', 'interior2'],
    amenities: ['balcony', 'elevator', 'security', 'ac', 'parking'],
    desc_en:
      'South-facing apartment with an uninterrupted Arabian Sea view from the living room and both principal bedrooms. Generous balconies and cross ventilation keep the home cool through the summer.\n\nWalking distance to Clifton’s cafés, schools and the seafront promenade. Building includes standby generators and covered parking.',
    desc_fa:
      'آپارتمانی رو به جنوب با نمای بی‌وقفه دریای عرب از نشیمن و دو اتاق خواب اصلی. بالکن‌های وسیع و تهویه متقاطع، خانه را در تابستان خنک نگه می‌دارد.\n\nفاصله پیاده‌روی تا کافه‌ها، مدارس و بلوار ساحلی کلیفتون. ساختمان دارای ژنراتور اضطراری و پارکینگ سرپوشیده است.',
  }),
  P({
    slug: 'dha-phase-8-bungalow', category: 'houses', listing: 'sale',
    title_en: 'Architect-Designed Bungalow in DHA Phase 8',
    title_fa: 'بنگلوی طراحی‌شده معمار در فاز ۸ دی‌اچ‌ای',
    price: 142000000, currency: 'PKR', city: 'karachi', neighborhood: 'DHA Phase 8',
    address: 'Khayaban-e-Shamsheer, DHA Phase 8, Karachi',
    beds: 5, baths: 6, area: 500, parking: 2, floor: 'Ground + 1', year: 2021,
    furnishing: 'semi', featured: false, verified: true, agent: 'ayesha-malik',
    images: ['house4', 'living1', 'house1', 'interior4'],
    amenities: ['garden', 'parking', 'security', 'ac', 'smart-home', 'storage', 'balcony'],
    desc_en:
      'A 500 m² bungalow by a Karachi studio, arranged around a courtyard that brings daylight into every room. Double-height entrance, five bedrooms and a roof terrace set up for entertaining.\n\nMaterials are restrained and durable: polished concrete, local stone and teak joinery. Solar net-metering, a rainwater tank and a smart lighting system are in place.',
    desc_fa:
      'بنگلویی ۵۰۰ متری از یک استودیوی معماری کراچی که حول حیاطی مرکزی سازمان یافته تا نور روز به همه اتاق‌ها برسد. ورودی دو طبقه، پنج اتاق خواب و بام آماده پذیرایی.\n\nمصالح ساده و بادوام‌اند: بتن صیقلی، سنگ محلی و چوب تیک. کنتور خورشیدی، مخزن آب باران و سیستم روشنایی هوشمند نصب شده است.',
  }),
  P({
    slug: 'f7-garden-residence', category: 'houses', listing: 'sale',
    title_en: 'Garden Residence in F-7 Islamabad',
    title_fa: 'اقامتگاه باغ در اف ۷ اسلام‌آباد',
    price: 165000000, currency: 'PKR', city: 'islamabad', neighborhood: 'F-7',
    address: 'Street 22, F-7/2, Islamabad',
    beds: 5, baths: 5, area: 445, parking: 2, floor: 'Ground + 1', year: 2015,
    furnishing: 'unfurnished', featured: true, verified: true, agent: 'ayesha-malik',
    images: ['house2', 'living3', 'villa2', 'interior1'],
    amenities: ['garden', 'parking', 'security', 'ac', 'storage'],
    desc_en:
      'A classic F-7 home on a 500 sq. yd. plot, surrounded by mature trees and a walled garden that gives complete privacy from the street.\n\nLarge windows, high ceilings and a traditional layout with separate guest and family wings. Margalla Hills views from the upper terrace. A rare opportunity in one of Islamabad’s most established sectors.',
    desc_fa:
      'خانه‌ای کلاسیک در اف ۷ روی قطعه‌ای ۵۰۰ یاردی، احاطه‌شده با درختان کهن و باغی محصور که حریم خصوصی کامل ایجاد می‌کند.\n\nپنجره‌های بزرگ، سقف بلند و نقشه سنتی با بخش مجزای مهمان و خانواده. نمای تپه‌های مارگلا از تراس طبقه بالا. فرصتی کم‌نظیر در یکی از شناخته‌شده‌ترین محله‌های اسلام‌آباد.',
  }),
  P({
    slug: 'bahria-enclave-hills-villa', category: 'villas', listing: 'sale',
    title_en: 'Hillside Villa in Bahria Enclave',
    title_fa: 'ویلای دامنه‌ای در بحریا انکلیو',
    price: 78000000, currency: 'PKR', city: 'islamabad', neighborhood: 'Bahria Enclave',
    address: 'Sector B, Bahria Enclave, Islamabad',
    beds: 4, baths: 5, area: 390, parking: 2, floor: 'Ground + 1', year: 2020,
    furnishing: 'semi', featured: false, verified: false, agent: 'reza-tehrani',
    images: ['villa3', 'living4', 'house3', 'interior5'],
    amenities: ['garden', 'pool', 'parking', 'security', 'balcony', 'ac'],
    desc_en:
      'Positioned on a slope with a wide valley view, this villa is designed to feel part of the landscape. Glass walls on the garden level open fully to a pool terrace.\n\nFour en-suite bedrooms, a study, and a lower-level family room that could convert to a gym or guest suite. Five minutes from the Enclave’s main commercial area.',
    desc_fa:
      'این ویلا روی شیب زمین با نمای وسیع دره قرار گرفته و به‌گونه‌ای طراحی شده که بخشی از منظره به نظر برسد. دیوارهای شیشه‌ای طبقه باغ به‌طور کامل به تراس استخر باز می‌شوند.\n\nچهار اتاق خواب با سرویس اختصاصی، اتاق مطالعه و نشیمن طبقه پایین که می‌تواند به سالن ورزشی یا سوئیت مهمان تبدیل شود. پنج دقیقه تا منطقه تجاری اصلی انکلیو.',
  }),
  P({
    slug: 'saadiyat-beach-villa', category: 'villas', listing: 'sale',
    title_en: 'Beach Villa on Saadiyat Island',
    title_fa: 'ویلای ساحلی در جزیره سعدیات',
    price: 14500000, currency: 'AED', city: 'abu-dhabi', neighborhood: 'Saadiyat Island',
    address: 'Saadiyat Beach Villas, Abu Dhabi',
    beds: 5, baths: 6, area: 640, parking: 2, floor: 'Ground + 1', year: 2020,
    furnishing: 'unfurnished', featured: true, verified: true, agent: 'sara-ahmadi',
    images: ['villa5', 'living5', 'villa1', 'living2'],
    amenities: ['pool', 'garden', 'parking', 'security', 'ac', 'smart-home', 'gym'],
    desc_en:
      'A short walk from the protected turtle beach, this five-bedroom villa opens to a private pool deck and a lawn framed by palms.\n\nThe interior palette is warm and quiet, with natural stone floors and full-height sliding doors. Residents gain access to the community beach club, gym and tennis courts.',
    desc_fa:
      'این ویلای پنج‌خوابه در فاصله پیاده‌روی از ساحل حفاظت‌شده لاک‌پشت‌ها قرار دارد و به عرشه استخر خصوصی و چمنی محصور در نخل باز می‌شود.\n\nپالت داخلی گرم و آرام است، با کف سنگ طبیعی و درهای کشویی سراسری. ساکنان به باشگاه ساحلی، سالن ورزشی و زمین‌های تنیس محله دسترسی دارند.',
  }),
  P({
    slug: 'al-reem-island-apartment', category: 'apartments', listing: 'rent',
    title_en: 'Bright Apartment on Al Reem Island',
    title_fa: 'آپارتمان روشن در جزیره ال‌ریم',
    price: 120000, currency: 'AED', city: 'abu-dhabi', neighborhood: 'Al Reem Island',
    address: 'City of Lights, Al Reem Island, Abu Dhabi',
    beds: 2, baths: 2, area: 128, parking: 1, floor: '18', year: 2018,
    furnishing: 'unfurnished', featured: false, verified: true, agent: 'omar-alfarsi',
    images: ['living6', 'interior2', 'living7', 'interior3'],
    amenities: ['pool', 'gym', 'balcony', 'security', 'elevator', 'ac', 'parking'],
    desc_en:
      'Two bedrooms, two bathrooms and a wide balcony overlooking the mangroves — one of the quietest outlooks on Al Reem.\n\nThe tower includes a residents’ pool, gym, and covered parking, with shops and cafés at street level. Ten minutes to downtown Abu Dhabi.',
    desc_fa:
      'دو اتاق خواب، دو سرویس و بالکنی عریض با نمای حرا — یکی از آرام‌ترین چشم‌اندازهای ال‌ریم.\n\nبرج دارای استخر ساکنان، سالن ورزشی و پارکینگ سرپوشیده است و فروشگاه‌ها و کافه‌ها در طبقه همکف قرار دارند. ده دقیقه تا مرکز ابوظبی.',
  }),
  P({
    slug: 'zafaraniyeh-classic-apartment', category: 'apartments', listing: 'sale',
    title_en: 'Classic Apartment in Zafaraniyeh',
    title_fa: 'آپارتمان کلاسیک در زعفرانیه',
    price: 620000, currency: 'USD', city: 'tehran', neighborhood: 'Zafaraniyeh',
    address: 'Zafaraniyeh, Tehran',
    beds: 3, baths: 2, area: 185, parking: 2, floor: '4', year: 2014,
    furnishing: 'semi', featured: false, verified: true, agent: 'reza-tehrani',
    images: ['interior4', 'living1', 'interior1', 'living3'],
    amenities: ['elevator', 'parking', 'security', 'storage', 'balcony', 'ac'],
    desc_en:
      'A well-kept apartment in one of Tehran’s most sought-after neighbourhoods, with a generous living room, a separate dining space and two covered parking spaces.\n\nRenovated in 2023 with new oak flooring, a modern kitchen and updated wiring. Building has a lift, communal storage and a resident caretaker.',
    desc_fa:
      'آپارتمانی نگه‌داری‌شده در یکی از محبوب‌ترین محله‌های تهران، با نشیمنی وسیع، فضای غذاخوری مجزا و دو پارکینگ سرپوشیده.\n\nدر سال ۱۴۰۲ با کفپوش بلوط جدید، آشپزخانه مدرن و سیم‌کشی بازسازی شده است. ساختمان دارای آسانسور، انباری مشترک و سرایدار ساکن است.',
  }),
  P({
    slug: 'elahieh-garden-villa', category: 'villas', listing: 'sale',
    title_en: 'Garden Villa in Elahieh',
    title_fa: 'ویلای باغ در الهیه',
    price: 1450000, currency: 'USD', city: 'tehran', neighborhood: 'Elahieh',
    address: 'Elahieh, Tehran',
    beds: 5, baths: 4, area: 540, parking: 3, floor: 'Ground + 1', year: 2012,
    furnishing: 'unfurnished', featured: true, verified: true, agent: 'reza-tehrani',
    images: ['villa2', 'living4', 'house1', 'living5'],
    amenities: ['garden', 'pool', 'parking', 'security', 'smart-home', 'storage'],
    desc_en:
      'A rare garden villa in Elahieh with a 300 m² private plot, mature trees and a small pool. The house is arranged over two levels with a large family kitchen and a bright south-facing living room.\n\nOffered with vacant possession. Documentation is complete and the sale can proceed quickly for a ready buyer.',
    desc_fa:
      'ویلای باغی کم‌نظیر در الهیه با زمین خصوصی ۳۰۰ متری، درختان کهن و استخر کوچک. خانه در دو طبقه با آشپزخانه خانوادگی بزرگ و نشیمنی روشن رو به جنوب سازمان یافته است.\n\nبه‌صورت خالی تحویل داده می‌شود. مدارک کامل است و فرایند فروش برای خریدار آماده به‌سرعت انجام می‌شود.',
  }),
  P({
    slug: 'business-bay-office-suite', category: 'commercial', listing: 'rent',
    title_en: 'Fitted Office Suite in Business Bay',
    title_fa: 'دفتر آماده در بیزینس بی',
    price: 240000, currency: 'AED', city: 'dubai', neighborhood: 'Business Bay',
    address: 'Bay Square, Business Bay, Dubai',
    beds: 0, baths: 2, area: 260, parking: 3, floor: '14', year: 2017,
    furnishing: 'furnished', featured: false, verified: true, agent: 'omar-alfarsi',
    images: ['commercial2', 'commercial3', 'commercial1', 'interior5'],
    amenities: ['elevator', 'security', 'ac', 'parking', 'storage'],
    desc_en:
      'A fitted and partitioned office suite with 14 workstations, two meeting rooms and a reception area, available immediately on a three-year lease.\n\nRent is inclusive of service charges and three parking bays. The building offers 24-hour security, visitor parking and direct access to Sheikh Zayed Road.',
    desc_fa:
      'دفتری آماده و پارتیشن‌بندی‌شده با ۱۴ میز کار، دو اتاق جلسه و فضای پذیرش، قابل تحویل فوری با اجاره سه‌ساله.\n\nاجاره شامل هزینه‌های خدمات و سه جایگاه پارکینگ است. ساختمان دارای نگهبانی ۲۴ ساعته، پارکینگ مهمان و دسترسی مستقیم به جاده شیخ زاید است.',
  }),
  P({
    slug: 'blue-area-corporate-floor', category: 'commercial', listing: 'rent',
    title_en: 'Corporate Floor in Blue Area',
    title_fa: 'طبقه اداری در بلو ایریا',
    price: 1800000, currency: 'PKR', city: 'islamabad', neighborhood: 'F-7',
    address: 'Jinnah Avenue, Blue Area, Islamabad',
    beds: 0, baths: 4, area: 480, parking: 6, floor: '7', year: 2013,
    furnishing: 'semi', featured: false, verified: false, agent: 'omar-alfarsi',
    images: ['commercial3', 'commercial1', 'commercial2', 'interior2'],
    amenities: ['elevator', 'security', 'ac', 'parking', 'storage'],
    desc_en:
      'An entire floor on Jinnah Avenue with open-plan workspace, four washrooms, a server room and a boardroom facing the Margalla Hills.\n\nIdeal for a corporate head office or a professional practice. Backup power, lift access and six dedicated parking spaces included.',
    desc_fa:
      'یک طبقه کامل در خیابان جناح با فضای کار باز، چهار سرویس، اتاق سرور و اتاق هیئت‌مدیره با نمای تپه‌های مارگلا.\n\nمناسب برای دفتر مرکزی شرکت یا مؤسسه حرفه‌ای. برق پشتیبان، دسترسی آسانسور و شش پارکینگ اختصاصی شامل اجاره است.',
  }),
  P({
    slug: 'bahria-enclave-plot', category: 'land', listing: 'sale',
    title_en: 'Build-Ready Plot in Bahria Enclave',
    title_fa: 'قطعه آماده ساخت در بحریا انکلیو',
    price: 32000000, currency: 'PKR', city: 'islamabad', neighborhood: 'Bahria Enclave',
    address: 'Sector C, Bahria Enclave, Islamabad',
    beds: 0, baths: 0, area: 500, parking: 0, floor: null, year: null,
    furnishing: null, featured: false, verified: true, agent: 'reza-tehrani',
    images: ['house3', 'villa5', 'house2', 'house4'],
    amenities: ['security', 'garden'],
    desc_en:
      'A level, corner plot in Sector C with approved building plans for a two-storey residence. All utilities are connected at the boundary.\n\nClear title with immediate transfer. The sector has a completed road network, park and mosque, and is fifteen minutes from the Islamabad Expressway.',
    desc_fa:
      'قطعه‌ای نبش و مسطح در سکتور C با نقشه ساختمانی تأییدشده برای اقامتگاهی دو طبقه. تمام انشعابات در مرز زمین متصل است.\n\nسند تک‌برگ با انتقال فوری. سکتور دارای شبکه راه‌های تکمیل‌شده، پارک و مسجد است و پانزده دقیقه تا بزرگراه اسلام‌آباد فاصله دارد.',
  }),
]

const REVIEWS = [
  {
    name: 'Maryam Hosseini', name_fa: 'مریم حسینی', avatar: img(PHOTO.agent4, 300), rating: 5,
    body: 'We viewed eleven properties in four days and never felt rushed. The team knew every building’s service charges and honest resale history.',
    body_fa: 'چهار روز یازده ملک را دیدیم و هیچ‌وقت حس نکردیم عجله دارند. تیم از هزینه‌های ساختمان و سابقه واقعی فروش هر ملک آگاه بود.',
    property: 'palm-jumeirah-signature-villa',
  },
  {
    name: 'Bilal Ahmed', name_fa: 'بلال احمد', avatar: img(PHOTO.agent3, 300), rating: 5,
    body: 'They talked me out of a listing I loved because the paperwork was weak. That honesty earned a client for life.',
    body_fa: 'مرا از ملکی که خیلی دوست داشتم منصرف کردند چون مدارکش ضعیف بود. همین صداقت باعث شد مشتری همیشگی آن‌ها شوم.',
    property: 'dha-phase-5-modern-home',
  },
  {
    name: 'Elena Petrova', name_fa: 'النا پتروا', avatar: img(PHOTO.agent2, 300), rating: 5,
    body: 'Rented remotely from abroad. Every document was notarised and shared the same day, and the handover video was better than being there.',
    body_fa: 'از خارج از کشور به‌صورت دورکاری اجاره کردم. همه مدارک همان روز محضری و ارسال شد و ویدئوی تحویل از حضور حضوری بهتر بود.',
    property: 'marina-sky-penthouse',
  },
  {
    name: 'Ali Rezaei', name_fa: 'علی رضایی', avatar: img(PHOTO.agent5, 300), rating: 4,
    body: 'Negotiation saved us about 6% against asking. Communication in Persian and English made the whole process easy for my parents.',
    body_fa: 'مذاکره حدود ۶٪ از قیمت درخواستی را کم کرد. ارتباط به فارسی و انگلیسی کل فرایند را برای پدر و مادرم آسان کرد.',
    property: 'elahieh-garden-villa',
  },
  {
    name: 'Farah Siddiqui', name_fa: 'فرح صدیقی', avatar: img(PHOTO.agent6, 300), rating: 5,
    body: 'Sold our family home in nineteen days at a fair price. Weekly updates, no surprises, and a genuinely kind team.',
    body_fa: 'خانه خانوادگی‌مان در نوزده روز با قیمتی منصفانه فروش رفت. گزارش هفتگی، بدون غافلگیری و تیمی واقعاً مهربان.',
    property: 'f7-garden-residence',
  },
]

const DEVELOPMENTS = [
  {
    slug: 'marina-heights', name_en: 'Marina Heights', name_fa: 'مارینا هایتس', city: 'dubai',
    status_en: 'Under construction', status_fa: 'در حال ساخت', completion: 'Q4 2026',
    price_from: 2100000, currency: 'AED', image: img(PHOTO.villa1, 1200),
    desc_en: 'Forty-two storeys of one- and two-bedroom residences with a sky lounge above the marina.',
    desc_fa: 'چهل‌ودو طبقه واحدهای یک و دو خوابه با اسکای‌لانج بالای مارینا.',
  },
  {
    slug: 'margalla-terraces', name_en: 'Margalla Terraces', name_fa: 'تراس‌های مارگلا', city: 'islamabad',
    status_en: 'Ready to move', status_fa: 'آماده تحویل', completion: 'Completed 2025',
    price_from: 42000000, currency: 'PKR', image: img(PHOTO.house2, 1200),
    desc_en: 'Low-rise apartments terraced into the hillside, each with a private balcony facing the national park.',
    desc_fa: 'آپارتمان‌های کم‌ارتفاع پله‌ای در دامنه تپه، هرکدام با بالکن خصوصی رو به پارک ملی.',
  },
  {
    slug: 'saadiyat-grove', name_en: 'Saadiyat Grove', name_fa: 'بیشه سعدیات', city: 'abu-dhabi',
    status_en: 'Selling now', status_fa: 'در حال فروش', completion: 'Q2 2027',
    price_from: 3400000, currency: 'AED', image: img(PHOTO.villa4, 1200),
    desc_en: 'A garden-led community of villas and townhouses minutes from the cultural district.',
    desc_fa: 'جامعه‌ای باغ‌محور از ویلاها و خانه‌های شهری در دقایقی از منطقه فرهنگی.',
  },
  {
    slug: 'gulberg-quarter', name_en: 'Gulberg Quarter', name_fa: 'محله گلبرگ', city: 'lahore',
    status_en: 'Launching soon', status_fa: 'به‌زودی رونمایی', completion: '2028',
    price_from: 26000000, currency: 'PKR', image: img(PHOTO.interior1, 1200),
    desc_en: 'Mixed-use living above retail, with a residents’ courtyard and rooftop garden.',
    desc_fa: 'زندگی چندمنظوره بالای فضاهای تجاری، با حیاط ساکنان و باغ بام.',
  },
]

const SETTINGS = {
  siteName: 'EstatePro',
  tagline: 'Find Your Dream Property.',
  heroEyebrow: 'Discover Exceptional Living',
  heroEyebrowFa: 'کشف زندگی استثنایی',
  heroHeading: 'Find Your Dream Property',
  heroHeadingFa: 'خانه رؤیایی خود را پیدا کنید',
  heroHeadingAccent: 'Dream Property',
  heroHeadingAccentFa: 'رؤیایی',
  heroDescription:
    'Discover exceptional properties, explore premium locations, and find the perfect place to call home.',
  heroDescriptionFa:
    'املاک استثنایی را کشف کنید، موقعیت‌های ممتاز را ببینید و خانه‌ای بیابید که بتوانید خانه‌اش بنامید.',
  heroImage: img(PHOTO.villa1, 2400),
  heroAsideTitle: 'More Than Just Properties',
  heroAsideTitleFa: 'بیش از فقط یک ملک',
  heroAsideText: 'A better way of living — curated homes, verified documents, and advisors who answer.',
  heroAsideTextFa:
    'سبکی بهتر برای زندگی — خانه‌های منتخب، مدارک تأییدشده و مشاورانی که پاسخ می‌دهند.',
  whyImage: img(PHOTO.living3, 1600),
  whyHeading: 'Your Trusted Real Estate Partner',
  whyHeadingFa: 'شریک مطمئن شما در املاک',
  whyDescription:
    'Experience a smarter and more transparent way to discover, buy, and rent properties.',
  whyDescriptionFa:
    'روشی هوشمندانه‌تر و شفاف‌تر برای کشف، خرید و اجاره ملک را تجربه کنید.',
  stats: [
    { key: 'properties', value: 1240, suffix: '+', suffixFa: '+', labelEn: 'Properties Listed', labelFa: 'ملک ثبت‌شده' },
    { key: 'clients', value: 860, suffix: '+', suffixFa: '+', labelEn: 'Happy Clients', labelFa: 'مشتری راضی' },
    { key: 'rating', value: 4.9, suffix: '/5', suffixFa: '/۵', labelEn: 'Client Rating', labelFa: 'امتیاز مشتریان' },
    { key: 'experience', value: 14, suffix: 'yrs', suffixFa: 'سال', labelEn: 'Years of Experience', labelFa: 'سال تجربه' },
  ],
  contact: {
    phone: '+971 4 555 0192',
    whatsapp: '+971505551192',
    email: 'hello@estatepro.dev',
    address_en: 'Level 24, Boulevard Plaza Tower 1, Downtown Dubai',
    address_fa: 'طبقه ۲۴، برج بلوار پلازا ۱، مرکز دبی',
    hours_en: 'Sat–Thu, 9:00 – 19:00',
    hours_fa: 'شنبه تا پنجشنبه، ۹:۰۰ تا ۱۹:۰۰',
  },
  social: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    x: 'https://x.com',
  },
  defaultCurrency: 'AED',
  defaultLanguage: 'en',
  seo: {
    title: 'EstatePro — Find Your Dream Property',
    description:
      'EstatePro is a premium real estate marketplace for exceptional homes, villas and commercial property across Dubai, Pakistan and Tehran.',
    keywords: 'real estate, luxury villas, apartments, property for sale, property for rent',
  },
  sections: {
    categories: true,
    whyUs: true,
    featured: true,
    featuredHeading: 'Handpicked Properties For You',
    featuredHeadingFa: 'ملک‌هایی که برای شما انتخاب کرده‌ایم',
    featuredSubtitle: 'Explore our carefully selected collection of exceptional properties.',
    featuredSubtitleFa: 'مجموعه‌ای منتخب از املاک استثنایی را ببینید.',
    luxury: true,
    developments: true,
    locations: true,
    howItWorks: true,
    latest: true,
    testimonials: true,
    faq: true,
    newsletter: true,
    cta: true,
  },
  faq: [
    {
      q_en: 'How do I schedule a viewing?',
      q_fa: 'چگونه برای بازدید وقت بگیرم؟',
      a_en: 'Open any property page and use "Request a viewing". Your assigned advisor confirms within one business day, and you can also message them on WhatsApp directly.',
      a_fa: 'هر صفحه ملک را باز کنید و «درخواست بازدید» را بزنید. مشاور اختصاصی شما حداکثر تا یک روز کاری تأیید می‌کند و می‌توانید مستقیم در واتساپ هم پیام دهید.',
    },
    {
      q_en: 'Are the listings verified?',
      q_fa: 'آگهی‌ها تأیید شده‌اند؟',
      a_en: 'Every listing marked with a verification badge has had its title deed, ownership and asking price checked by our team. Unverified submissions stay clearly labelled until review completes.',
      a_fa: 'هر آگهی که نشان تأیید دارد، سند، مالکیت و قیمت درخواستی آن توسط تیم ما بررسی شده است. آگهی‌های در انتظار بررسی تا تکمیل ارزیابی، با برچسب مشخص نمایش داده می‌شوند.',
    },
    {
      q_en: 'What commission does EstatePro charge?',
      q_fa: 'کارمزد استیت‌پرو چقدر است؟',
      a_en: 'Two percent of the transaction value for sales, and one month’s rent for tenancies. Submission and listing are completely free for owners.',
      a_fa: 'دو درصد از ارزش معامله در فروش و معادل یک ماه اجاره در اجاره‌نامه‌ها. ثبت و انتشار آگهی برای مالکان کاملاً رایگان است.',
    },
    {
      q_en: 'Can I list my own property?',
      q_fa: 'می‌توانم ملک خودم را ثبت کنم؟',
      a_en: 'Yes. Create an account, open "Sell Property" and complete the seven-step wizard. Listings enter the review queue and go live once an administrator approves them.',
      a_fa: 'بله. حساب بسازید، «ثبت ملک» را باز کنید و فرم هفت‌مرحله‌ای را تکمیل کنید. آگهی به صف بررسی می‌رود و پس از تأیید مدیر منتشر می‌شود.',
    },
    {
      q_en: 'Do you handle international buyers?',
      q_fa: 'خریداران خارج از کشور را هم پشتیبانی می‌کنید؟',
      a_en: 'We do — remote viewings by video, notarised documentation and currency-aware payment planning are part of the standard service.',
      a_fa: 'بله — بازدید ویدئویی از راه دور، مدارک محضری و برنامه‌ریزی پرداخت با توجه به نرخ ارز بخشی از خدمات استاندارد ما است.',
    },
  ],
}

export async function seedDatabase() {
  /* ---------- users ---------- */
  const users = [
    { name: 'EstatePro Admin', email: 'admin@estatepro.dev', password: 'Admin1234', role: 'admin', avatar: img(PHOTO.agent5, 300) },
    { name: 'Sara Ahmadi', email: 'agent@estatepro.dev', password: 'Agent1234', role: 'agent', avatar: img(PHOTO.agent2, 300) },
    { name: 'Demo Buyer', email: 'demo@estatepro.dev', password: 'Demo1234', role: 'user', avatar: null },
  ]
  for (const u of users) {
    await query(
      `INSERT INTO users (name, email, password_hash, role, phone, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, hashPassword(u.password), u.role, '+971 50 000 0000', u.avatar],
    )
  }
  const agentUser = await one('SELECT id FROM users WHERE email = $1', ['agent@estatepro.dev'])
  const demoUser = await one('SELECT id FROM users WHERE email = $1', ['demo@estatepro.dev'])

  /* ---------- categories ---------- */
  const categoryIds = {}
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await one(
      `INSERT INTO categories (slug, name_en, name_fa, desc_en, desc_fa, icon, image, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_fa = EXCLUDED.name_fa
       RETURNING id`,
      [c.slug, c.name_en, c.name_fa, c.desc_en, c.desc_fa, c.icon, c.image, i],
    )
    categoryIds[c.slug] = row.id
  }

  /* ---------- cities & neighborhoods ---------- */
  const cityIds = {}
  for (const [i, c] of CITIES.entries()) {
    const row = await one(
      `INSERT INTO cities (slug, name_en, name_fa, country_en, country_fa, image, lat, lng, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_fa = EXCLUDED.name_fa
       RETURNING id`,
      [c.slug, c.name_en, c.name_fa, c.country_en, c.country_fa, c.image, c.lat, c.lng, i],
    )
    cityIds[c.slug] = row.id
    for (const [en, fa] of c.areas) {
      const existing = await one(
        'SELECT id FROM neighborhoods WHERE city_id = $1 AND name_en = $2',
        [row.id, en],
      )
      if (!existing) {
        await query('INSERT INTO neighborhoods (city_id, name_en, name_fa) VALUES ($1,$2,$3)', [
          row.id,
          en,
          fa,
        ])
      }
    }
  }

  /* ---------- amenities ---------- */
  const amenityIds = {}
  for (const [slug, en, fa, icon] of AMENITIES) {
    const row = await one(
      `INSERT INTO amenities (slug, name_en, name_fa, icon) VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en RETURNING id`,
      [slug, en, fa, icon],
    )
    amenityIds[slug] = row.id
  }

  /* ---------- agents ---------- */
  const agentIds = {}
  for (const a of AGENTS) {
    const row = await one(
      `INSERT INTO agents (slug, name_en, name_fa, title_en, title_fa, bio_en, bio_fa, phone, email,
                           avatar, languages, spec_en, spec_fa, experience, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en
       RETURNING id`,
      [
        a.slug, a.name_en, a.name_fa, a.title_en, a.title_fa, a.bio_en, a.bio_fa,
        a.phone, a.email, a.avatar, a.languages, a.spec_en, a.spec_fa, a.experience,
        a.slug === 'sara-ahmadi' ? agentUser?.id ?? null : null,
      ],
    )
    agentIds[a.slug] = row.id
  }

  /* ---------- properties ---------- */
  let ref = 1040
  for (const p of PROPERTIES) {
    ref += 7
    const created = new Date(Date.now() - ref * 36e5).toISOString()
    const row = await one(
      `INSERT INTO properties (
        reference, slug, title_en, title_fa, description_en, description_fa,
        category_id, listing_type, price, currency, city_id, neighborhood, address, lat, lng,
        bedrooms, bathrooms, area, parking, floor, year_built, furnishing, is_new,
        is_featured, is_verified, status, views, agent_id, owner_id, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
        $24,$25,$26,$27,$28,$29,$30,$30
      ) RETURNING id`,
      [
        `EP-${ref}`, p.slug, p.title_en, p.title_fa, p.desc_en, p.desc_fa,
        categoryIds[p.category], p.listing, p.price, p.currency, cityIds[p.city],
        p.neighborhood, p.address,
        CITIES.find((c) => c.slug === p.city)?.lat ?? null,
        CITIES.find((c) => c.slug === p.city)?.lng ?? null,
        p.beds, p.baths, p.area, p.parking, p.floor, p.year, p.furnishing, p.beds > 0 && p.year >= 2020,
        p.featured, p.verified, 'active',
        Math.floor(Math.random() * 900) + 120,
        agentIds[p.agent],
        p.slug === 'bahria-town-corner-villa' ? demoUser?.id ?? null : null,
        created,
      ],
    )

    let sort = 0
    for (const key of p.images) {
      await query(
        'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,$3,$4)',
        [row.id, img(PHOTO[key], 1400), sort, sort === 0],
      )
      sort += 1
    }
    for (const slug of p.amenities) {
      await query(
        'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [row.id, amenityIds[slug]],
      )
    }
  }

  /* ---------- one pending submission so the approval queue is not empty ---------- */
  const pending = {
    slug: 'downtown-art-deco-apartment',
    title_en: 'Art Deco Apartment near Opera District',
    title_fa: 'آپارتمان آرت‌دکو نزدیک منطقه اپرا',
    price: 3800000,
    desc_en:
      'A two-bedroom apartment with original art deco detailing, offered by the owner directly. Documents are attached and awaiting verification.',
    desc_fa:
      'آپارتمانی دوخوابه با جزئیات اصیل آرت‌دکو که به‌صورت مستقیم توسط مالک ارائه شده است. مدارک پیوست شده و در انتظار بررسی است.',
  }
  const pendingRow = await one(
    `INSERT INTO properties (
      reference, slug, title_en, title_fa, description_en, description_fa, category_id,
      listing_type, price, currency, city_id, neighborhood, address, bedrooms, bathrooms,
      area, parking, floor, year_built, furnishing, status, agent_id, owner_id
    ) VALUES ('EP-2001',$1,$2,$3,$4,$4,$5,'sale',$6,'AED',$7,'Downtown Dubai',
      'Opera District, Downtown Dubai',2,2,142,1,'11',2016,'semi','pending',$8,$9)
    RETURNING id`,
    [
      pending.slug, pending.title_en, pending.title_fa, pending.desc_en,
      categoryIds.apartments, pending.price, cityIds.dubai,
      agentIds['sara-ahmadi'], demoUser?.id ?? null,
    ],
  )
  await query(
    'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,0,true)',
    [pendingRow.id, img(PHOTO.living6, 1400)],
  )
  await query(
    `INSERT INTO property_amenities (property_id, amenity_id)
     VALUES ($1,$2), ($1,$3) ON CONFLICT DO NOTHING`,
    [pendingRow.id, amenityIds.elevator, amenityIds.ac],
  )

  /* ---------- reviews ---------- */
  for (const r of REVIEWS) {
    const prop = await one('SELECT id FROM properties WHERE slug = $1', [r.property])
    await query(
      `INSERT INTO reviews (name, avatar, rating, body, status, property_id)
       VALUES ($1,$2,$3,$4,'approved',$5)`,
      [r.name, r.avatar, r.rating, r.body, prop?.id ?? null],
    )
  }
  await query(
    `INSERT INTO reviews (name, avatar, rating, body, status)
     VALUES ($1,$2,5,$3,'pending')`,
    [
      'Hamza Qureshi',
      img(PHOTO.agent1, 300),
      'Viewing was organised within a day and the advisor knew the building’s maintenance history in detail. Waiting for the review of my experience to be published.',
    ],
  )

  /* ---------- developments ---------- */
  for (const d of DEVELOPMENTS) {
    await query(
      `INSERT INTO developments (slug, name_en, name_fa, city_id, image, status_en, status_fa,
                                 completion, price_from, currency, desc_en, desc_fa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO NOTHING`,
      [
        d.slug, d.name_en, d.name_fa, cityIds[d.city], d.image, d.status_en, d.status_fa,
        d.completion, d.price_from, d.currency, d.desc_en, d.desc_fa,
      ],
    )
  }

  /* ---------- favorites for the demo user ---------- */
  if (demoUser) {
    const favs = ['palm-jumeirah-signature-villa', 'marina-sky-penthouse', 'saadiyat-beach-villa']
    for (const slug of favs) {
      const p = await one('SELECT id FROM properties WHERE slug = $1', [slug])
      if (p) {
        await query(
          'INSERT INTO favorites (user_id, property_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [demoUser.id, p.id],
        )
      }
    }
  }

  /* ---------- inquiries ---------- */
  const inquiryProp = await one('SELECT id, agent_id FROM properties WHERE slug = $1', [
    'marina-sky-penthouse',
  ])
  if (inquiryProp) {
    await query(
      `INSERT INTO inquiries (kind, property_id, agent_id, user_id, name, email, phone, subject, message, status)
       VALUES ('property',$1,$2,$3,'Demo Buyer','demo@estatepro.dev','+971 50 111 2233',
               'Viewing request','Hello, I would like to view this apartment this weekend if possible.',
               'new')`,
      [inquiryProp.id, inquiryProp.agent_id, demoUser?.id ?? null],
    )
  }
  await query(
    `INSERT INTO inquiries (kind, name, email, phone, subject, message, status)
     VALUES ('contact','Nadia Rahimi','nadia@example.com','+98 912 000 0000',
             'International purchase','I am based in Tehran and interested in buying a villa in Dubai. Can you explain the process?',
             'new')`,
  )

  /* ---------- settings ---------- */
  const existing = await one('SELECT id FROM site_settings WHERE id = 1')
  if (!existing) {
    await query('INSERT INTO site_settings (id, data) VALUES (1, $1)', [JSON.stringify(SETTINGS)])
  }

  /* ---------- newsletter ---------- */
  await query(
    `INSERT INTO newsletter_subscribers (email) VALUES ('early@example.com') ON CONFLICT DO NOTHING`,
  )

  /* ---------- search analytics sample ---------- */
  const hotCities = ['dubai', 'lahore', 'dubai', 'tehran', 'dubai', 'islamabad', 'lahore']
  for (const city of hotCities) {
    await query('INSERT INTO search_events (city) VALUES ($1)', [city])
  }

  console.log('[seed] demo content created')
}
