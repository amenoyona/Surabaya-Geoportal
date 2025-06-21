var map = L.map('map', {
    zoomControl: false, // Disable default zoom control
    maxZoom: 28, 
    minZoom: 1
}).fitBounds([[-7.209662951385012,112.7550954665409],[-7.1962372288105,112.7739516730216]]);

var hash = new L.Hash(map);
map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

// Custom zoom control
document.getElementById('zoom-in').addEventListener('click', function(e) {
    e.preventDefault();
    map.zoomIn();
});

document.getElementById('zoom-out').addEventListener('click', function(e) {
    e.preventDefault();
    map.zoomOut();
});

// remove popup's row if "visible-with-data"
function removeEmptyRowsFromPopupContent(content, feature) {
 var tempDiv = document.createElement('div');
 tempDiv.innerHTML = content;
 var rows = tempDiv.querySelectorAll('tr');
 for (var i = 0; i < rows.length; i++) {
     var td = rows[i].querySelector('td.visible-with-data');
     var key = td ? td.id : '';
     if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
         rows[i].parentNode.removeChild(rows[i]);
     }
 }
 return tempDiv.innerHTML;
}

// add class to format popup if it contains media
function addClassToPopupIfMedia(content, popup) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (tempDiv.querySelector('td img')) {
        popup._contentNode.classList.add('media');
            // Delay to force the redraw
            setTimeout(function() {
                popup.update();
            }, 10);
    } else {
        popup._contentNode.classList.remove('media');
    }
}

// Create base layers
map.createPane('pane_ESRISatellite_0');
map.getPane('pane_ESRISatellite_0').style.zIndex = 400;
var layer_ESRISatellite_0 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    pane: 'pane_ESRISatellite_0',
    opacity: 1.0,
    attribution: '',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
});

map.createPane('pane_OSMStandard_1');
map.getPane('pane_OSMStandard_1').style.zIndex = 401;
var layer_OSMStandard_1 = L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    pane: 'pane_OSMStandard_1',
    opacity: 1.0,
    attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, CC-BY-SA</a>',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});

// Add default base layer
map.addLayer(layer_ESRISatellite_0);

// Style and add the main data layer
function pop_KualitasAirTambak_2(feature, layer) {
    var popupContent = '<table>\
            <tr>\
                <th scope="row">Luas Area Tambak</th>\
                <td>' + (feature.properties['Luas_Area'] !== null ? autolinker.link(String(feature.properties['Luas_Area']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Indeks Kualitas Air Tambak</th>\
                <td>' + (feature.properties['IP__Indeks'] !== null ? autolinker.link(String(feature.properties['IP__Indeks']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Keterangan</th>\
                <td>' + (feature.properties['Status'] !== null ? autolinker.link(String(feature.properties['Status']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_KualitasAirTambak_2_0(feature) {
    if (feature.properties['IP__Indeks'] >= 0.000000 && feature.properties['IP__Indeks'] <= 0.000000 ) {
        return {
        pane: 'pane_KualitasAirTambak_2',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(255,255,255,1.0)',
        interactive: true,
    }
    }
    if (feature.properties['IP__Indeks'] >= 0.000000 && feature.properties['IP__Indeks'] <= 1.000000 ) {
        return {
        pane: 'pane_KualitasAirTambak_2',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(255,128,128,1.0)',
        interactive: true,
    }
    }
    if (feature.properties['IP__Indeks'] >= 1.000000 && feature.properties['IP__Indeks'] <= 1.814000 ) {
        return {
        pane: 'pane_KualitasAirTambak_2',
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(255,0,0,1.0)',
        interactive: true,
    }
    }
}

map.createPane('pane_KualitasAirTambak_2');
map.getPane('pane_KualitasAirTambak_2').style.zIndex = 402;
map.getPane('pane_KualitasAirTambak_2').style['mix-blend-mode'] = 'normal';
var layer_KualitasAirTambak_2 = new L.geoJson(json_KualitasAirTambak_2, {
    attribution: '',
    interactive: true,
    dataVar: 'json_KualitasAirTambak_2',
    layerName: 'layer_KualitasAirTambak_2',
    pane: 'pane_KualitasAirTambak_2',
    onEachFeature: pop_KualitasAirTambak_2,
    style: style_KualitasAirTambak_2_0,
});

map.addLayer(layer_KualitasAirTambak_2);

// Layer control
var overlaysTree = [
    {label: 'Kualitas Air Tambak', layer: layer_KualitasAirTambak_2},
    {label: "OSM Standard", layer: layer_OSMStandard_1},
    {label: "ESRI Satellite", layer: layer_ESRISatellite_0},
];

var lay = L.control.layers.tree(null, overlaysTree, {
    collapsed: false,
    container: document.getElementById('layer-control')
});

lay.addTo(map);

// Download GeoJSON function
function downloadGeoJSON() {
    var geojsonData = layer_KualitasAirTambak_2.toGeoJSON();
    var blob = new Blob([JSON.stringify(geojsonData)], {type: "application/vnd.geo+json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = "Kualitasair.geojson";
    a.click();
    URL.revokeObjectURL(url);
}