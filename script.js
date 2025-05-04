document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const loginBtn = document.getElementById('user-account-btn');
    const loginPopup = document.getElementById('login-popup');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartCountSpan = document.getElementById('cart-count');
    const sidebarCartCountSpan = document.getElementById('sidebar-cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const cartSummary = document.getElementById('cart-summary'); // Footer with total/button
    const emptyCartFooterMessage = document.getElementById('empty-cart-footer-message'); // Message shown when cart empty

    // Search Elements
    const searchInput = document.getElementById('search-input');
    const micSearchBtn = document.getElementById('mic-search-btn');
    const imageSearchBtn = document.getElementById('image-search-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    const scribbleSearchBtn = document.getElementById('scribble-search-btn');
    const scribblePad = document.getElementById('scribble-pad');
    const scribbleCanvas = document.getElementById('scribble-canvas');
    const clearScribbleBtn = document.getElementById('clear-scribble-btn');
    const searchScribbleBtn = document.getElementById('search-scribble-btn');
    const closeScribbleBtn = document.getElementById('close-scribble-btn');

    // AI Search Popup
    const aiSearchPopup = document.getElementById('ai-search-popup');
    const aiSearchClose = document.getElementById('ai-search-close');
    const aiSearchInput = document.getElementById('ai-search-input');
    let lastShiftPress = 0;
    let shiftCount = 0;

    // New Features Popup
    const newFeaturesBtn = document.getElementById('new-features-btn');
    const newFeaturesPopup = document.getElementById('new-features-popup');
    const newFeaturesClose = document.getElementById('new-features-close');

    // Mode Toggles & Sections
    const normalModeBtn = document.getElementById('normal-mode-btn');
    const reelModeBtn = document.getElementById('reel-mode-btn');
    const mysteryModeBtn = document.getElementById('mystery-mode-btn');
    const normalModeSection = document.getElementById('normal-mode-section');
    const reelModeSection = document.getElementById('reel-mode-section');
    const mysteryModeSection = document.getElementById('mystery-mode-section');
    const heroBannerSection = document.getElementById('hero-banner-section'); // Banner container
    const productGrid = document.getElementById('product-grid'); // Normal mode grid
    const reelContainer = document.getElementById('reel-container'); // Reel mode content area

    // Banner Elements
    const bannerImages = heroBannerSection?.querySelectorAll('.banner-image');
    const bannerDotsContainer = heroBannerSection?.querySelector('.banner-dots');
    const leftArrow = heroBannerSection?.querySelector('.left-arrow');
    const rightArrow = heroBannerSection?.querySelector('.right-arrow');
    let currentBannerIndex = 0;
    let bannerInterval;
    const BANNER_INTERVAL_TIME = 5000; // 5 seconds

    // Mystery Box Elements
    const openMysteryBoxBtn = document.getElementById('open-mystery-box-btn');
    const mysteryBoxModal = document.getElementById('mystery-box-modal');
    const closeMysteryBoxBtn = document.getElementById('close-mystery-box');
    const unboxActionBtn = document.getElementById('unbox-action-btn');
    const boxResult = document.querySelector('.mystery-box-result');

    // --- State Variables ---
    let cart = []; // Holds cart items {id, name, price, image, quantity}
    let products = []; // Holds fetched products
    let productsLoaded = false; // Flag to check if products are loaded

    // --- Utility Functions ---
    const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

    // --- Search Simulation Function ---
    function performSearch(query) {
        console.log("Simulating search for:", query);
        if (query && searchInput && searchInput.value !== query) {
             searchInput.value = query;
        }
        alert(`Simulated search initiated for:\n"${query}"`);
        // Optional: Switch to normal mode to show results (if desired)
        // setMode('normal');
        // Perform actual filtering/navigation here in a real app
        // e.g., filterProducts(query);
    }

    // --- Popup Logic ---
    function openPopup(popupElement) {
        if (popupElement) {
            popupElement.classList.add('active');
            // Prevent body scroll when popup is open
            document.body.style.overflow = 'hidden';
        }
    }

    function closePopup(popupElement) {
        if (popupElement) {
            popupElement.classList.remove('active');
            // Restore body scroll only if no other popups are active
            if (!document.querySelector('.popup-overlay.active, .ai-search-popup.active, .new-features-popup.active, .mystery-box-modal.active')) {
                document.body.style.overflow = '';
            }
        }
    }

    if (loginBtn && loginPopup) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); openPopup(loginPopup);
        });
    }
    if (loginCloseBtn && loginPopup) {
        loginCloseBtn.addEventListener('click', () => closePopup(loginPopup));
    }
    if (loginPopup) {
        loginPopup.addEventListener('click', (e) => {
            if (e.target === loginPopup) closePopup(loginPopup);
        });
    }


    // --- Cart Sidebar Logic ---
    function toggleCartSidebar() {
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
            if (cartSidebar.classList.contains('open')) {
                 document.body.style.overflow = 'hidden'; // Prevent scroll when open
            } else {
                 // Restore body scroll only if no popups are active
                 if (!document.querySelector('.popup-overlay.active, .ai-search-popup.active, .new-features-popup.active, .mystery-box-modal.active')) {
                    document.body.style.overflow = '';
                 }
            }
        }
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault(); toggleCartSidebar();
        });
    }
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', toggleCartSidebar);
    }

    document.addEventListener('click', (e) => {
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            if (!cartSidebar.contains(e.target) && !cartIcon.contains(e.target) && !e.target.closest('.add-to-cart-btn, .product-reel-buy-btn')) { // Don't close if clicking add-to-cart
                toggleCartSidebar();
            }
        }
    });


    // --- Load Products ---
    function loadProducts() {
        // Prevent multiple loads
        if (productsLoaded) return Promise.resolve(products);

        return fetch('products.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                products = data;
                productsLoaded = true;
                console.log("Products loaded:", products.length);
                // Initial display if normal mode is active
                if (normalModeSection?.classList.contains('active') && productGrid) {
                   displayNormalModeProducts(products);
                }
                return products; // Return data for chaining
            })
            .catch(error => {
                console.error("Could not load products:", error);
                if (productGrid) productGrid.innerHTML = '<p class="error-message">Error loading products.</p>';
                if (reelContainer) reelContainer.innerHTML = '<p class="error-message">Error loading products.</p>';
                productsLoaded = false; // Allow retry maybe?
                return []; // Return empty array on error
            });
    }

    // --- Display Products (Normal Mode) ---
    function displayNormalModeProducts(productsToDisplay) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (!productsToDisplay || productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p>No products found.</p>';
            return;
        }
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id;
            // Correct path for product page
            const productPageUrl = `product-pages/product.html?id=${product.id}`;
            productCard.innerHTML = `
                <a href="${productPageUrl}" class="product-link">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <h3>${product.name}</h3>
                    <p class="price">${formatPrice(product.price)}</p>
                </a>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });
        // Attach listeners using event delegation on the grid
        attachAddToCartListener(productGrid, '.add-to-cart-btn');
    }

     // --- Display Products (Reel Mode) ---
    function displayReelModeProducts(productsToDisplay) {
        console.log('Reel products:', productsToDisplay);
        if (!reelContainer) return;
        reelContainer.innerHTML = '';
        if (!productsToDisplay || productsToDisplay.length === 0) {
            reelContainer.innerHTML = '<p class="loading-reels">No products available for Reels.</p>';
            return;
        }
        productsToDisplay.forEach(product => {
            const reel = document.createElement('div');
            reel.classList.add('product-reel');
            reel.dataset.productId = product.id;
            reel.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-reel-image" loading="lazy">
                <h3 class="product-reel-name">${product.name}</h3>
                <p class="product-reel-price">${formatPrice(product.price)}</p>
                <button class="product-reel-buy-btn" data-id="${product.id}">Buy Now</button>
                <button class="reel-like-btn" style="position:absolute;right:18px;top:50%;transform:translateY(-50%);background:none;border:none;outline:none;z-index:10;display:flex;flex-direction:column;align-items:center;">
                    <i class="far fa-heart" style="font-size:2rem;color:#ff1744;"></i>
                </button>
            `;
            reelContainer.appendChild(reel);
        });
        // Like button logic (no count, just toggle heart)
        reelContainer.querySelectorAll('.reel-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = btn.querySelector('i');
                const isLiked = btn.classList.contains('liked');
                if (isLiked) {
                    btn.classList.remove('liked');
                    icon.classList.replace('fas', 'far');
                    icon.style.color = '#ff1744';
                } else {
                    btn.classList.add('liked');
                    icon.classList.replace('far', 'fas');
                    icon.style.color = '#ff1744';
                }
            });
        });
        // --- Improved snap scrolling ---
        function getReelHeight() {
            return reelContainer.querySelector('.product-reel')?.offsetHeight || window.innerHeight;
        }
        // Touch events for mobile
        let isTouching = false, startY = 0, startScroll = 0;
        reelContainer.addEventListener('touchstart', (e) => {
            isTouching = true;
            startY = e.touches[0].clientY;
            startScroll = reelContainer.scrollTop;
        });
        reelContainer.addEventListener('touchend', () => {
            isTouching = false;
            const reelHeight = getReelHeight();
            let snapTo = Math.round(reelContainer.scrollTop / reelHeight);
            snapTo = Math.max(0, Math.min(snapTo, reelContainer.children.length - 1));
            reelContainer.scrollTo({
                top: snapTo * reelHeight,
                behavior: 'smooth'
            });
        });
        // Wheel events for desktop
        let wheelTimeout = null;
        reelContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            clearTimeout(wheelTimeout);
            const reelHeight = getReelHeight();
            let snapTo = Math.round(reelContainer.scrollTop / reelHeight);
            if (e.deltaY > 0) snapTo++;
            else if (e.deltaY < 0) snapTo--;
            snapTo = Math.max(0, Math.min(snapTo, reelContainer.children.length - 1));
            wheelTimeout = setTimeout(() => {
                reelContainer.scrollTo({
                    top: snapTo * reelHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }, { passive: false });
        // Attach listeners using event delegation on the reel container
        attachAddToCartListener(reelContainer, '.product-reel-buy-btn');
    }

    // --- Generic Add to Cart Listener Attachment ---
    function attachAddToCartListener(container, buttonSelector) {
        if (!container) return;
         // Use event delegation
         container.addEventListener('click', (event) => {
            const button = event.target.closest(buttonSelector);
             if (button) {
                 handleAddToCartClick(button);
             }
         });
     }

     function handleAddToCartClick(button) {
        const productId = parseInt(button.dataset.id);
        // Ensure products are loaded before finding
        if (!productsLoaded) {
            console.warn("Products not loaded yet, attempting to load...");
            loadProducts().then(() => findAndAddProduct(productId, button));
        } else {
            findAndAddProduct(productId, button);
        }
    }

    function findAndAddProduct(productId, button) {
         const productToAdd = products.find(p => p.id === productId);
         if (productToAdd) {
             addToCart(productToAdd);
             // Use the clicked button for the animation origin
             flyToCartAnimation(button);
         } else {
              console.error("Product data not found for ID:", productId);
              alert("Error: Could not find product details.");
         }
     }

    // --- Cart Functionality ---
    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    }

     function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        updateCartFooterVisibility();
        // Optional: Save cart to localStorage
        // localStorage.setItem('flipkartCloneCart', JSON.stringify(cart));
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty!</p>';
            return;
        }
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.dataset.itemId = item.id;
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">${formatPrice(item.price)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-qty" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-id="${item.id}" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
        attachCartItemListeners();
    }

    function attachCartItemListeners() {
        if (!cartItemsContainer) return;
        cartItemsContainer.onclick = (event) => {
             const target = event.target;
             // Check if the click is on a button *within* the container
             if (target.closest('.quantity-btn') || target.closest('.remove-item-btn')) {
                 const button = target.closest('button');
                 if (!button) return; // Should not happen, but safety check

                 const id = parseInt(button.dataset.id);
                 if (isNaN(id)) return;

                 event.stopPropagation(); // Prevent closing sidebar if clicking inside

                 if (button.classList.contains('increase-qty')) {
                     changeQuantity(id, 1);
                 } else if (button.classList.contains('decrease-qty')) {
                     changeQuantity(id, -1);
                 } else if (button.classList.contains('remove-item-btn')) {
                     removeItem(id);
                 }
             }
        };
    }

    function changeQuantity(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
             cart[itemIndex].quantity += change;
             if (cart[itemIndex].quantity <= 0) {
                 cart.splice(itemIndex, 1);
             }
             updateCart();
         }
     }

     function removeItem(id) {
        cart = cart.filter(item => item.id !== id); // More concise removal
        updateCart();
    }

     function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountSpan) {
            cartCountSpan.textContent = totalItems;
            cartCountSpan.style.display = totalItems > 0 ? 'flex' : 'none';
        }
         if (sidebarCartCountSpan) {
            sidebarCartCountSpan.textContent = totalItems;
        }
    }

    function updateCartTotal() {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalPriceSpan) {
            cartTotalPriceSpan.textContent = formatPrice(totalPrice);
        }
    }

     function updateCartFooterVisibility() {
        const isEmpty = cart.length === 0;
        if(cartSummary) cartSummary.style.display = isEmpty ? 'none' : 'block';
        if(emptyCartFooterMessage) emptyCartFooterMessage.style.display = isEmpty ? 'block' : 'none';
    }

    // --- Fly to Cart Animation ---
    function flyToCartAnimation(originElement) {
        if (!cartIcon || !originElement) return;

        let imageToClone = null;
        // Find the relevant image based on the origin button
        if (originElement.closest('.product-card')) { // Normal mode
            imageToClone = originElement.closest('.product-card').querySelector('img');
        } else if (originElement.closest('.product-reel')) { // Reel mode
            imageToClone = originElement.closest('.product-reel').querySelector('.product-reel-image');
        }

        if (!imageToClone) {
            console.warn("Fly animation: Could not find image source.");
            return; // Cannot animate without an image source
        }

        const flyItem = imageToClone.cloneNode(true);
        flyItem.classList.add('fly-item');

        // Starting position
        const rect = imageToClone.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        flyItem.style.position = 'fixed'; // Use fixed for reliable positioning
        flyItem.style.left = `${startX}px`;
        flyItem.style.top = `${startY}px`;
        flyItem.style.opacity = '1';
        flyItem.style.width = `50px`; // Fixed size for flying item
        flyItem.style.height = `50px`;
        flyItem.style.objectFit = 'contain'; // Ensure image fits

        document.body.appendChild(flyItem);

        // Target position: Cart icon
        const cartRect = cartIcon.getBoundingClientRect();
        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;

        requestAnimationFrame(() => {
            flyItem.style.left = `${endX}px`;
            flyItem.style.top = `${endY}px`;
            flyItem.style.transform = 'scale(0.1)';
            flyItem.style.opacity = '0';
        });

        flyItem.addEventListener('transitionend', () => {
             if (flyItem.parentNode) { // Check if still in DOM
                flyItem.remove();
             }
        }, { once: true });
    }


    // --- Microphone Search Logic ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition && micSearchBtn) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-IN'; // Use Indian English
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micSearchBtn.addEventListener('click', () => {
            if (micSearchBtn.classList.contains('listening')) {
                 recognition.stop();
                 return;
             }
             try {
                micSearchBtn.disabled = true;
                micSearchBtn.classList.add('listening');
                recognition.start();
                console.log('Voice recognition started...');
            } catch (e) {
                console.error("Speech recognition start error:", e);
                micSearchBtn.classList.remove('listening');
                micSearchBtn.disabled = false;
                alert("Could not start voice recognition. Check microphone permissions. Error: " + e.message);
            }
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            console.log('Speech Result:', speechResult);
            performSearch(speechResult);
        };

        recognition.onend = () => {
            console.log('Voice recognition ended.');
            micSearchBtn.classList.remove('listening');
            micSearchBtn.disabled = false;
         };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error, event.message);
             micSearchBtn.classList.remove('listening');
            micSearchBtn.disabled = false;
             let errorMsg = 'An error occurred: ' + event.error;
             if(event.error === 'no-speech') errorMsg = "No speech detected.";
             else if (event.error === 'audio-capture') errorMsg = "Microphone problem.";
             else if (event.error === 'not-allowed') errorMsg = "Microphone permission denied.";
             else if (event.error === 'network') errorMsg = "Network error.";
             alert(errorMsg);
        };

    } else {
        console.warn('Web Speech API not supported.');
        if (micSearchBtn) micSearchBtn.disabled = true;
    }

    // --- Image Search Logic ---
    if (imageSearchBtn && imageUploadInput) {
        imageSearchBtn.addEventListener('click', () => imageUploadInput.click());
        imageUploadInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
                console.log('Image selected:', file.name);
                performSearch(`ImageSearch: ${file.name} (Demo)`);
            } else if (file) {
                alert("Please select a valid image file.");
            }
            event.target.value = null; // Reset for same file selection
        });
    }


    // --- Scribble Search Logic ---
    if (scribblePad && scribbleCanvas && scribbleSearchBtn && clearScribbleBtn && closeScribbleBtn) {
        const ctx = scribbleCanvas.getContext('2d');
        let drawing = false;
        let lastX, lastY;

        function resizeCanvas() {
             // Standard sizing, adjust if high DPI issues persist significantly
            const rect = scribbleCanvas.getBoundingClientRect();
            scribbleCanvas.width = rect.width;
            scribbleCanvas.height = rect.height;
            // Reset styles after resize
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#333';
        }

        function getCoords(e) {
            const rect = scribbleCanvas.getBoundingClientRect();
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        }

        function startDrawing(e) {
            e.preventDefault(); drawing = true;
            const { x, y } = getCoords(e);
            lastX = x; lastY = y;
            ctx.beginPath(); ctx.moveTo(lastX, lastY);
        }
        function draw(e) {
            e.preventDefault(); if (!drawing) return;
            const { x, y } = getCoords(e);
            ctx.lineTo(x, y); ctx.stroke();
            lastX = x; lastY = y; ctx.moveTo(lastX, lastY);
        }
        function stopDrawing() { if (drawing) { drawing = false; ctx.closePath(); } }
        function clearCanvas() { ctx.clearRect(0, 0, scribbleCanvas.width, scribbleCanvas.height); }
        function closeScribblePad() { scribblePad.style.display = 'none'; }

        // Events
        scribbleCanvas.addEventListener('mousedown', startDrawing);
        scribbleCanvas.addEventListener('mousemove', draw);
        scribbleCanvas.addEventListener('mouseup', stopDrawing);
        scribbleCanvas.addEventListener('mouseleave', stopDrawing);
        scribbleCanvas.addEventListener('touchstart', startDrawing, { passive: false });
        scribbleCanvas.addEventListener('touchmove', draw, { passive: false });
        scribbleCanvas.addEventListener('touchend', stopDrawing);
        scribbleCanvas.addEventListener('touchcancel', stopDrawing);

        // Pad Controls
        scribbleSearchBtn.addEventListener('click', () => {
            scribblePad.style.display = 'block';
             resizeCanvas(); // Ensure size is correct on open
            clearCanvas();
        });
        searchScribbleBtn.addEventListener('click', () => {
            console.log("Searching based on scribble (simulation)");
            performSearch("Scribble Search (Demo)");
            closeScribblePad();
        });
        clearScribbleBtn.addEventListener('click', clearCanvas);
        closeScribbleBtn.addEventListener('click', closeScribblePad);

        // Close pad if clicking outside
        document.addEventListener('click', (e) => {
            if (scribblePad?.style.display === 'block' && !scribblePad.contains(e.target) && !scribbleSearchBtn.contains(e.target)) {
                closeScribblePad();
            }
        });
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial size
    } else {
        console.warn("Scribble pad elements incomplete.");
        if(scribbleSearchBtn) scribbleSearchBtn.disabled = true;
    }


     // --- Search Input Listener (Enter Key) ---
     if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) performSearch(query);
            }
        });
    }

    // --- AI Search Popup ---
    function toggleAISearchPopup() {
        const isActive = aiSearchPopup.classList.toggle('active');
        if (isActive) {
            aiSearchInput?.focus();
            openPopup(aiSearchPopup); // Use general popup open logic
        } else {
            closePopup(aiSearchPopup); // Use general popup close logic
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            const now = Date.now();
            if (now - lastShiftPress < 500) {
                shiftCount++;
                if (shiftCount === 2) {
                    toggleAISearchPopup(); shiftCount = 0; // Reset count
                }
            } else { shiftCount = 1; }
            lastShiftPress = now;
        } else { // Reset shift count if another key is pressed
            shiftCount = 0;
        }
    });

    if (aiSearchClose) aiSearchClose.addEventListener('click', toggleAISearchPopup);
    aiSearchPopup?.addEventListener('click', (e) => { if (e.target === aiSearchPopup) toggleAISearchPopup(); });
    aiSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = aiSearchInput.value.trim();
            if (query) {
                console.log('AI Searching for:', query);
                const resultsContainer = aiSearchPopup.querySelector('.ai-search-results');
                if(resultsContainer) resultsContainer.innerHTML = `<p>Simulating AI search results for: "${query}"...</p>`;
                // Close popup after search potentially?
                // setTimeout(toggleAISearchPopup, 500);
            }
        }
    });

    // --- New Features Popup ---
    function toggleNewFeaturesPopup() {
        const isActive = newFeaturesPopup.classList.toggle('active');
         if (isActive) openPopup(newFeaturesPopup);
         else closePopup(newFeaturesPopup);
    }

    if (newFeaturesBtn) newFeaturesBtn.addEventListener('click', (e) => { e.preventDefault(); toggleNewFeaturesPopup(); });
    if (newFeaturesClose) newFeaturesClose.addEventListener('click', toggleNewFeaturesPopup);
    newFeaturesPopup?.addEventListener('click', (e) => { if (e.target === newFeaturesPopup) toggleNewFeaturesPopup(); });


    // --- Banner Carousel Logic ---
    function showBanner(index) {
        if (!bannerImages || bannerImages.length === 0) return;
        // Loop index
        if (index >= bannerImages.length) index = 0;
        if (index < 0) index = bannerImages.length - 1;

        bannerImages.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
        if (bannerDotsContainer) {
            const dots = bannerDotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        currentBannerIndex = index;
    }

    function nextBanner() { showBanner(currentBannerIndex + 1); }
    function prevBanner() { showBanner(currentBannerIndex - 1); }
    function goToBanner(index) { showBanner(index); resetBannerInterval(); }

    function setupBannerDots() {
        if (!bannerDotsContainer || !bannerImages || bannerImages.length <= 1) return;
        bannerDotsContainer.innerHTML = ''; // Clear existing dots
        bannerImages.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToBanner(i));
            bannerDotsContainer.appendChild(dot);
        });
    }

    function startBannerInterval() {
        if (bannerImages && bannerImages.length > 1) {
           stopBannerInterval(); // Clear existing interval first
           bannerInterval = setInterval(nextBanner, BANNER_INTERVAL_TIME);
           console.log("Banner interval started");
        }
    }
    function stopBannerInterval() {
        clearInterval(bannerInterval);
        bannerInterval = null;
         console.log("Banner interval stopped");
    }
    function resetBannerInterval() {
         startBannerInterval(); // Stop and restart
    }

    if (heroBannerSection) {
        leftArrow?.addEventListener('click', () => { prevBanner(); resetBannerInterval(); });
        rightArrow?.addEventListener('click', () => { nextBanner(); resetBannerInterval(); });
        // Pause on hover
        heroBannerSection.addEventListener('mouseenter', stopBannerInterval);
        heroBannerSection.addEventListener('mouseleave', startBannerInterval);
        setupBannerDots();
        showBanner(0); // Show first banner initially
        // Only start interval if the banner section is potentially visible
        if (normalModeSection?.classList.contains('active')) {
             startBannerInterval();
        }
    }

    // --- Mystery Box Unboxing UI ---
    const prizes = [ // Keep prize data here or fetch if needed
        { icon: '🎧', text: 'Wireless Headphones - 50% OFF!' },
        { icon: '👟', text: 'Running Shoes - Buy 1 Get 1 Free!' },
        { icon: '💻', text: 'Laptop XYZ - ₹5000 Cashback!' },
        { icon: '⌚', text: 'Stylish Watch - Free Shipping!' },
        { icon: '👜', text: 'Smartphone Pro - Mystery Discount!' },
        { icon: '☕', text: 'Cool T-Shirt - Flat 40% OFF!' }
    ];

    function openMysteryBox() {
        if (!mysteryBoxModal) return;
        mysteryBoxModal.classList.remove('unboxed'); // Reset state
        if(boxResult) boxResult.innerHTML = ''; // Clear previous result
        if(unboxActionBtn) unboxActionBtn.disabled = false; // Enable button
        openPopup(mysteryBoxModal); // Use general popup logic
    }
    function closeMysteryBox() {
        closePopup(mysteryBoxModal); // Use general popup logic
    }
    function unboxMystery() {
        if (!mysteryBoxModal || !boxResult) return;
        mysteryBoxModal.classList.add('unboxed');
        if(unboxActionBtn) unboxActionBtn.disabled = true;

        // Clear previous result immediately for smoother transition
        boxResult.innerHTML = '';
        boxResult.style.opacity = 0; // Ensure it's hidden before animation

        setTimeout(() => {
            const prize = prizes[Math.floor(Math.random() * prizes.length)];
            boxResult.innerHTML = `<span style='font-size:2rem; display: block; margin-bottom: 5px;'>${prize.icon}</span>${prize.text}`;
            
            // Add a button to redirect to product page
            const redirectBtn = document.createElement('button');
            redirectBtn.className = 'redirect-btn';
            redirectBtn.textContent = 'View Product';
            redirectBtn.style.marginTop = '20px';
            redirectBtn.style.padding = '10px 20px';
            redirectBtn.style.backgroundColor = '#2874f0';
            redirectBtn.style.color = 'white';
            redirectBtn.style.border = 'none';
            redirectBtn.style.borderRadius = '4px';
            redirectBtn.style.cursor = 'pointer';
            
            redirectBtn.addEventListener('click', () => {
                function goToRandomProduct(productsArr) {
                    if (productsArr && productsArr.length > 0) {
                        const randomProduct = productsArr[Math.floor(Math.random() * productsArr.length)];
                        window.location.href = `product-pages/product.html?id=${randomProduct.id}`;
                    } else {
                        alert('No products available!');
                    }
                }
                if (products && products.length > 0) {
                    goToRandomProduct(products);
                } else if (typeof loadProducts === 'function') {
                    loadProducts().then(loaded => {
                        goToRandomProduct(loaded);
                    });
                } else {
                    alert('No products available!');
                }
            });
            
            boxResult.appendChild(redirectBtn);
        }, 800);
    }

    if (openMysteryBoxBtn) openMysteryBoxBtn.addEventListener('click', openMysteryBox);
    if (closeMysteryBoxBtn) closeMysteryBoxBtn.addEventListener('click', closeMysteryBox);
    if (unboxActionBtn) unboxActionBtn.addEventListener('click', unboxMystery);
    if (mysteryBoxModal) mysteryBoxModal.addEventListener('click', (e) => { if (e.target === mysteryBoxModal) closeMysteryBox(); });


    // --- Mode Toggle Logic ---
    async function setMode(mode) {
        console.log('Setting mode to:', mode);
        // Remove active classes from all buttons and sections
        [normalModeBtn, reelModeBtn, mysteryModeBtn].forEach(btn => btn?.classList.remove('mode-segment-active'));
        [normalModeSection, reelModeSection, mysteryModeSection].forEach(section => section?.classList.remove('active'));
        stopBannerInterval(); // Stop banner always when changing mode
        // Activate the selected mode
        try {
            if (mode === 'normal') {
                normalModeBtn?.classList.add('mode-segment-active');
                normalModeSection?.classList.add('active');
                // Ensure products are loaded and displayed
                if (!productsLoaded) {
                    await loadProducts(); // Wait for products
                }
                displayNormalModeProducts(products); // Display products for normal mode
                if (heroBannerSection) startBannerInterval(); // Start banner only in normal mode
            } else if (mode === 'reel') {
                reelModeBtn?.classList.add('mode-segment-active');
                reelModeSection?.classList.add('active');
                if (!productsLoaded) {
                    await loadProducts();
                }
                displayReelModeProducts(products);
            } else if (mode === 'mystery') {
                mysteryModeBtn?.classList.add('mode-segment-active');
                mysteryModeSection?.classList.add('active');
                // No specific product loading needed here, just show the section
            }
        } catch (error) {
            console.error("Error setting mode:", mode, error);
            // Handle error, maybe show a message
            if (mode === 'reel' && reelContainer) {
                reelContainer.innerHTML = '<p class="error-message">Error loading products for reels.</p>';
            }
        }
        // Adjust body class or styles if needed based on mode
        document.body.className = `mode-${mode}`; // Add mode class to body
    }

    if (normalModeBtn && reelModeBtn && mysteryModeBtn) {
        normalModeBtn.addEventListener('click', () => setMode('normal'));
        reelModeBtn.addEventListener('click', () => setMode('reel'));
        mysteryModeBtn.addEventListener('click', () => setMode('mystery'));
    }

    // --- Initial Setup Calls ---
    // Load cart from localStorage (optional)
    // const savedCart = localStorage.getItem('flipkartCloneCart');
    // if (savedCart) {
    //     try { cart = JSON.parse(savedCart); } catch(e) { console.error("Error parsing saved cart", e); cart = []; }
    // }

    setMode('normal'); // Set initial mode to Normal
    loadProducts(); // Start loading products in the background
    updateCart(); // Initialize cart view

}); // End DOMContentLoaded