// Inisialisasi peta
var map = L.map('map').setView([-7.250445, 112.768845], 13);
var baseMaps = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps'
  })
};
baseMaps["Google Satellite"].addTo(map);
L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);

var shapefileLayers = [];
var currentFeatures = [];
var fullGeoJSONData = null; // Variabel global untuk menyimpan data GeoJSON
var qualityCounts = {
  good: 0,
  medium: 0,
  unknown: 0
};

// Fungsi untuk mengonversi nama atribut menjadi lebih mudah dibaca (untuk popup)
function formatAttributeName(name) {
  if (!name) return '';
  let formatted = name.replace(/_/g, ' ');
  formatted = formatted.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  return formatted;
}

// Fungsi untuk membuat popup content dengan ikon
function createPopupContent(properties) {
  return `
    <div class="popup-content">
      <h3 class="popup-header"><i class="fas fa-info-circle"></i> Informasi Tambak</h3>
      <table class="popup-table">
        ${Object.entries(properties)
          .filter(([k, v]) => k !== 'Shape_Leng' && k !== 'Shape_Area')
          .map(([k, v]) => `<tr><td>${formatAttributeName(k)}</td><td>${v}</td></tr>`).join('')}
      </table>
    </div>`;
}

// Fungsi untuk menghitung jumlah kualitas air
function updateQualityCounts() {
  qualityCounts = { good: 0, medium: 0, unknown: 0 };
  currentFeatures.forEach(feature => {
    const status = feature.properties?.Status;
    if (status === "Baik (Memenuhi)") qualityCounts.good++;
    else if (status === "Cemar Ringan") qualityCounts.medium++;
    else qualityCounts.unknown++;
  });
  const countElements = {
    good: document.getElementById('count-good'),
    medium: document.getElementById('count-medium'),
    unknown: document.getElementById('count-unknown')
  };
  Object.entries(countElements).forEach(([key, element]) => {
    if (element) element.textContent = qualityCounts[key];
  });
}

// Fungsi untuk memproses file GeoJSON dan menampilkannya di peta
function processGeoJSON(geojson, fileName) {
  fullGeoJSONData = geojson;
  if (geojson.features) {
    currentFeatures = geojson.features;
  }
  var layer = L.geoJSON(geojson, {
    style: feature => {
      const status = feature.properties?.Status;
      let fillColor = '#9e9e9e';
      if (status === "Baik (Memenuhi)") fillColor = "#4caf50";
      else if (status === "Cemar Ringan") fillColor = "#ff9800";
      return { color: "#333", weight: 1.5, fillColor, fillOpacity: 0.7 };
    },
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 8, fillColor: "#0288d1", color: '#000', weight: 1, opacity: 1, fillOpacity: 0.8
    })
  });
  layer.eachLayer(function(l) {
    if (l.feature.properties) {
      const popup = createPopupContent(l.feature.properties);
      l.bindPopup(popup, { autoPan: true, maxWidth: 300 });
      l.on('click', e => map.panTo(e.latlng));
    }
  });
  shapefileLayers.push(layer);
  layer.addTo(map);
  map.fitBounds(layer.getBounds());
  updateQualityCounts();
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => loadingElement.style.display = 'none', 800);
  }
}

