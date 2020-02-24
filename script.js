
var index = 0;
var interval;
var mySlides = document.getElementsByClassName("slide");
function nextSlide(){
  mySlides[index].className = 'slide';
  ++index;
  if(index === 3){
       index = 0;
   }
  mySlides[index].className = 'slide appear ';
}

function startSlide(){
    interval = setInterval(nextSlide,2000);
}

function stopSlide(){
    clearInterval(interval);
}



var map;
var geocoder;
var directionsService;
var directionsRenderer;
var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
var markersArray = [];

function initMap() {
  directionsService = new google.maps.DirectionsService;
  directionsRenderer = new google.maps.DirectionsRenderer({
    draggable: true,
    map: map,
    panel: document.getElementById('left-panel'),
  });
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.9727, lng: -93.23540000000003},
    zoom: 14
  });
  var dest = document.getElementById('destination');
  dest = new google.maps.places.SearchBox(dest);
  
}

function init() {
  var origin = {lat: 44.9727, lng: -93.23540000000003};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: origin
  });
  var clickHandler = new ClickEventHandler(map, origin);
}

var ClickEventHandler = function(map, origin) {
  this.origin = origin;
  this.map = map;
  this.placesService = new google.maps.places.PlacesService(map);
  this.map.addListener('click', this.handleClick.bind(this));
};

ClickEventHandler.prototype.handleClick = function(event) {
    var place_Id = event.placeId;
    this.placesService.getDetails({placeId: place_Id}, function(place, status){
      if(status == 'OK'){
        console.log(place.formatted_address);
        document.getElementById('addressTextField').value = place.formatted_address;
      }
    });
};


function show(){
var location1 = document.getElementById('address-1').innerHTML;
var location2= document.getElementById('address-2').innerHTML;
var location3 = document.getElementById('address-3').innerHTML;
var locations = [location1,location2,location3];
for(var i = 0; i<3; i++){
  codeAddress(locations[i]);
}
}

function codeAddress(location){
  geocoder.geocode( { 'address': location}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: image,
      });
      var infoWindow = new google.maps.InfoWindow({
        content: location
      });
      markersArray.push(marker);
      marker.addListener('click', function(){
        infoWindow.open(map, marker);
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

function setValue(val) {
  if(val == "others"){
    document.getElementById('others').removeAttribute("disabled");
  }
  else{
    document.getElementById('others').setAttribute("disabled",true);
  }
  return val;
}

function startSearch(){
  clearOverlays();
  var e= document.getElementById("places");
  var result = e.options[e.selectedIndex].innerHTML;
  var service = new google.maps.places.PlacesService(map);
  var campus ={lat: 44.9727, lng: -93.23540000000003};
  var meters = document.getElementById('radius').value;
  if(result == 'others'){
    var text = document.getElementById('others').value;
    service.nearbySearch(
      {location: campus, radius: meters, keyword: text},
      function(results, status, pagination) {
        if (status !== 'OK') 
          return;
        createMarkers(results);
      });
  }
  else{
    service.nearbySearch(
    {location: campus, radius: meters, type: result},
    function(results, status, pagination) {
      if (status !== 'OK') 
        return;
      createMarkers(results);
    });
  }
}

function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, place; place = places[i]; i++) {
    var image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    var marker = new google.maps.Marker({
      map: map,
      title: place.name,
      position: place.geometry.location,
    });    
    showLocation(marker);
    markersArray.push(marker);
    bounds.extend(place.geometry.location);
  }
  map.fitBounds(bounds);
}

function showLocation(marker){
  var infoWindow = new google.maps.InfoWindow({
    content: marker.title
  });  
  marker.addListener('mouseover', function(){
    infoWindow.open(map, marker);
  });
   marker.addListener('mouseout', function(){
     infoWindow.close();
  });
}

function getLocation() {
  clearOverlays();
  document.getElementById('left-panel').setAttribute("style", "display:block;")
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    alert ("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  var x = position.coords.latitude;
  var y = position.coords.longitude;
  directionsRenderer.map = map;
  directionsRenderer.addListener('directions_changed', function() {
    computeTotalDistance(directionsRenderer.getDirections());
  });
  
  var dest = document.getElementById('destination').value;

  displayRoute(x,y, dest, directionsService, directionsRenderer);
}

function displayRoute(x,y,destination, service, display) {
  var type = document.querySelector('input[name = "button"]:checked').value;
  service.route({
    origin: {lat: +x, lng: +y},
    destination: destination,
    travelMode: type,
    avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      display.setDirections(response);
    } else {
      alert('Could not display directions due to: ' + status);
    }
  });
}

function computeTotalDistance(result) {
  var total = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;
  document.getElementById('total').innerHTML = total + ' km';
}













