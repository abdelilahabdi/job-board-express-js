export function getFavorites() {
  const data = localStorage.getItem('favorites');
  return data ? JSON.parse(data) : [] ;


}




export function toggleFavorite(offerId){
    let favorites = getFavorites().map(item => String(item));

    const id = String(offerId);

    
    
    if (favorites.includes(id)) {
       favorites = favorites.filter(item => item !== id);

    }else {
        favorites.push(id) ;
    }

    const uniqueFavorites = [...new Set(favorites)];

    localStorage.setItem('favorites', JSON.stringify(uniqueFavorites)); //save changer f browser



    
}


export function getApplications() {
    const data = localStorage.getItem('applications');
    return data ? JSON.parse(data) : [];
}

export function saveApplication(offerId) {
    let apps = getApplications().map(item => String(item));
    const id = String(offerId);
    
    if (!apps.includes(id)) {
        apps.push(id);
        localStorage.setItem('applications', JSON.stringify(apps));
    }
}


export function removeApplication(offerId) {
    let apps = getApplications().map(item => String(item));
    const id = String(offerId);
    
    
    // remove this offre
    apps = apps.filter(item => item !== id);
    
    localStorage.setItem('applications', JSON.stringify(apps));
}