async function loadShapefilesFromFolder() {
  try {
    const folderPath = 'Tambakk';
    const shpFile = `${folderPath}/Tambakkkk.shp`;
    const dbfFile = `${folderPath}/Tambakkkk.dbf`;
    const fetchSHP = fetch(shpFile).then(res => { if (!res.ok) throw new Error(`SHP file error: ${res.statusText}`); return res.arrayBuffer(); });
    const fetchDBF = fetch(dbfFile).then(res => { if (!res.ok) throw new Error(`DBF file error: ${res.statusText}`); return res.arrayBuffer(); });
    let fetchSHX = fetch(`${folderPath}/Tambakkkk.shx`).then(res => res.ok ? res.arrayBuffer() : null).catch(() => null);
    let fetchPRJ = fetch(`${folderPath}/Tambakkkk.prj`).then(res => res.ok ? res.text() : null).catch(() => null);
    const [shpData, dbfData, shxData, prjData] = await Promise.all([fetchSHP, fetchDBF, fetchSHX, fetchPRJ]);
    const geojson = await shp.parseShp(shpData, prjData);
    const dbfParsed = await shp.parseDbf(dbfData);
    const combinedData = shp.combine([geojson, dbfParsed]);
    processGeoJSON(combinedData, "Tambakk (Auto)");
  } catch (error) {
    console.error("Error loading shapefile:", error);
    alert(`Gagal memuat file shapefile: ${error.message}`);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

// ========= FUNGSI BARU UNTUK MEMBERSIHKAN NAMA KOLOM =========
/**
 * Membersihkan properti fitur agar sesuai dengan batasan Shapefile (DBF).
 * Nama kolom diubah menjadi uppercase, spasi diganti '_', dan dipotong maksimal 10 karakter.
 * @param {Array} features - Array dari fitur GeoJSON.
 * @returns {Array} Array fitur GeoJSON baru dengan properti yang sudah bersih.
 */
function sanitizePropertiesForShapefile(features) {
    return features.map(feature => {
        const newProperties = {};
        if (feature.properties) {
            for (const key in feature.properties) {
                // 1. Ganti spasi dan karakter tidak valid dengan '_'
                // 2. Ambil 10 karakter pertama
                // 3. Ubah menjadi huruf besar
                let sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 10).toUpperCase();
                
                // Hindari duplikasi nama kolom setelah dipotong
                let finalKey = sanitizedKey;
                let counter = 1;
                while (newProperties.hasOwnProperty(finalKey)) {
                    finalKey = sanitizedKey.substring(0, 9) + counter;
                    counter++;
                }
                
                // Bersihkan nilai properti - pastikan tidak null/undefined dan dalam format yang valid
                let value = feature.properties[key];
                if (value === null || value === undefined) {
                    value = '';
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                } else {
                    value = String(value);
                }
                
                newProperties[finalKey] = value;
            }
        }
        // Kembalikan fitur dengan geometri yang sama tetapi properti baru
        return {
            ...feature,
            properties: newProperties
        };
    });
}

// === FUNGSI-FUNGSI UNTUK DOWNLOAD ===

function downloadGeoJSON() {
  if (!currentFeatures || currentFeatures.length === 0) {
    alert("Tidak ada data untuk diunduh.");
    return;
  }
  const geoJsonData = { type: "FeatureCollection", features: currentFeatures };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJsonData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "data_tambak_kualitas_air.geojson");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function downloadShapefile() {
  if (!currentFeatures || currentFeatures.length === 0) {
    alert("Tidak ada data untuk diunduh.");
    return;
  }

  // Cek apakah library shpwrite tersedia
  if (typeof shpwrite === 'undefined') {
    alert("Library shpwrite tidak tersedia. Pastikan Anda telah memuat library yang diperlukan.");
    console.error("shpwrite library is not loaded");
    return;
  }

  try {
    // ========= GUNAKAN FUNGSI SANITIZE DI SINI =========
    // Buat salinan fitur yang bersih khusus untuk di-download
    const sanitizedFeatures = sanitizePropertiesForShapefile(currentFeatures);

    // Validasi geometri - pastikan semua fitur memiliki geometri yang valid
    const validFeatures = sanitizedFeatures.filter(feature => {
      return feature.geometry && 
             feature.geometry.type && 
             feature.geometry.coordinates && 
             feature.geometry.coordinates.length > 0;
    });

    if (validFeatures.length === 0) {
      alert("Tidak ada fitur dengan geometri yang valid untuk diunduh.");
      return;
    }

    const geoJsonData = {
      type: "FeatureCollection",
      features: validFeatures // Gunakan fitur yang sudah bersih dan valid
    };

    const options = {
      folder: 'shapefile_data_tambak',
      types: {
        point: 'TambakTitik',
        multipoint: 'TambakTitik',
        polygon: 'TambakArea',
        multipolygon: 'TambakArea',
        line: 'TambakGaris',
        multilinestring: 'TambakGaris'
      }
    };

    console.log("Attempting to download shapefile with data:", geoJsonData);
    console.log("Using options:", options);

    // Gunakan shpwrite untuk membuat dan mengunduh shapefile
    shpwrite.download(geoJsonData, options);
    
    console.log("Shapefile download initiated successfully");
    
  } catch (error) {
    console.error("Error saat membuat Shapefile:", error);
    alert(`Gagal membuat file Shapefile: ${error.message}\n\nSilakan periksa konsol browser untuk detail lebih lanjut.`);
  }
}

function downloadAllFormats() {
  if (!currentFeatures || currentFeatures.length === 0) {
    alert("Tidak ada data untuk diunduh.");
    return;
  }
  downloadGeoJSON();
  setTimeout(downloadShapefile, 1000);
}

// Event listener
document.addEventListener('DOMContentLoaded', function() {
  // Cek ketersediaan library yang diperlukan
  const requiredLibraries = ['L', 'shp'];
  const missingLibraries = requiredLibraries.filter(lib => typeof window[lib] === 'undefined');
  
  if (missingLibraries.length > 0) {
    console.error("Missing required libraries:", missingLibraries);
    alert(`Library yang diperlukan tidak tersedia: ${missingLibraries.join(', ')}`);
    return;
  }

  loadShapefilesFromFolder();
  updateThemeText();
  
  // Event listeners untuk download
  const downloadGeoJSONBtn = document.getElementById('downloadGeoJSON');
  const downloadSHPBtn = document.getElementById('downloadSHP');
  const downloadAllBtn = document.getElementById('downloadAll');
  
  if (downloadGeoJSONBtn) downloadGeoJSONBtn.addEventListener('click', downloadGeoJSON);
  if (downloadSHPBtn) downloadSHPBtn.addEventListener('click', downloadShapefile);
  if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAllFormats);
});

