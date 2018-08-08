let alertMessage = '<div class="alert alert-danger alert-dismissible"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Error!</strong> message.</div>';
let card = '<div class="alert alert-info"><strong><a href="#">message.</a></strong></div>';
const mapArea = document.getElementById('map');
const actionBtn = document.getElementById('showMe');
const locationsAvailable = document.getElementById('locationList');
//const __KEY = 'AIzaSyB5HPHDuN2eINsYfCydLLb0kUINeuCQHPs';
const __KEY = 'AIzaSyBGCql0HlN4C_D7B2BcIIhtuFvjrdfvoew';

let Gmap;
let Gmarker;
const options = { enableHighAccuracy: true };
actionBtn.addEventListener('click', e => {
    const loadingText = '<i class="fas fa-spinner"></i> Loading...';
    actionBtn.innerHTML = loadingText;
    getLocation();
});
displayLocation = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const latlng = { lat, lng };
    showMap(latlng);
    createMarker(latlng);
    mapArea.style.display = "block";
    getGeolocation(lat, lng);
}
getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation, showError, options);
    }
    else {
        locationsAvailable.appendChild(alertMessage.replace('message', 'Your browser does not support geolocation'));
    }
}
showError = (error) => {
    mapArea.style.display = "block";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            mapArea.innerHTML = alertMessage.replace('message', 'You denied the request for your location.');
            break;
        case error.POSITION_UNAVAILABLE:
            mapArea.innerHTML = alertMessage.replace('message', 'Your Location information is unavailable.');
            break;
        case error.TIMEOUT:
            mapArea.innerHTML = alertMessage.replace('message', 'Your request timed out. Please try again.');
            break;
        case error.UNKNOWN_ERROR:
            mapArea.innerHTML = alertMessage.replace('message', 'An unknown error occurred please try again after some time.');
            break;
    }
}
showMap = (latlng) => {
    let mapOptions = {
        center: latlng,
        zoom: 17
    };
    Gmap = new google.maps.Map(mapArea, mapOptions);
}
createMarker = (latlng) => {
    let makerOptions = {
        position: latlng,
        map: Gmap,
        animation: google.maps.Animation.BOUNCE,
        clickable: true
    };
    Gmarker = new google.maps.Marker(makerOptions);
}
getGeolocation = (lat, lng) => {
    const latlng = lat + ',' + lng;
    console.log(latlng);
    fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=' + __KEY)
        .then(res => res.json())
        .then(data => populateCard(data.results));
    return false;
}


populateCard = (geoResults) => {
    console.log(geoResults);
    geoResults.map(geoResults => {
        let addressCard = document.createElement('div');
        addressCard.setAttribute('id', geoResults.place_id);
        addressCard.innerHTML = card.replace('message', geoResults.formatted_address);
        addressCard.addEventListener('click', () => cardClick(geoResults));
        return (
            locationsAvailable.appendChild(addressCard)
        );
    });
    actionBtn.style.display = 'none';

}
cardClick = (result) => {
    document.getElementById('frmShipping').reset();
    let address = document.getElementById('txtDeatailAddress'),
        locality = document.getElementById('txtLocality'),
        city = document.getElementById('txtCity'),
        pin = document.getElementById('txtPin'),
        landmark = document.getElementById('txtLandmark'),
        state = document.getElementById('txtState');

    result.address_components.map(component => {
        const types = component.types;
        if (types.includes('postal_code')) {
            pin.value = component.long_name;
        }
        if (types.includes('locality')) {
            locality.value = component.long_name;
        }
        if (types.includes('administrative_area_level_2')) {
            city.value = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            state.value = component.long_name;
        }
        if (types.includes('point_of_interest')) {
            landmark.value = component.long_name;
        }

    });
    address.value = result.formatted_address;
    locationsAvailable.innerHTML = '';
    actionBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>Use my location</button>';
    actionBtn.style.display = 'block';
}