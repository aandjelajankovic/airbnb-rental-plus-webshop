"use strict"
const basketEl = document.getElementById("basket"); // Varukorgen i DOM
const smallBasketEl = document.getElementById("small-basket"); // Liten varukorg med endast antal och summa
const checkoutEl = document.getElementById("checkout"); // Kassan
const checkoutInlineEl = document.getElementsByClassName("checkout-inline"); // Checka ut inline 
const checkoutButtonEl = document.getElementsByClassName("checkout-button"); // Checka ut knappar 
const itemsInBasketEl = document.getElementsByClassName("items-in-basket"); // Antal varor i varukorgen
const totalSumEl = document.getElementsByClassName("total-sum"); // Totalt
const notifyEl = document.getElementById("notify"); // Meddelande när en vara lagts i varukorgen

// Läs och visa varukorgen när sidan laddas
window.addEventListener("load", showBasket, false);         
window.addEventListener("load", showSmallBasket, false);    
window.addEventListener("load", showCheckout, false);       

// Funktion för att lägga till produkter i varukorgen
function addToBasket(el, id, name, cost, image, notify = false) {
    let numOfItems = 1; 
    let currentBasket = JSON.parse(localStorage.getItem("basket")) || []; 

    // Kontrollera om varan redan finns
    for (let i = 0; i < currentBasket.length; i++) {
        if (id == currentBasket[i].artId) {
            numOfItems = currentBasket[i].nums + 1; 
            currentBasket.splice(i, 1); 
        }
    }

    // Lägg till varan
    currentBasket.push({ artId: id, artName: name, artCost: cost, artImage: image, nums: numOfItems });

    // Spara varukorgen i localStorage
    localStorage.setItem("basket", JSON.stringify(currentBasket));

    // Uppdatera varukorgsvisningen direkt
    updateTotalSum();
    updateCartDisplay();
    showBasket();
    showSmallBasket();
    showCheckout();


    // Meddela användaren
    if (notify) {
        let timer = null;
        if (document.getElementById("notify")) {
            let notifyText = "<p>You added <b>" + name + "</b> to the cart</p>";
            notifyEl.classList.add("visible");
            notifyEl.innerHTML = notifyText;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                notifyEl.classList.remove("visible");
            }, 3000);
        }
    }

    // Uppdatera DOM
    showBasket();
    showSmallBasket();
    showCheckout();
}

// Funktion för att visa varukorgen
function showBasket() {
    let basketItems = JSON.parse(localStorage.getItem("basket")) || []; 
    
    basketEl.innerHTML = ""; 

    if (basketItems.length === 0) {
        basketEl.innerHTML = "<li>The cart is empty.</li>"; 
    } else {
        basketItems.forEach(item => {
            let newItem = document.createElement("li");

            let newItemName = document.createElement("span");
            newItemName.textContent = item.artName + " (" + item.nums + " st)"; 
            newItem.appendChild(newItemName);
            newItem.classList.add("cart-item");

            let newItemPrice = document.createElement("span");
            newItemPrice.textContent = item.artCost + "€"; 
            newItem.appendChild(newItemPrice);

            let removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("remove-button");
            removeButton.onclick = function() {
                removeFromBasket(item.artId); // Ta bort produkten när man klickar på knappen
            };
            newItem.appendChild(removeButton);

            basketEl.appendChild(newItem);
        });
    }
}

// Funktion för att ta bort en produkt från varukorgen
function removeFromBasket(productId) {
    let currentBasket = JSON.parse(localStorage.getItem("basket")) || [];
    currentBasket = currentBasket.filter(item => item.artId !== productId); 
    localStorage.setItem("basket", JSON.stringify(currentBasket)); 
    showBasket();
    updateCartDisplay(); 
    updateTotalSum();
}

// Uppdatera varukorgens visning i headern
function updateCartDisplay() {
    let basketItems = JSON.parse(localStorage.getItem("basket")) || [];
    const cartButton = document.getElementById("view-cart");
    const totalItems = basketItems.reduce((total, item) => total + item.nums, 0);
    cartButton.textContent = `Cart (${totalItems})`;
}

// Funktion för att tömma varukorgen
function emptyBasket() {
    if (confirm("Are you sure you want to empty the basket?")) {
        localStorage.removeItem("basket"); 
        showBasket(); 
        showSmallBasket(); 
        showCheckout(); 
    }
}

