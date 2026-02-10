// Travel Planner JavaScript Application
class TravelPlanner {
    constructor() {
        this.destinations = [
            {
                id: 1,
                name: "Paris, France",
                description: "The City of Light with iconic landmarks and romantic atmosphere",
                price: "$1,500",
                rating: 4.8,
                image: "https://picsum.photos/seed/paris/400/300"
            },
            {
                id: 2,
                name: "Tokyo, Japan",
                description: "Modern metropolis blending tradition with cutting-edge technology",
                price: "$2,000",
                rating: 4.9,
                image: "https://picsum.photos/seed/tokyo/400/300"
            },
            {
                id: 3,
                name: "Bali, Indonesia",
                description: "Tropical paradise with beautiful beaches and rich culture",
                price: "$1,200",
                rating: 4.7,
                image: "https://picsum.photos/seed/bali/400/300"
            },
            {
                id: 4,
                name: "New York, USA",
                description: "The city that never sleeps with endless attractions",
                price: "$1,800",
                rating: 4.6,
                image: "https://picsum.photos/seed/newyork/400/300"
            },
            {
                id: 5,
                name: "Rome, Italy",
                description: "Ancient history meets vibrant modern life",
                price: "$1,400",
                rating: 4.8,
                image: "https://picsum.photos/seed/rome/400/300"
            },
            {
                id: 6,
                name: "Dubai, UAE",
                description: "Luxurious destination with stunning architecture",
                price: "$2,500",
                rating: 4.5,
                image: "https://picsum.photos/seed/dubai/400/300"
            }
        ];

        this.itinerary = [];
        this.budget = {
            total: 0,
            expenses: []
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDestinations();
        this.loadFromLocalStorage();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.getAttribute('href'));
            });
        });

        // Mobile menu toggle
        document.querySelector('.nav-toggle').addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('destinationSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Itinerary functionality
        document.getElementById('addDayBtn').addEventListener('click', () => {
            this.addItineraryDay();
        });

        // Budget functionality
        document.getElementById('totalBudget').addEventListener('input', (e) => {
            this.updateBudget(parseFloat(e.target.value) || 0);
        });

        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            this.addExpense();
        });
    }

    handleNavigation(target) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="${target}"]`).classList.add('active');

        // Smooth scroll to section
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }

        // Close mobile menu
        document.querySelector('.nav-menu').classList.remove('active');
    }

    handleSearch() {
        const searchTerm = document.getElementById('destinationSearch').value.toLowerCase();
        const filteredDestinations = this.destinations.filter(dest => 
            dest.name.toLowerCase().includes(searchTerm) || 
            dest.description.toLowerCase().includes(searchTerm)
        );
        this.renderDestinations(filteredDestinations);
    }

    renderDestinations(destinationsToRender = this.destinations) {
        const grid = document.getElementById('destinationGrid');
        grid.innerHTML = '';

        destinationsToRender.forEach(destination => {
            const card = document.createElement('div');
            card.className = 'destination-card';
            card.innerHTML = `
                <img src="${destination.image}" alt="${destination.name}" class="destination-image">
                <div class="destination-info">
                    <h3 class="destination-name">${destination.name}</h3>
                    <p class="destination-description">${destination.description}</p>
                    <div class="destination-details">
                        <span class="destination-price">${destination.price}</span>
                        <div class="destination-rating">
                            ${this.renderStars(destination.rating)}
                            <span>${destination.rating}</span>
                        </div>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.selectDestination(destination));
            grid.appendChild(card);
        });
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star"></i>';
        }

        return stars;
    }

    selectDestination(destination) {
        // Add to itinerary or show details
        const tripName = document.getElementById('tripName').value || 'My Trip';
        if (!this.itinerary.length) {
            this.addItineraryDay();
        }
        
        // Show notification
        this.showNotification(`${destination.name} added to your trip!`);
    }

    addItineraryDay() {
        const dayNumber = this.itinerary.length + 1;
        const day = {
            id: Date.now(),
            dayNumber: dayNumber,
            activities: []
        };

        this.itinerary.push(day);
        this.renderItinerary();
        this.saveToLocalStorage();
    }

    renderItinerary() {
        const container = document.getElementById('itineraryDays');
        container.innerHTML = '';

        this.itinerary.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.innerHTML = `
                <div class="day-header">
                    <h3 class="day-title">Day ${day.dayNumber}</h3>
                    <button class="btn btn-danger" onclick="travelPlanner.removeDay(${day.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <ul class="day-activities" id="activities-${day.id}">
                    ${day.activities.map(activity => `
                        <li>
                            <span>${activity.time} - ${activity.description}</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="btn btn-secondary" onclick="travelPlanner.addActivity(${day.id})">
                    <i class="fas fa-plus"></i> Add Activity
                </button>
            `;
            container.appendChild(dayCard);
        });
    }

    addActivity(dayId) {
        const time = prompt('Enter time (e.g., 9:00 AM):');
        const description = prompt('Enter activity description:');

        if (time && description) {
            const day = this.itinerary.find(d => d.id === dayId);
            if (day) {
                day.activities.push({ time, description });
                this.renderItinerary();
                this.saveToLocalStorage();
            }
        }
    }

    removeDay(dayId) {
        this.itinerary = this.itinerary.filter(day => day.id !== dayId);
        // Renumber days
        this.itinerary.forEach((day, index) => {
            day.dayNumber = index + 1;
        });
        this.renderItinerary();
        this.saveToLocalStorage();
    }

    updateBudget(total) {
        this.budget.total = total;
        this.renderBudget();
        this.saveToLocalStorage();
    }

    addExpense() {
        const name = prompt('Enter expense name:');
        const amount = parseFloat(prompt('Enter amount:'));
        const category = prompt('Enter category (e.g., Food, Transport, Accommodation):');

        if (name && amount && category) {
            const expense = {
                id: Date.now(),
                name,
                amount,
                category
            };

            this.budget.expenses.push(expense);
            this.renderBudget();
            this.saveToLocalStorage();
            this.showNotification('Expense added successfully!');
        }
    }

    renderBudget() {
        const totalSpent = this.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = this.budget.total - totalSpent;

        document.getElementById('totalBudgetDisplay').textContent = `$${this.budget.total.toFixed(2)}`;
        document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
        document.getElementById('totalRemaining').textContent = `$${remaining.toFixed(2)}`;

        // Update remaining amount color
        const remainingElement = document.getElementById('totalRemaining');
        if (remaining < 0) {
            remainingElement.style.color = '#ef4444';
        } else if (remaining < this.budget.total * 0.2) {
            remainingElement.style.color = '#f59e0b';
        } else {
            remainingElement.style.color = 'var(--secondary-color)';
        }

        // Render expense list
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = '';

        this.budget.expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <div>
                    <div class="expense-name">${expense.name}</div>
                    <span class="expense-category">${expense.category}</span>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            `;
            expenseList.appendChild(expenseItem);
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveToLocalStorage() {
        localStorage.setItem('travelPlannerData', JSON.stringify({
            itinerary: this.itinerary,
            budget: this.budget
        }));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('travelPlannerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.itinerary = data.itinerary || [];
            this.budget = data.budget || { total: 0, expenses: [] };
            
            this.renderItinerary();
            this.renderBudget();
            
            // Update budget input
            if (this.budget.total > 0) {
                document.getElementById('totalBudget').value = this.budget.total;
            }
        }
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
const travelPlanner = new TravelPlanner();
