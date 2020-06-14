
// Perform a GET request to the query URL
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  
  createMapAndFeatures(data.features);
});

function setFeatureStyle(feature, layer) {
  
  function getMagnitude(magnitude){
      return magnitude * 5;
  }

  console.log(feature)

  var map_style = {
    radius: getMagnitude(feature.properties.mag),
    fillColor: getColor(feature.properties.mag),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  }

  console.log(map_style)

  return map_style
}

function createMapAndFeatures(earthquakeData) {
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng)
    },
    style: setFeatureStyle,
    OnEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  })

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function getColor(magcolor){
  switch(true){
      case magcolor >5:
          return "white";
      case magcolor >4:
          return "green";
      case magcolor >3:
          return "yellow";
      case magcolor >2:
          return "orange";
      case magcolor >1:
          return "red"
      default:
          return "blue";
    }
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: API_KEY
    });

  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,  
    id: "mapbox/dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
      center: [
        0, 0
      ],
      zoom: 2,
      layers: [streetmap, earthquakes]
  });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

      
  // The details for the legend
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {    
  var div = L.DomUtil.create("div", "info legend");
  var grades = [0,1,2,3,4,5], labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];   
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
           grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(map);
}

