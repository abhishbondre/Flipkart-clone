document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Get product data from products.json
    fetch('../products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === parseInt(productId));
            if (product) {
                displayProduct(product);
                initializePriceChart(product);
            } else {
                console.error('Product not found');
            }
        })
        .catch(error => console.error('Error loading product:', error));

    // Display product details
    function displayProduct(product) {
        // Set main image
        const mainImage = document.getElementById('main-product-image');
        let imagePath = product.image;
        if (!/^\.\./.test(imagePath) && !/^https?:/.test(imagePath)) {
            imagePath = '../' + imagePath;
        }
        mainImage.src = imagePath;
        mainImage.alt = product.name;

        // Set product title
        document.getElementById('product-title').textContent = product.name;

        // Set rating
        const ratingStars = document.querySelector('.rating-stars');
        ratingStars.innerHTML = Array(5)
            .fill()
            .map((_, i) => 
                `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : '-half-alt'}"></i>`
            )
            .join('');
        document.querySelector('.rating-count').textContent = `(${product.ratingCount} ratings)`;

        // Set price
        document.querySelector('.current-price').textContent = `₹${product.price.toLocaleString()}`;
        document.querySelector('.original-price').textContent = `₹${product.originalPrice.toLocaleString()}`;
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        document.querySelector('.discount').textContent = `${discount}% off`;

        // Set specifications
        const specsTable = document.querySelector('.specs-table');
        specsTable.innerHTML = Object.entries(product.specifications)
            .map(([key, value]) => `
                <div class="specs-row">
                    <div class="specs-label">${key}</div>
                    <div class="specs-value">${value}</div>
                </div>
            `)
            .join('');

        // Add to cart functionality
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            flyToCartAnimation(addToCartBtn);
        });

        // Buy now functionality
        const buyNowBtn = document.querySelector('.buy-now-btn');
        buyNowBtn.addEventListener('click', () => {
            addToCart(product);
            // In a real implementation, this would redirect to checkout
            alert('Proceeding to checkout...');
        });
    }

    // Initialize price chart
    function initializePriceChart(product) {
        const ctx = document.getElementById('price-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: product.priceHistory.map(entry => entry.date),
                datasets: [{
                    label: 'Price History',
                    data: product.priceHistory.map(entry => entry.price),
                    borderColor: '#2874f0',
                    backgroundColor: 'rgba(40, 116, 240, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: value => `₹${value.toLocaleString()}`
                        }
                    }
                }
            }
        });
    }

    // Cart functionality
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartCount = document.getElementById('cart-count');
    const sidebarCartCount = document.getElementById('sidebar-cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCart() {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        sidebarCartCount.textContent = totalItems;

        // Update cart items
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty!</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image.startsWith('..') || item.image.startsWith('http') ? item.image : '../' + item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="price">₹${item.price.toLocaleString()}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                            <span class="item-qty">${item.quantity}</span>
                            <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const isIncrease = e.target.classList.contains('increase-qty');
                    changeQuantity(id, isIncrease ? 1 : -1);
                });
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    removeItem(id);
                });
            });
        }

        // Update total price
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = `₹${totalPrice.toLocaleString()}`;

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    }

    function changeQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== id);
            }
            updateCart();
        }
    }

    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    // Toggle cart sidebar
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.toggle('open');
    });

    cartCloseBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    // Initialize cart
    updateCart();

    // --- New Features Popup Functionality ---
    const newFeaturesBtn = document.getElementById('new-features-btn');
    const newFeaturesPopup = document.getElementById('new-features-popup');
    const newFeaturesClose = document.getElementById('new-features-close');

    function toggleNewFeaturesPopup() {
        newFeaturesPopup.classList.toggle('active');
        document.body.classList.toggle('blur-background');
    }

    if (newFeaturesBtn) {
        newFeaturesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleNewFeaturesPopup();
        });
    }
    if (newFeaturesClose) {
        newFeaturesClose.addEventListener('click', toggleNewFeaturesPopup);
    }
    if (newFeaturesPopup) {
        newFeaturesPopup.addEventListener('click', (e) => {
            if (e.target === newFeaturesPopup) {
                toggleNewFeaturesPopup();
            }
        });
    }

    // --- AI Search Popup Functionality ---
    const aiSearchPopup = document.getElementById('ai-search-popup');
    const aiSearchClose = document.getElementById('ai-search-close');
    const aiSearchInput = document.getElementById('ai-search-input');
    let lastShiftPress = 0;
    let shiftCount = 0;

    function toggleAISearchPopup() {
        const isActive = aiSearchPopup.classList.toggle('active');
        if (isActive) {
            aiSearchInput?.focus();
            document.body.classList.add('blur-background');
        } else {
            document.body.classList.remove('blur-background');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            const now = Date.now();
            if (now - lastShiftPress < 500) {
                shiftCount++;
                if (shiftCount === 2) {
                    toggleAISearchPopup();
                    shiftCount = 0;
                }
            } else {
                shiftCount = 1;
            }
            lastShiftPress = now;
        } else {
            shiftCount = 0;
        }
    });

    if (aiSearchClose) {
        aiSearchClose.addEventListener('click', toggleAISearchPopup);
    }
    if (aiSearchPopup) {
        aiSearchPopup.addEventListener('click', (e) => {
            if (e.target === aiSearchPopup) {
                toggleAISearchPopup();
            }
        });
    }
    if (aiSearchInput) {
        aiSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = aiSearchInput.value.trim();
                if (query) {
                    console.log('AI Searching for:', query);
                    const resultsContainer = aiSearchPopup.querySelector('.ai-search-results');
                    if (resultsContainer) {
                        resultsContainer.innerHTML = `<p>Simulating AI search results for: "${query}"...</p>`;
                    }
                }
            }
        });
    }
}); 