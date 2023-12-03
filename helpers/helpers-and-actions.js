import {workDB, storeDB, cartDB, _validadePromoCode} from '../database.js';
import {_addToCartDB, _removeFromCartDB, _getCartTotalDB} from '../database.js';
import {obsverserOptMAP} from './option-maps.js';
/* 
    Helper and Action functions on this project aim to keep the code cleaner and less repetitive.
*/

export const isMobile = () => window.innerWidth <= 420;

// ---------------------------------------------------------------- //
// --------------------- WORK SECTION HELPERS --------------------- //
// ---------------------------------------------------------------- //

// ------------------------ IFRAME OPTIONS ------------------------ //

// Returns String for video to be embeded on iframe.
export const getIframeLink = id => `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=0`;

// FIXME FIX LUT DESCRIPTION SLICE TO FIT MOBILE SCREENS

export function renderWorkCards(targetElement) {
    for (const work of workDB) {
        const cardHTML = `
        <div class="work-card" data-video-i-d="${work.videoID}">
            <div class="blur-container lazy-blur"></div>
            <img src="assets/work-db-images/lazy-load-mirror/${work.videoID}.jpg" alt="" />
            <div class="work-card-controls">
                <button><i class="bi bi-play"></i></button>
                <div>
                    <h3>${work.title}</h3>
                    <p>${work.description.slice(0, 50)}...</p>
                </div>
            </div>
        </div>
        `;

        targetElement.insertAdjacentHTML('beforeend', cardHTML);
    }

    // -------------------- THE LAZY LOAD OBSERVER -------------------- //

    /* 
        Queue Stack and Context side effect.

        The lazyLoad observer had to be put here because of the order the cards are rendered.
        When the script file is loaded and read, the work cards do not exist yet.
    */

    const workCards = [...document.querySelectorAll('.work-card')];

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        if (entries[0].intersectionRatio <= 0) return; // Safe Guard Clause => prevent bug of the observer call back fiering on page load
        const cardsIntersectingArr = entries.map(card => card.target); // gets list of cards that intersect

        cardsIntersectingArr.forEach(card => {
            const videoID = card.dataset.videoID;
            card.querySelector('img').src = `assets/work-db-images/${videoID}.jpg`;
            card.firstElementChild.classList.remove('lazy-blur');

            observer.unobserve(card); // Unobserve the fully loaded cards.
        });
    }, obsverserOptMAP.HALF);

    workCards.forEach(card => lazyLoadObserver.observe(card));
}

// ---------------------------------------------------------------- //
// -------------------- STORE SECTION HELPERS --------------------- //
// ---------------------------------------------------------------- //

export function getLUTinstructions(instructionsArray) {
    // loops through array and return string with html
    const HTML = instructionsArray.map(instruction => `<li>${instruction}</li>`).join('\n');
    return HTML;
}

export function descriptionShortener(string) {
    // Short version of description according to window width

    let sliceRatio = null;
    const screenWidth = window.innerWidth;

    if (screenWidth <= 1000 && screenWidth > 700) {
        sliceRatio = 300;
    } else if (screenWidth <= 700 && screenWidth > 500) {
        sliceRatio = 200;
    } else if (screenWidth <= 500) {
        sliceRatio = 150;
    } else {
        sliceRatio = '';
    }

    return sliceRatio ? string.slice(0, sliceRatio) + '...' : string.slice(0);
}

export function toggleStoreCards(targetElement, option = true) {
    /* -------- VARIABLES SETUP --------- */

    const closeBtn = targetElement.querySelector('.close-store-card-btn');
    const shortInfo = targetElement.querySelector('.short-info');
    const imageBefore = targetElement.querySelector('.image-before');
    const imageAfter = targetElement.querySelector('.image-after');
    const imageSlider = targetElement.querySelector('.image-slider');
    const imageSliderBar = targetElement.querySelector('.image-slider-bar');
    const imageSliderButton = targetElement.querySelector('.image-slider-button');
    const lutDisplayInfo = targetElement.querySelector('.lut-display-info');

    const elementsArray = [
        targetElement,
        closeBtn,
        shortInfo,
        imageBefore,
        imageAfter,
        imageSlider,
        imageSliderBar,
        imageSliderButton,
        lutDisplayInfo,
    ];

    option
        ? elementsArray.forEach(el => el.classList.remove('closed'))
        : elementsArray.forEach(el => el.classList.add('closed'));
}