// Funktion för att visa den lilla varukorgen (antal och summa)
function showSmallBasket() {
    if (document.getElementById("small-basket")) {
        let basketItems = JSON.parse(localStorage.getItem("basket")) || [];
        let numOfItems = basketItems.reduce((total, item) => total + item.nums, 0);
        let sum = basketItems.reduce((total, item) => total + (item.artCost * item.nums), 0);
        smallBasketEl.innerHTML = `${numOfItems}st, ${sum}€`;
    }
}

// Funktion för att visa kassan
function showCheckout() {
    if (document.getElementById("checkout")) {
        let basketItems = JSON.parse(localStorage.getItem("basket")) || [];
        checkoutEl.innerHTML = "";

        if (basketItems.length > 0) {
            let sum = 0;

            for (let i = 0; i < basketItems.length; i++) {
                let itemCost = parseInt(basketItems[i].artCost);
                let itemSumCost = 0;

                if (basketItems[i].nums > 1) {
                    let count = parseInt(basketItems[i].nums);
                    for (let j = 0; j < count; j++) {
                        sum += itemCost;
                        itemSumCost += itemCost;
                    }
                } else {
                    sum += itemCost;
                    itemSumCost = itemCost;
                }

                let artId = basketItems[i].artId;
                let artName = basketItems[i].artName;
                let numItems = basketItems[i].nums;
                let artImage = basketItems[i].artImage;

                checkoutEl.innerHTML += "<tr>" +
                    "<td><img src='" + artImage + "' alt='Produktbild för " + artName + "' />" +
                    "<td>" + artId + "</td>" +
                    "<td>" + artName + "</td>" +
                    "<td>" + numItems + " st.</td>" +
                    "<td>" + itemSumCost + "€</td>" +
                    "</tr>";
            }

            checkoutEl.innerHTML += "<tr>" +
                "<td colspan='5' class='checkout-sum'>Summa: " + sum + "€</td>";
        } else {
            checkoutEl.innerHTML = "<tr><td colspan='5'>Varukorgen är tom</td></tr>";
        }
    }
}

// Uppdatera varukorgen när sidan laddas
window.addEventListener('load', showBasket, false);


// Funktion för att uppdatera totalsumman i varukorgen
function updateTotalSum() {
    let basketItems = JSON.parse(localStorage.getItem("basket")) || [];
    let total = 0;

    // Summera alla varors pris gånger antal
    basketItems.forEach(item => {
        total += item.artCost * item.nums;
    });

    // Uppdatera totalsumman i HTML
    const totalPriceElement = document.getElementById("total-price");
    if (totalPriceElement) {
        totalPriceElement.textContent = total + "€";
    }

    // Uppdatera totalsumman även på Cart-knappen i headern
    const cartButton = document.getElementById("view-cart");
    const totalItems = basketItems.reduce((total, item) => total + item.nums, 0);
    if (cartButton) {
        cartButton.textContent = `Cart (${totalItems})`;
    }
}
// Uppdatera varukorgens display på varje sida (Cart (X) och total)
function updateCartOnEveryPage() {
    updateTotalSum();
}

function checkout() {
    alert("We have received your order!");

    localStorage.removeItem("basket");
    showBasket();
    showSmallBasket();
    showCheckout();
    updateCartDisplay();
}


// Uppdatera när sidan laddas
window.addEventListener('load', updateCartOnEveryPage, false);

// Funktionalitet för hamburgarmeny
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const closeMenu = document.querySelector('.close-menu');
    const menu = document.querySelector('.nav-links');

    // hamburgermenyn visas vid sidladdning
    hamburger.style.display = 'flex';
    closeMenu.style.display = 'none';

    // Öppna menyn
    hamburger?.addEventListener('click', () => {
        menu.classList.add('active');
        hamburger.style.display = 'none'; 
        closeMenu.style.display = 'block'; 
    });

    // Stäng menyn
    closeMenu?.addEventListener('click', () => {
        menu.classList.remove('active');
        hamburger.style.display = 'flex'; 
        closeMenu.style.display = 'none'; 
    });
});

window.addEventListener('load', () => {
    const menu = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    const closeMenu = document.querySelector('.close-menu');

    menu?.classList.remove('active');
    hamburger.style.display = 'flex';
    closeMenu.style.display = 'none';
});


function openLightbox(img) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}

