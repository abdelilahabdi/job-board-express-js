import { getData } from "./utils/data.js";
import { getFavorites, toggleFavorite, getApplications, saveApplication, removeApplication } from "./utils/storage.js";

const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');

if (!offerId) {
    window.location.href = '../index.html'; 
}

const allOffers = await getData();
const offer = allOffers.find(item => String(item.id) === String(offerId));

if (!offer) {
    document.body.innerHTML = "<h2>Offer not found!</h2>";
} else {
    renderOfferDetails(offer);
}

function renderOfferDetails(offer) {
        
    const companyName = document.querySelector('.company-details h3');
    if (companyName) companyName.textContent = offer.company;

    const companyLogo = document.querySelector('.company-logo');
    if (companyLogo) companyLogo.textContent = offer.company[0];

    const companyLocation = document.querySelector('.company-details p');
    if (companyLocation) companyLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${offer.city}`;

      
    const jobTitle = document.querySelector('.job-title');
    if (jobTitle) jobTitle.textContent = offer.title;

    
    const currentBreadcrumb = document.querySelector('.breadcrumb .current');
    if (currentBreadcrumb) currentBreadcrumb.textContent = offer.title;

    
    const tagsContainer = document.querySelector('.tags-container');
    if (tagsContainer && offer.technologies) {
        tagsContainer.innerHTML = '';
        offer.technologies.forEach(tech => {
            const span = document.createElement('span');
            span.classList.add('tag');
            span.textContent = tech;
            tagsContainer.appendChild(span);
        });
    }

        
    const descriptions = document.querySelectorAll('.description-text');
    if (descriptions[0]) descriptions[0].textContent = offer.fullDescription || offer.shortDescription;
    if (descriptions[1]) descriptions[1].textContent = offer.profile || "No specific profile specified.";

    
    const summaryValues = document.querySelectorAll('.summary-value');
    if (summaryValues.length >= 4) {
        summaryValues[0].textContent = offer.contractType;
        summaryValues[1].textContent = offer.city;
        summaryValues[2].textContent = "6 months";
        summaryValues[3].textContent = offer.company;
    }

    
    const saveBtn = document.querySelector('.btn-outline');
    if (saveBtn) {
        updateSaveButtonState(saveBtn, offer.id);
        
        saveBtn.addEventListener('click', () => {
            toggleFavorite(offer.id);
            updateSaveButtonState(saveBtn, offer.id);
        });
    }

        
    const applyBtn = document.querySelector('.apply-card .btn-primary');
    if (applyBtn) {
        updateApplyButtonState(applyBtn, offer.id);

        applyBtn.addEventListener('click', () => {
            const apps = getApplications().map(item => String(item));
            const isApplied = apps.includes(String(offer.id));

            if (isApplied) {
                // Ila kan déjà 'Applied', ghadi ymss7o w yrej3o 'Apply'
                removeApplication(offer.id);
            } else {
                // Ila kan 'Apply', ghadi ysauvgardi l-application w yft7 l-lien/email
                saveApplication(offer.id);

                if (offer.applyUrl) {
                    window.open(offer.applyUrl, '_blank');
                } else if (offer.email) {
                    window.location.href = `mailto:${offer.email}`;
                }
            }

            // Update l-état dyal l-bouton f l-blassa
            updateApplyButtonState(applyBtn, offer.id);
        });
    }
}

function updateSaveButtonState(button, id) {
    const favorites = getFavorites().map(item => String(item));
    const isSaved = favorites.includes(String(id));
    
    if (isSaved) {
        button.innerHTML = `<i class="fa-solid fa-heart" style="color: #EF4444;"></i> Saved`;
        button.classList.add('saved');
    } else {
        button.innerHTML = `<i class="fa-regular fa-heart"></i> Save`;
        button.classList.remove('saved');
    }
}

function updateApplyButtonState(button, id) {
    const apps = getApplications().map(item => String(item));
    const isApplied = apps.includes(String(id));

    if (isApplied) {
        button.innerHTML = `Applied <i class="fa-solid fa-check"></i>`;
        button.style.backgroundColor = "#10B981";
    } else {
        button.innerHTML = `Apply <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i>`;
        button.style.backgroundColor = ""; // Yrejje3 l-couleur d-origin f CSS
    }
}