export function renderStoreCards(targetElement) {
    for (const product of storeDB) {
        const cardHTML = `
                <div class="store-card closed">
                    <div class="close-store-card-btn closed">
                        <i class="bi bi-chevron-bar-up"></i>
                    </div>
                    <!-- Image comparison feature -->
                    <div class="lut-display-comparison-wrapper">
                        <div class="image-wrapper">
                            <!-- Short Info For closed Card -->

                            <div class="short-info closed">
                                <h1>${product.name}</h1>
                                <p>${descriptionShortener(product.description)}</p>
                             
                            </div>

                            <!-- ------------------------- -->

                            <div class="image-before closed">
                                <img src="assets/store-db-images/${product.lutID}.jpg" alt="" />
                            </div>
                            <div class="image-after closed">
                                <img src="assets/store-db-images/${product.lutID}-after.jpg" alt="" />
                            </div>
                        </div>
                        <input class="image-slider closed" type="range" min="0" max="100" />
                        <div class="image-slider-bar closed"></div>
                        <div class="image-slider-button closed">
                            <i class="bi bi-caret-left-fill"></i>
                            <i class="bi bi-caret-right-fill"></i>
                        </div>
                    </div>
                    <!-- LUT info and CTA -->
                    <div class="lut-display-info closed">
                        <div class="lut-display-content">
                            <div class="lut-display-title-price">
                                <h1 class="lut-display-title">${product.name}</h1>
                                <h1 class="lut-display-price">$${product.price.toFixed(2)} NZD</h1>
                            </div>
                            <p class="lut-display-description">${product.description}</p>
                            <ul class="lut-display-instructions">
                                <li>USE INSTRUCTIONS</li>
                                ${getLUTinstructions(product.instructions)}
                            </ul>
                        </div>
                        <button class="lut-buy-btn">ADD LUT TO YOUR CART</button>
                    </div>
                </div>
    `;

        targetElement.insertAdjacentHTML('beforeend', cardHTML);
    }
}

// ---------------------------------------------------------------- //
// ------------------------ SHOPPING CART ------------------------- //
// ---------------------------------------------------------------- //

/* 
    Because the actions / purposes of these functions are directly related to the Database, 
    I abstracted their arguments to : event and targetElement.
    
    They need them to work properly.

    event => will always be the event on the event listener
    targetElement => The element to be manipulated

    NOTE: To keep the amount of elementsVariables in control, I used DOM Traversing everytime 
    it make sense that the elements acessed on the function would not have much use out of it.

*/
export function updateCartIcon() {
    const cartIconCounter = document.querySelector('.shopping-cart-icon-counter');
    const cartItemsCount = cartDB.length;
    cartIconCounter.textContent = cartItemsCount;

    cartItemsCount <= 0
        ? (cartIconCounter.style.visibility = 'hidden')
        : (cartIconCounter.style.visibility = 'visible');
}

export function addToCart(event, targetElement) {
    // Guard Clause to return If click is not on addToCartBtn
    if (!event.target.closest('.lut-buy-btn')) return;

    let [title, price] = event.target //
        // Find and Deconstruct title and price into their own variables.
        .closest('.lut-display-info')
        .querySelector('.lut-display-title-price').children;

    // CHECK IF ITEM EXIST ON CART AND RETURN IF TRUE
    let isItemAlreadyOnCart;
    cartDB.forEach(item => {
        if (item.name === title.textContent) isItemAlreadyOnCart = true;
    });
    if (isItemAlreadyOnCart) return; // Guard Clause to return if item is already on Cart

    // FORMAT AND ADD NEW ITEM TO CART
    const itemToBeAdded = {
        name: title.textContent,
        price: parseFloat(price.textContent.slice(1)),
        quantity: 1,
    };
    _addToCartDB(itemToBeAdded);

    // RERENDER CART
    renderCartItems(targetElement);
    updateCartIcon();
}

export function removeFromCart(event, targetElement) {
    // GET ITEM REF
    const itemRef = event.target
        .closest('.shopping-cart-card')
        .querySelector('.shopping-cart-card-title')
        .textContent.slice(2);

    // REMOVE FROM DB AND RERENDER
    _removeFromCartDB(itemRef);
    renderCartItems(targetElement);
    updateCartIcon();
}

export function renderCartTotal(targetElement) {
    // GET STRING (PROMO CODE) ON INPUT ELEMENT
    const promoInputed = targetElement
        .closest('.shopping-cart-wrapper')
        .querySelector('.shopping-cart-promo-code').value;

    // This functions will validade PROMO code and if true will return price with discount, if not, price remains the same.
    const cartTotal = _getCartTotalDB(_validadePromoCode(promoInputed));
    targetElement.textContent = `$${cartTotal.toFixed(2)}`;
}

export function renderCartTotalDiscount(event, targetElement) {
    // GET STRING (PROMO CODE) ON INPUT ELEMENT
    const promoInputed = event.target.value;

    // This functions will validade PROMO code and if true will return price with discount, if not, price remains the same.

    const cartTotal = _getCartTotalDB(_validadePromoCode(promoInputed));
    targetElement.textContent = `$${cartTotal.toFixed(2)}`;
}

export function renderCartItems(targetElement) {
    targetElement.innerHTML = ''; // Clear element for new objects
    cartDB.forEach(item => {
        const cartItemCartHTML = `
            <div class="shopping-cart-card">
                <h3 class="shopping-cart-card-title"><span>X${item.quantity}</span>${item.name}</h3>
                <h3 class="shopping-cart-card-price">$${item.price}</h3>
                <button class="shopping-cart-card-cancel-btn">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
            </div>`;

        targetElement.insertAdjacentHTML('beforeend', cartItemCartHTML);
    });
}
