/**
 * @file script1.js
 * @description Script utama untuk fungsionalitas Spatial Intelligence Portal.
 */

// ===================================================================
//  FUNGSI UNTUK MEMBUKA PETA (WEBGIS)
// ===================================================================

/**
 * Membuka URL WebGIS di tab baru setelah konfirmasi dari pengguna.
 * @param {string} url - URL dari file HTML WebGIS.
 * @param {string} message - Pesan konfirmasi yang akan ditampilkan.
 */
function openWebGIS(url, message) {
    if (confirm(message)) {
        window.open(url, '_blank');
    }
}

// Fungsi spesifik untuk setiap tombol/kartu
function loadAquaFish() {
    openWebGIS('qgis2web_2025_06_21-17_30_58_753825/indexx.html', '🐟 Apakah Anda ingin membuka sistem AquaFish yang baru?');
}
function loadSurabayaFloodMap() {
    openWebGIS('Peta Potensi Rawan Banjir Kota Surabaya (WEBGIS KEL 3)/WEBGIS Potensi Rawan Banjir Kota Surabaya.html', '🌧️ Apakah Anda ingin membuka Peta Rawan Banjir?');
}
function loadRoadDamageMap() {
    openWebGIS('Kel7_Jalan Rusak Kenjeran/index.html', '🚧 Apakah Anda ingin membuka Peta Kerusakan Jalan?');
}
function loadSiPutih() {
    openWebGIS('index3.html', '🚗 Apakah Anda ingin membuka sistem SiPutih?');
}
function loadLSTSurabayaMap() {
    openWebGIS('IIG LST SURABAYA NEW/index.html', '🌡️ Apakah Anda ingin membuka Peta Suhu Permukaan Tanah (LST) Surabaya?');
}
function loadBioporiMap() {
    openWebGIS('Kelompok 4 IIG_Persebaran Biopori/index.html', '🌱 Apakah Anda ingin membuka Peta Sebaran Biopori di Surabaya?');
}
function loadLOSDisplacementMap() {
    openWebGIS('WEB_LOS Displacement/index.html', '📉 Apakah Anda ingin membuka Peta LOS Displacement (Penurunan Tanah) Surabaya?');
}


// ===================================================================
//  FUNGSI UTILITAS UI (User Interface)
// ===================================================================

/**
 * Scroll ke bagian atas halaman.
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Scroll ke seksi pertama untuk memperkenalkan konten.
 */
function explorePortal() {
    document.getElementById('aquafish-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Jam digital untuk widget cuaca.
 */
function updateLiveTime() {
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
        const now = new Date();
        // Format waktu ke HH:MM:SS
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        timeEl.textContent = `${timeString} WIB`;
    }
}

// ===================================================================
//  MANAJEMEN TEMA (LIGHT/DARK MODE)
// ===================================================================

/**
 * Mengganti tema antara light dan dark mode.
 */
function toggleTheme() {
    const body = document.body;
    const newTheme = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

/**
 * Memperbarui ikon tema berdasarkan tema yang aktif.
 * @param {string} theme - Tema yang sedang aktif ('light-mode' atau 'dark-mode').
 */
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.className = theme === 'dark-mode' ? 'fas fa-sun' : 'fas fa-moon';
    themeIcon.title = theme === 'dark-mode' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
}

// ===================================================================
//  EVENT LISTENER & INISIALISASI
// ===================================================================

/**
 * Event listener yang dijalankan saat halaman selesai dimuat.
 */
window.addEventListener('load', function() {
    // 1. Animasi logo saat masuk
    const logo = document.querySelector('.logo');
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(-50px)';
    setTimeout(() => {
        logo.style.opacity = '1';
        logo.style.transform = 'translateY(0)';
        logo.style.transition = 'all 1s ease';
    }, 300);

    // 2. Atur tema awal
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode');
    document.body.classList.add(savedTheme);
    updateThemeIcon(savedTheme);

    // 3. Jalankan jam digital dan perbarui setiap detik
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
});

/**
 * Event listener untuk event scroll (menampilkan tombol scroll-to-top).
 */
window.addEventListener('scroll', function() {
    document.querySelector('.scroll-indicator').classList.toggle('visible', window.pageYOffset > 300);
});

/**
 * Inisialisasi Intersection Observer untuk animasi elemen saat scroll.
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Terapkan observer ke semua seksi yang ingin dianimasikan
const animatedSections = '.stat-card, .video-container, .dashboard-section, .news-section, .supporter-section, .aquafish-integration, .siputih-integration, .surabayaflood-integration, .roaddamage-integration, .lstsurabaya-integration, .bioporimap-integration, .losdisplacement-integration';
document.querySelectorAll(animatedSections).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(el);
});