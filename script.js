'use strict';
// NOTES
/* 
    ===== INTERSECTION OBSERVER API =====

    I am using intersection observer api because events on scroll are fired very often,
    and it's just a waste of resources. Any scroll fired features will be structured on this API.

    In sum it's a watch for intersections of any element you pick on the user screen. 

    It returns 2 arrays : 
    [0] => the Intersection Event Response 
    [1] => Array prototype inheritance

    I'll be working on the first one to watch for when elements are visible or partially visible 
    and from there will trigger my features/animations/etc. 

    MDN link for more details and Instructions :  
    https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    
*/

/* 
    ========== DOM TRAVERSING ===========

    Because my elements are planned to be render through a database request (My js DB files for now)
    I got two problems.

    1 - I can't apply listeners to elements that do not exist
    2 - If the database grows the website will be heavy as, with every single element holding a function / listener

    I used DOM Traversing to mitigate those two problems. 
    That's why listeners are being applied to whole sections.

*/

/* 
    ==========  FUTURE EVENTS ===========
    
    To avoid several functions being created for each video on the database.
    I opted for one single event attached to the section holding the video element (work and store).

    For the Work Section 
    The click updates the Video ID lightbox video with the Clicked Video ID and opens the  video card.

    For the Shop 
    The click toggle a close/hide class on a few elements to open or close the card.

*/

// --------------------------- IMPORTS ---------------------------- //

import {
    renderWorkCards,
    getIframeLink,
    //
    renderStoreCards,
    toggleStoreCards,
    //
    renderCartItems,
    addToCart,
    removeFromCart,
    renderCartTotal,
    renderCartTotalDiscount,
} from './helpers/helpers-and-actions.js';
import {obsverserOptMAP} from './helpers/option-maps.js';

// ---------------------------------------------------------------- //
// ---------------------- ELEMENTS VARIABLES ---------------------- //
// ---------------------------------------------------------------- //

// SECTIONS
const homeSectionEl = document.getElementById('home');
const workSectionEl = document.getElementById('work');
const storeSectionEl = document.getElementById('store');
const aboutSectionEl = document.getElementById('about');
const contactSectionEl = document.getElementById('contact');
const shoppingCartSectionEl = document.getElementById('shopping-cart');

// MAIN ELEMENTS
const navMenuEl = document.querySelector('.nav-menu');
const workGalleryEl = document.querySelector('.work-gallery');
const storeGalleryEl = document.querySelector('.store-gallery');
const videoLightboxEl = document.getElementById('video-lightbox');
const navSocialsEl = document.querySelector('.nav-socials');

// SHOPPING CART ELEMENTS
const shoppingCartIconEl = document.querySelector('.shopping-cart-icon');
const shoppingCartWrapperEl = document.querySelector('.shopping-cart-wrapper');
const shoppingCartItemsEl = document.querySelector('.shopping-cart-content');
const shoppingCartTotalPrice = document.querySelector('.shopping-cart-total-price');
const shoppingCartPromoCodeEl = document.querySelector('.shopping-cart-promo-code');

// HELPERS
const sectionsArr = [homeSectionEl, workSectionEl, storeSectionEl, aboutSectionEl, contactSectionEl];
const navLinksArr = [...navMenuEl.querySelectorAll('li')];

// ---------------------------------------------------------------- //
// --------------------- INIT RENDER FUNCTION --------------------- //
// ---------------------------------------------------------------- //

function initRender() {
    renderStoreCards(storeGalleryEl);
    renderWorkCards(workGalleryEl);
    renderCartItems(shoppingCartItemsEl);
    renderCartTotal(shoppingCartTotalPrice);
}

initRender();

// ---------------------------------------------------------------- //
// ----------------------- EVENT LISTENERS ------------------------ //
// ---------------------------------------------------------------- //

// ---------------------------------------------------------------- //
// --------------------------- NAV MENU --------------------------- //
// ---------------------------------------------------------------- //

// ------- NAV MENU ANIMATION TRIGGER -------- //

const observerNavAnimation = new IntersectionObserver(function (e) {
    const isIntersecting = e[0].isIntersecting;

    /* 
        Depending on which navMenuEl classes are active the slideIn class will
        animate slithly different.
        I am just adding and removing it with a timeout function that follows 
        the same value as the animation on the css file.
    */

    // TODO - find a way to programatically have the trigger time connected here and on the CSS

    if (isIntersecting) {
        navMenuEl.classList.add('slideIn');
        setTimeout(() => navMenuEl.classList.remove('slideIn'), 300);
        navMenuEl.classList.remove('nav-menu-corner');
    } else {
        navMenuEl.classList.add('slideIn');
        setTimeout(() => navMenuEl.classList.remove('slideIn'), 300);
        navMenuEl.classList.add('nav-menu-corner');
    }
}, obsverserOptMAP.SEVENTY_FIVE);

observerNavAnimation.observe(homeSectionEl);

// --------- NAV MENU ACTIVE SECTION ---------- //

