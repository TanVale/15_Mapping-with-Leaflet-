const URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
console.log(URL);

const RADIUS_MIN = 5;
const RADIUS_COEF = 5;
const COLOR_DEPTHS = [10, 30, 50, 70, 90];


// Creating the map object
let myMap = L.map("map", {
    center: [38.84, -122.84],
    zoom: 5
});
  


// Function to create the map
// async function createMap(earthquakeMap) {
//     let tectonicPlates = new L.layerGroup() 
//     let tectonicUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

//     await d3.json(tectonicUrl).then(plates => {
//         L.geoJson(plates, {
//             color: 'orange',
//             weight: 2
//         }).addTo(tectonicPlates)
//     });

// Adding the tile layer

let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
//     maxZoom: 20,
//     subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
// });

// // Create a baseMaps object to hold the streetmap layer.
// let baseMaps = {
//     "Street Map": streetmap,
//     "Satellite": googleSat
// };

//   // Create an overlayMaps object to hold the Earthquakes layer.
//   let overlayMaps = {
//     "Earthquakes": earthquakeMap,
//     "Tectonic Plates": tectonicPlates
// };

// // Create the map object with options.
// let myMap = L.map("map-id", {
//     center: [38.84, -122.84], 
//     zoom: 5, 
//     layers: [streetmap, earthquakeMap]
// });

// // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
// L.control.layers(baseMaps, overlayMaps, {
//     collapsed: false,
//     position: "topleft"
// }).addTo(myMap);

function getRadius(feature){
    let magnitude = feature.properties.mag;
    // console.log(magnitude);
    let radiusCalc = magnitude* RADIUS_COEF;
    return Math.max(radiusCalc, RADIUS_MIN);
}

function getColor(depth){

    if (depth < COLOR_DEPTHS[0]) {
        return "#00ff00";
    }
    else if (depth < COLOR_DEPTHS[1]) {
            return "#c3f948";
    } 
    else if (depth < COLOR_DEPTHS[2]) {
        return "#f9e448";
    }
    else if (depth < COLOR_DEPTHS[3]) {
        return "#f9aa48";
    }
    else if (depth < COLOR_DEPTHS[4]) {
        return "#eb6505";
    }
    else {
        return "#eb051f"
    }
    
}

// Create a point to layer function
function pointToLayerFunc(feature, coord) {
    let circleMarkerOptions = {
        radius: getRadius(feature),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "black",
        opacity: 1,
        fillOpacity: .6,
        weight: 1
    };
    return L.circleMarker(coord, circleMarkerOptions)
}

// Create and bind a popup for each feature
function onEachFeatureFunc(feature, layer) {
    console.log(feature);
    const dt= new Date(feature.properties.time)
    let popHTML= `
    <h2>${feature.properties.place}</h2>
<hr>
<p>Magnitude: ${feature.properties.mag}</p>
<p>Depth: ${feature.geometry.coordinates[2]}km</p>
<p>Time: ${dt}</p>
    `;
    layer.bindPopup(popHTML);
}


// Grab the data with d3
  d3.json(URL).then(function (response) {
    let geoJSONOptions = {
        "pointToLayer": pointToLayerFunc,
        "onEachFeature": onEachFeatureFunc
    };
    L.geoJSON(response.features, geoJSONOptions).addTo(myMap);

      
  });


// Create a legend providing context for map data
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label 
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
