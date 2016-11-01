$(() => {
  console.log("JS Loaded");
  let $mapDiv = $('#map');

  let map = new google.maps.Map($mapDiv[0],{
    center: { lat:51, lng: -0.1 },
    zoom: 14
  });

  navigator.geolocation.getCurrentPosition((position) =>{
    let latLng = {
     lat:position.coords.latitude,
     lng: position.coords.longitude
  };

  map.panTo(latLng);
  map.setZoom(16);

  let marker = new google.maps.Marker({
    position: latLng,
    animation: google.maps.Animation.DROP,
    draggable: true,
    map
    });
  });
});