const observerNavActive = new IntersectionObserver(e => {
    /* 
        This observer watch the sections, but depending on the section it's 
        intersectioning. It'll change the nav menu.
    */

    const currSectionID = e[0].target.id;

    // For Loop apply active class to the nav button respective of visible section
    navLinksArr.forEach(sec => {
        // remove active class from all buttons
        sec.classList.remove('active-section');
        // add active class to current section link ref
        sec.dataset.ref === currSectionID && sec.classList.add('active-section');
    });
}, obsverserOptMAP.SEVENTY);

sectionsArr.forEach(sec => observerNavActive.observe(sec)); // For loop to apply observer to all sections programatically

// NAV SOCIALS HIDE AT CONTACT SECTION

const observerNavSocials = new IntersectionObserver(e => {
    const hasHiddenClass = navSocialsEl.classList.value.includes('hidden');
    hasHiddenClass ? navSocialsEl.classList.remove('hidden') : navSocialsEl.classList.add('hidden');
}, obsverserOptMAP.TWENTY);

observerNavSocials.observe(contactSectionEl);

// ---------------------------------------------------------------- //
// ------------------------- WORK GALLERY ------------------------- //
// ---------------------------------------------------------------- //

// ----------- OPEN VIDEO LIGHTBOX ------------ //

workGalleryEl.addEventListener('click', e => {
    const card = e.target.closest('.work-card'); // Bubbles up to the card element
    if (!card) return; // Guard Clause

    videoLightboxEl.firstElementChild.src = getIframeLink(card.dataset.videoID);
    videoLightboxEl.classList.remove('hidden');
});

// ----------- CLOSE VIDEO LIGHTBOX ----------- //

videoLightboxEl.addEventListener('click', () => videoLightboxEl.classList.add('hidden'));

// ---------- THE LAZY LOAD OBSERVER ---------- //

/* 
    Queue Stack and Context side effect.

    The lazyLoad observer had to be put on the helpers-and-actions.js because of the order 
    the cards are rendered.
    
    When the script file is loaded and read, the work cards do not exist yet.
*/

// ---------------------------------------------------------------- //
// ------------------------ STORE GALLERY ------------------------- //
// ---------------------------------------------------------------- //

// ----- STORE ADD TO CART EVENT LISTENER ----- //

storeGalleryEl.addEventListener('click', e => {
    if (!e.target.closest('.lut-buy-btn')) return;
    shoppingCartWrapperEl.classList.remove('closed');
    addToCart(e, shoppingCartItemsEl);
    renderCartTotal(shoppingCartTotalPrice);
});

// ----------- BEFORE AND AFTER LUT ----------- //

storeGalleryEl.addEventListener('input', e => {
    if (!e.target.closest('.image-slider')) return;

    /* -------- VARIABLES SETUP --------- */

    // Get Clicked Card
    const storeCard = e.target.closest('.store-card');

    // Get Elements to Edit
    const slider = storeCard.querySelector('.image-slider'); // Gives Slider Position
    const afterLutImg = storeCard.querySelector('.image-after');
    const slideBar = storeCard.querySelector('.image-slider-bar');
    const slideButton = storeCard.querySelector('.image-slider-button');

    /* 
        I could've apply this to the CSS set property, but that would change all instances of the image comparison
        This way, each image will work independent from each other.
    */

    // Change position and width of elements matching slider
    afterLutImg.style.width = `${slider.value}%`;
    slideBar.style.left = `${slider.value}%`;
    slideButton.style.left = `${slider.value}%`;
});

// --------- OPEN STORE CARD LISTENER --------- //

storeGalleryEl.addEventListener('click', e => {
    const storeCard = e.target.closest('.store-card');
    if (!storeCard.classList.contains('closed')) return; // If element clicked is opened it'll return.
    toggleStoreCards(storeCard);
});

// -------- CLOSE STORE CARD LISTENER --------- //

storeGalleryEl.addEventListener('click', e => {
    if (!e.target.closest('.close-store-card-btn')) return; // If click is not on close btn it'll return.
    const storeCard = e.target.closest('.store-card');
    toggleStoreCards(storeCard, false);
});

// ---------------------------------------------------------------- //
// ------------------------ SHOPPING CART ------------------------- //
// ---------------------------------------------------------------- //

// ---------------- OPEN CART ----------------- //

shoppingCartIconEl.addEventListener('click', () => shoppingCartWrapperEl.classList.remove('closed'));

// ---------------- CLOSE CART ---------------- //

shoppingCartSectionEl.addEventListener('click', e => {
    if (!e.target.closest('.shopping-cart-close-btn')) return; // If click is out of close btn - return
    shoppingCartWrapperEl.classList.add('closed');
});

// ------------ REMOVE CART ITEM -------------- //

shoppingCartSectionEl.addEventListener('click', e => {
    if (!e.target.closest('.shopping-cart-card-cancel-btn')) return;
    removeFromCart(e, shoppingCartItemsEl);
    renderCartTotal(shoppingCartTotalPrice); // recalculates price with discount if user add or remove item from list.
});

// ----- CALCULATE AND RENDER PROMO CODE ------ //

shoppingCartPromoCodeEl.addEventListener('input', e => {
    renderCartTotalDiscount(e, shoppingCartTotalPrice);
});