document.getElementById('statusFilter').addEventListener('change', function () {
  const selected = this.value;
  let allFeatures = fullGeoJSONData ? fullGeoJSONData.features : [];
  shapefileLayers.forEach(layer => map.removeLayer(layer));
  shapefileLayers = [];
  if (selected !== 'all') {
    currentFeatures = allFeatures.filter(f => f.properties.Status === selected);
  } else {
    currentFeatures = allFeatures;
  }
  const filteredGeoJSON = { type: "FeatureCollection", features: currentFeatures };
  if (currentFeatures.length > 0) {
    var layer = L.geoJSON(filteredGeoJSON, {
      style: feature => {
        const status = feature.properties?.Status;
        let fillColor = '#9e9e9e';
        if (status === "Baik (Memenuhi)") fillColor = "#4caf50";
        else if (status === "Cemar Ringan") fillColor = "#ff9800";
        return { color: "#333", weight: 1.5, fillColor, fillOpacity: 0.7 };
      },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 8, fillColor: "#0288d1", color: '#000', weight: 1, opacity: 1, fillOpacity: 0.8 })
    });
    layer.eachLayer(function(l) {
      if (l.feature.properties) {
        const popup = createPopupContent(l.feature.properties);
        l.bindPopup(popup, { autoPan: true, maxWidth: 300 });
        l.on('click', e => map.panTo(e.latlng));
      }
    });
    shapefileLayers.push(layer);
    layer.addTo(map);
  }
  updateQualityCounts();
});

// Handler pencarian
document.getElementById('searchButton').addEventListener('click', searchLocation);
document.getElementById('searchBox').addEventListener('keypress', e => { if (e.key === 'Enter') searchLocation(); });

function searchLocation() {
  const query = document.getElementById('searchBox').value.toLowerCase();
  if (!query) { alert("Masukkan lokasi untuk mencari."); return; }
  shapefileLayers.forEach(layer => map.removeLayer(layer));
  shapefileLayers = [];
  currentFeatures = [];
  const filteredFeatures = fullGeoJSONData.features.filter(feature => Object.values(feature.properties).some(value => String(value).toLowerCase().includes(query)));
  if (filteredFeatures.length > 0) {
    currentFeatures = filteredFeatures;
    const filteredGeoJSON = { type: "FeatureCollection", features: filteredFeatures };
    var layer = L.geoJSON(filteredGeoJSON, {
      style: feature => {
        const status = feature.properties?.Status;
        let fillColor = '#9e9e9e';
        if (status === "Baik (Memenuhi)") fillColor = "#4caf50";
        else if (status === "Cemar Ringan") fillColor = "#ff9800";
        return { color: "#333", weight: 1.5, fillColor, fillOpacity: 0.7 };
      },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 8, fillColor: "#0288d1", color: '#000', weight: 1, opacity: 1, fillOpacity: 0.8 })
    });
    layer.eachLayer(function(l) {
      if (l.feature.properties) {
        const popup = createPopupContent(l.feature.properties);
        l.bindPopup(popup, { autoPan: true, maxWidth: 300 });
        l.on('click', e => map.panTo(e.latlng));
      }
    });
    shapefileLayers.push(layer);
    layer.addTo(map);
    map.fitBounds(layer.getBounds());
    updateQualityCounts();
  } else {
    alert("Lokasi tidak ditemukan. Menampilkan semua data.");
    processGeoJSON(fullGeoJSONData, "All Data"); // Re-render all data
  }
}

// Dark mode
function updateThemeText() {
  const themeText = document.getElementById('theme-text');
  if (themeText) {
    const isDark = document.body.classList.contains('dark');
    themeText.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
  }
}

document.getElementById('darkToggle').addEventListener('change', function () {
  document.body.classList.toggle('dark', this.checked);
  updateThemeText();
});