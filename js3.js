// Inisialisasi peta dengan fokus pada Keputih, Surabaya
const map = L.map('map').setView([-7.2886, 112.7946], 15);

// Layer groups untuk setiap dataset
const layerGroups = {
    jalanutama: L.layerGroup(),
    jalanalternatif: L.layerGroup(),
    titikkemacetan: L.layerGroup(),
    infrastruktur: L.layerGroup()
};

// Basemap layers
const basemaps = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>'
    })
};

// Set default basemap
basemaps.osm.addTo(map);

// Add all layer groups to map
Object.values(layerGroups).forEach(group => group.addTo(map));

// Sample data generator (karena file shp tidak dapat diload langsung)
function generateSampleData() {

    // Generate Jalan Alternatif
    const jalanAlternatif = [];
    for (let i = 0; i < 6; i++) {
        const start = [
            -7.2886 + (Math.random() - 0.5) * 0.015,
            112.7946 + (Math.random() - 0.5) * 0.015
        ];
        const end = [
            start[0] + (Math.random() - 0.5) * 0.008,
            start[1] + (Math.random() - 0.5) * 0.008
        ];
        
        const line = L.polyline([start, end], {
            color: '#2ECC71', // Modern green
            weight: 4,
            opacity: 0.7,
            dashArray: '8, 8' // Slightly more prominent dashes
        }).bindPopup(`
            <b>Jalan Alternatif Keputih ${i + 1}</b><br>
            Tipe: Jalan Sekunder<br>
            Status: Alternatif<br>
            Kondisi: ${ Math.random() > 0.5 ? 'Baik' : 'Sedang'}<br>
            Lebar: ${(Math.random() * 6 + 4).toFixed(1)} meter
        `);
        
        jalanAlternatif.push(line);
        layerGroups.jalanalternatif.addLayer(line);
    }

    // Generate Titik Kemacetan
    const titikKemacetan = [];
    for (let i = 0; i < 5; i++) {
        const point = [
            -7.2886 + (Math.random() - 0.5) * 0.01,
            112.7946 + (Math.random() - 0.5) * 0.01
        ];
        
        const severity = ['Ringan', 'Sedang', 'Berat'][Math.floor(Math.random() * 3)];
        const colors = { 'Ringan': '#F39C12', 'Sedang': '#E67E22', 'Berat': '#C0392B' }; // More vibrant
        
        const marker = L.circleMarker(point, {
            radius: 10,
            fillColor: colors[severity],
            color: '#fff', // White border for contrast
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).bindPopup(`
            <b>Titik Kemacetan Keputih ${i + 1}</b><br>
            Tingkat: ${severity}<br>
            Lokasi: Sekitar Keputih<br>
            Waktu Peak: ${Math.floor(Math.random() * 3) + 7}:00 - ${Math.floor(Math.random() * 3) + 17}:00<br>
            Durasi Rata-rata: ${Math.floor(Math.random() * 60 + 15)} menit
        `);
        
        titikKemacetan.push(marker);
        layerGroups.titikkemacetan.addLayer(marker);
    }

    // Generate Infrastruktur
    const infrastruktur = [];
    const infraTypes = ['Halte Bus', 'Fasilitas Umum', 'Penyeberangan', 'Lampu Lalu Lintas', 'SPBU', 'Sekolah', 'Rumah Sakit'];
    const icons = {
        'Halte Bus': 'bus',
        'Fasilitas Umum': 'building',
        'Penyeberangan': 'walk',
        'Lampu Lalu Lintas': 'traffic-light',
        'SPBU': 'gas-pump',
        'Sekolah': 'school',
        'Rumah Sakit': 'hospital'
    };

    for (let i = 0; i < 15; i++) {
        const point = [
            -7.2886 + (Math.random() - 0.5) * 0.012,
            112.7946 + (Math.random() - 0.5) * 0.012
        ];
        
        const type = infraTypes[Math.floor(Math.random() * infraTypes.length)];
        
        const marker = L.marker(point, {
            icon: L.divIcon({
                html: `<div style="background: #3498DB; color: white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><i class="fas fa-${icons[type]}"></i></div>`,
                iconSize: [38, 38],
                className: 'custom-div-icon'
            })
        }).bindPopup(`
            <b>${type} Keputih ${i + 1}</b><br>
            Tipe: ${type}<br>
            Lokasi: Area Keputih<br>
            Status: ${ Math.random() > 0.15 ? 'Operasional' : 'Maintenance'}<br>
            ${type === 'Halte Bus' ? 'Rute: A, B, C' : ''}
            ${type === 'SPBU' ? 'Jenis BBM: Premium, Pertamax' : ''}
            ${type === 'Sekolah' ? 'Akreditasi: A' : ''}
            ${type === 'Rumah Sakit' ? 'Layanan: IGD, Rawat Inap' : ''}
        `);
        
        infrastruktur.push(marker);
        layerGroups.infrastruktur.addLayer(marker);
    }

    // Update counters
    document.getElementById('count-jalanutama').textContent = jalanUtama.length;
    document.getElementById('count-jalanalternatif').textContent = jalanAlternatif.length;
    document.getElementById('count-titikkemacetan').textContent = titikKemacetan.length;
    document.getElementById('count-infrastruktur').textContent = infrastruktur.length;
}

// Layer control
document.querySelectorAll('.layer-item').forEach(item => {
    const checkbox = item.querySelector('.layer-checkbox');
    const layerName = item.dataset.layer;
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(layerGroups[layerName]);
        } else {
            map.removeLayer(layerGroups[layerName]);
        }
    });
});

// Basemap control
document.querySelectorAll('.basemap-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelector('.basemap-btn.active').classList.remove('active');
        this.classList.add('active');
        
        const basemapType = this.dataset.basemap;
        
        // Remove current basemap
        map.eachLayer(layer => {
            // Check if the layer is one of the basemaps
            if (Object.values(basemaps).includes(layer)) {
                map.removeLayer(layer);
            }
        });
        
        // Add new basemap
        basemaps[basemapType].addTo(map);
    });
});

// Mouse coordinate tracking
map.on('mousemove', function(e) {
    const coords = e.latlng;
    document.getElementById('coordinates').textContent = 
        `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
});

// Initialize sample data with loading animation
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'flex'; // Show loading screen
    
    setTimeout(() => {
        generateSampleData();
        loadingElement.style.display = 'none'; // Hide loading screen
    }, 1500); // Simulate network delay
});

// Feature click events for info display (This will work for layers that have popups)
map.on('popupopen', function(e) {
    const popupContent = e.popup.getContent();
    document.getElementById('featureInfo').innerHTML = popupContent;
    document.getElementById('infoBox').style.display = 'block';
});

map.on('popupclose', function() {
    document.getElementById('infoBox').style.display = 'none';
});

// Fullscreen control
const fullscreenControl = L.control({position: 'topright'});
fullscreenControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');
    div.innerHTML = '<a class="leaflet-control-zoom-in" href="#" title="Full Screen" role="button" aria-label="Full Screen"><i class="fas fa-expand-arrows-alt"></i></a>';
    div.onclick = function(e) {
        e.stopPropagation(); // Prevent map click through
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    };
    return div;
};
fullscreenControl.addTo(map);