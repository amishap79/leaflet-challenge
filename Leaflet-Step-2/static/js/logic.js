
function loadEarthquakeMap() {
  console.log("starting...")
  var earthquakes;
  var tectonicplates;
  
  try {
      d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
      .then ( (data) => {
          earthquakes = createEarthquakeMap(data.features);
          console.log(earthquakes)

          d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
          .then ( (plates) => {
            tectonicplates = createPlateMap(plates.features);
            console.log(tectonicplates)
          })
          .then ( () => {
            createMap(earthquakes, tectonicplates);
          });
      })
    } catch (error) {
      alert("Unable to load data: Error is: " +  error)
    }
  
}
  

function setFeatureStyle(feature, layer) {
  
  function getMagnitude(magnitude){
      return magnitude * 5;
  }

  var map_style = {
    radius: getMagnitude(feature.properties.mag),
    fillColor: getColor(feature.properties.mag),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  }

  return map_style
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

function createEarthquakeMap(earthquakeData) {
  
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

   return earthquakes;
}

function createPlateMap(tectonicPlateData) {
  var geoJsonPlates= []

  for(var i = 0; i < tectonicPlateData.length; i++) {
    const plate = tectonicPlateData[i];
    geoJsonPlates.push(plate.geometry)  
  }
  
  console.log(geoJsonPlates)

  var tectonicPlateStyle = {
    "color": "red",
    "weight": 2,
    "opacity": 0.65
  }

  var plates = L.geoJSON(geoJsonPlates, {
    style: tectonicPlateStyle
  })

  console.log(plates)
  return plates

  // for(var i = 0; i < tectonicPlateData.length; i++) {

  //   const geometry = tectonicPlateData[i].geometry;
  //   console.log(geometry)
  //   const geometryMap = geometry.map(data => geoJsonPlates.push(data.geometry.coodinates))
  //   console.log(geometryMap)

  // }
}


// function createPlateMap(tectonicPlateData) {
//   var geoJsonPlates = []
//   console.log(tectonicPlateData)

//   // for(var i = 0; i < tectonicPlateData.length; i++) {

//   //   geometry = tectonicPlateData[i].geometry
//   //   geometryType = geometry.type
//   //   geometryCoordinate = [];

//   //   for(var j = 0; j < geometry.coordintes; j ++) {
//   //     geometryCoordinate.push(geometry.coordintes[j])
//   //     console.log(geometryCoordinate);
//   //   }

//   // }

//   for(var i = 0; i < tectonicPlateData.length; i++) {
//     geometry = tectonicPlateData[i].geometry
//     console.log(geometry);

//     var tectonicPlateStyle = new L.polyline( {
//       "color": "red",
//       "weight": 5,
//       "opacity": 0.65
//     });
  
  
//     L.geoJSON(geoJsonPlates, {
//       style: tectonicPlateData
//     })
//   }


//   console.log("creating plate map")

  

//   return geoJsonPlates;
// }


function createMap(earthquakes, tectonicplates) {

  // Define streetmap and darkmap layers
  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/satellite-v8',
    accessToken: API_KEY
    });

  var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,  
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,  
    id: "mapbox/outdoors-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": light,
    "Outside": outdoors
  };

  // Create overlay object to hold our overlay layer
  var layerGroup = L.layerGroup([earthquakes, tectonicplates])
  
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicplates
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
      center: [
        0, 0
      ],
      zoom: 2,
      layers: [satellite, layerGroup]
  });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
  console.log("adding to map")
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

// document.getElementById("loadBody").addEventListener("load", (event) => {
//   console.log("loading...")
//   
// })

document.addEventListener("DOMContentLoaded", () => {
  loadEarthquakeMap()
});