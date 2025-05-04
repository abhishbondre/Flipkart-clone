# Flipkart Clone

A modern frontend demo inspired by Flipkart, featuring:

- **Normal Mode:** Browse products in a grid, add to cart, and search.
- **Reel Mode:** Instagram-like vertical reels for products, with snap scrolling and like button.
- **Mystery Box:** Unbox a random product and view its details.
- **AI Search:** Double Shift to open an AI-powered search assistant.
- **Scribble & Voice Search:** Find products by drawing or speaking.
- **Cart Sidebar:** Add/remove products, update quantities, and view total.
- **Product Page:** Detailed view with price history chart, specifications, and add to cart/buy now.

## Setup

1. **Clone or Download** this repository.
2. **Ensure you have a local server** (for example, use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VSCode, or run `python -m http.server` in the project directory).
3. **Open `index.html` in your browser** via the local server (not by double-clicking, as fetches require HTTP).

## File Structure

- `index.html` — Main homepage (Normal, Reel, Mystery Box modes)
- `script.js` — Main JS logic for all modes
- `style.css` — Main styles
- `products.json` — Product data
- `product-pages/product.html` — Product details page
- `product-pages/product.js` — Product page JS
- `product-pages/product.css` — Product page CSS

## Features

- **Reel Mode:**
  - Full viewport, one product per scroll (touch or wheel)
  - Like button (heart)
  - Buy Now button always visible
- **Mystery Box:**
  - Unbox a random product (always valid)
- **Cart:**
  - Add/remove/update products
- **AI, Voice, and Scribble Search:**
  - Double Shift for AI search popup
  - Voice and scribble search buttons in the search bar
- **Responsive Design:**
  - Works on desktop and mobile

## Notes
- All product data is demo/fake and for frontend demonstration only.
- For best experience, use a local server (see Setup).

## License
MIT 
