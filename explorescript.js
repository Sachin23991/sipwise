const companies = [
    {
        id: 1,
        name: "Coca-Cola Company",
        origin: "US-based",
        logo: "images/cocacola.png",
        brands: [
            { name: "Coca-Cola", image: "images/coco.png", launchYear: 1993, metricName: "Brand Value", metricValue: "$58.5 Billion" },
            { name: "Thums Up", image: "images/thumsup.png", launchYear: 1977, metricName: "Status", metricValue: "$1 Billion+ Brand" },
            { name: "Sprite", image: "images/sprite.png", launchYear: 1998, metricName: "Status", metricValue: "$1 Billion+ Brand" },
            { name: "Fanta", image: "images/fanta.png", launchYear: 1993, metricName: "Global Sales", metricValue: "2 Billion+ Cases" },
            { name: "Limca", image: "images/limca.png", launchYear: 1977, metricName: "Market", metricValue: "Top 3 Soda" },
            { name: "Maaza", image: "images/maaza.png", launchYear: 1976, metricName: "Market Share", metricValue: "Over 40% (Juice)" },
        ]
    },
    {
        id: 2,
        name: "PepsiCo",
        origin: "US-based",
        logo: "images/pepsi.png",
        brands: [
            { name: "Pepsi", image: "images/pepsican.png", launchYear: 1989, metricName: "Brand Value", metricValue: "$20.7 Billion" },
            { name: "Mountain Dew", image: "images/mountaindew.png", launchYear: 2003, metricName: "Parent Revenue", metricValue: "$91+ Billion" },
            { name: "Mirinda", image: "images/mirinda.png", launchYear: 1990, metricName: "Availability", metricValue: "200+ Countries" },
            { name: "7Up", image: "images/7up.png", launchYear: 1990, metricName: "Parent Company", metricValue: "PepsiCo India" },
            { name: "Slice", image: "images/slice.png", launchYear: 1993, metricName: "Category", metricValue: "Fruit Drink" },
            { name: "Tropicana", image: "images/tropicana.png", launchYear: 2004, metricName: "Global Sales", metricValue: "$6+ Billion" }
        ]
    },
    {
        id: 3,
        name: "Parle Agro",
        origin: "Indian Company",
        logo: "images/parle.png",
        brands: [
            { name: "Frooti", image: "images/frooti.png", launchYear: 1985, metricName: "Market Share", metricValue: "25.6% (Mango)" },
            { name: "Appy Fizz", image: "images/appyfizz.png", launchYear: 2005, metricName: "Company Worth", metricValue: "₹8000+ Crore" },
            { name: "Appy", image: "images/appy.png", launchYear: 1986, metricName: "Category", metricValue: "Apple Juice" },
            { name: "B Fizz", image: "images/bfizz.png", launchYear: 2020, metricName: "Parent Company", metricValue: "Parle Agro" },
            { name: "Smoodh", image: "images/smoodh.png", launchYear: 2021, metricName: "Launch Sales", metricValue: "₹165 Crore" }
        ]
    },
    {
        id: 4,
        name: "Dabur",
        origin: "Indian Company",
        logo: "images/dabur.png",
        brands: [
            { name: "Real Juices", image: "images/realjuice.png", launchYear: 1997, metricName: "Market Share", metricValue: "50%+ (Juice)" },
            { name: "Real Activ", image: "images/realactiv.png", launchYear: 2007, metricName: "Focus", metricValue: "Health & Wellness" }
        ]
    },
    {
        id: 6,
        name: "Hector Beverages",
        origin: "Indian Company",
        logo: "images/paperboat.png",
        brands: [
            { name: "Aam Panna", image: "images/aampanna.png", launchYear: 2013, metricName: "Parent Company", metricValue: "Paper Boat" },
            { name: "Jaljeera", image: "images/jaljeera.png", launchYear: 2013, metricName: "Focus", metricValue: "Ethnic Drinks" }
        ]
    },
];

// --- DOM Elements ---
const body = document.body;
const container = document.querySelector('.container');
const companiesPage = document.getElementById('companies-page');
const brandsPage = document.getElementById('brands-page');
const carousel = brandsPage.querySelector('.carousel');
const listHTML = brandsPage.querySelector('.carousel .list');
const nextButton = brandsPage.querySelector('#next');
const prevButton = brandsPage.querySelector('#prev');
const backButton = brandsPage.querySelector('#back');


// --- Page Switching Logic with Animations ---
function showCompaniesPage() {
    brandsPage.classList.add('is-hiding');
    setTimeout(() => {
        body.classList.remove('show-brands');
        brandsPage.classList.remove('is-hiding');
        container.classList.add('is-showing');
    }, 500);
}

function showBrandsPage(company) {
    container.classList.add('is-hiding');
    setTimeout(() => {
        listHTML.innerHTML = '';
        company.brands.forEach(brand => {
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <img src="${brand.image}" alt="${brand.name}">
                <div class="introduce">
                    <div class="title">${company.name}</div>
                    <div class="topic">${brand.name}</div>
                    <div class="specifications">
                        <div>
                            <p>Launch Year (India)</p>
                            <p>${brand.launchYear || 'N/A'}</p>
                        </div>
                        <div>
                            <p>${brand.metricName || 'Fact'}</p>
                            <p>${brand.metricValue || 'A refreshing choice.'}</p>
                        </div>
                    </div>
                </div>
            `;
            listHTML.appendChild(item);
        });

        body.classList.add('show-brands');
        container.classList.remove('is-hiding');
        brandsPage.classList.add('is-showing');

        setTimeout(() => brandsPage.classList.remove('is-showing'), 500);
    }, 500);
}


// --- Carousel Slider Logic ---
let unAcceptClick;
function showSlider(type) {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';
    carousel.classList.remove('next', 'prev');
    let items = document.querySelectorAll('.carousel .list .item');
    if (type === 'next') {
        if (items.length > 1) {
            listHTML.appendChild(items[0]);
            carousel.classList.add('next');
        }
    } else {
        if (items.length > 1) {
            listHTML.prepend(items[items.length - 1]);
            carousel.classList.add('prev');
        }
    }
    clearTimeout(unAcceptClick);
    unAcceptClick = setTimeout(() => {
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 1200);
}


// --- 3D Card Interaction Logic ---
function add3dCardInteraction() {
    const cards = document.querySelectorAll('.company-card');
    cards.forEach(card => {
        const intensity = 15;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const midCardX = rect.width / 2;
            const midCardY = rect.height / 2;
            const rotateY = ((x - midCardX) / midCardX) * intensity;
            const rotateX = ((y - midCardY) / midCardY) * -intensity;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
}


// --- Initial Page Setup & Event Listeners ---
function initialize() {
    companiesPage.innerHTML = '';
    companies.forEach((company) => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';
        companyCard.innerHTML = `
            <img src="${company.logo}" alt="${company.name}" class="company-logo">
            <div class="company-info">
                <h3 class="company-name">${company.name}</h3>
                <p class="company-origin">${company.origin}</p>
            </div>
        `;
        companyCard.addEventListener('click', () => showBrandsPage(company));
        companiesPage.appendChild(companyCard);
    });

    add3dCardInteraction();

    nextButton.addEventListener('click', () => showSlider('next'));
    prevButton.addEventListener('click', () => showSlider('prev'));
    backButton.addEventListener('click', showCompaniesPage);
}

// Start the application
initialize();