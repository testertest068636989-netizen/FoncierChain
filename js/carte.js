  const PARCELLES = [
    { id: 'MADIBOU-482',    district: 'Madibou',   type: 'Résidentiel', status: 'confirmed', area: '680 m²',  owner: 'Jean-Baptiste Moukala', lat: -4.3350, lng: 15.2580 },
    { id: 'BZV-2024-8817',  district: 'Madibou',   type: 'Commercial',  status: 'litige',    area: '890 m²',  owner: 'Fabrice Nzimba',        lat: -4.3280, lng: 15.2450 },
    { id: 'PTR-2023-0041',  district: 'Poto-Poto', type: 'Résidentiel', status: 'confirmed', area: '520 m²',  owner: 'Marie-Claire Ossete',   lat: -4.2600, lng: 15.2900 },
    { id: 'PTR-2023-0105',  district: 'Poto-Poto', type: 'Résidentiel', status: 'confirmed', area: '430 m²',  owner: 'Christophe Itoua',      lat: -4.2700, lng: 15.3050 },
    { id: 'MGL-2022-0017',  district: 'Moungali',  type: 'Résidentiel', status: 'confirmed', area: '610 m²',  owner: 'Solange Ngoma',         lat: -4.2300, lng: 15.2700 },
    { id: 'MGL-2022-0089',  district: 'Moungali',  type: 'Agricole',    status: 'confirmed', area: '1240 m²', owner: 'Antoine Moussoki',      lat: -4.2450, lng: 15.2600 },
    { id: 'BCG-2024-0331',  district: 'Bacongo',   type: 'Résidentiel', status: 'confirmed', area: '740 m²',  owner: 'Pauline Bitemo',        lat: -4.3100, lng: 15.2800 },
    { id: 'BCG-2024-0478',  district: 'Bacongo',   type: 'Commercial',  status: 'confirmed', area: '310 m²',  owner: 'Robert Dzabana',        lat: -4.3200, lng: 15.3100 },
    { id: 'TLG-2021-0012',  district: 'Talangaï',  type: 'Résidentiel', status: 'confirmed', area: '560 m²',  owner: 'Véronique Mabika',      lat: -4.2050, lng: 15.3500 },
    { id: 'TLG-2021-0099',  district: 'Talangaï',  type: 'Industriel',  status: 'pending',   area: '2100 m²', owner: 'Société CONGO-BUILD',   lat: -4.2000, lng: 15.3400 },
    { id: 'PTR-2024-1102',  district: 'Poto-Poto', type: 'Résidentiel', status: 'litige',    area: '480 m²',  owner: 'Pierre Mabangui',       lat: -4.2550, lng: 15.3150 },
    { id: 'MDB-2023-0277',  district: 'Madibou',   type: 'Résidentiel', status: 'confirmed', area: '720 m²',  owner: 'Yvonne Kimbembe',       lat: -4.3400, lng: 15.2700 },
  ];

  let activeStatus  = 'all';
  let activeDistrict = 'all';
  let activeType    = 'all';
  let markerMap     = {};
  let currentTile   = 'satellite';

  const TILES = {
    satellite: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
    ),
    streets: L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
    ),
    dark: L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; CartoDB', maxZoom: 19 }
    ),
  };

  const map = L.map('map', {
    center: [-4.2700, 15.2850],
    zoom: 13,
    zoomControl: true,
    layers: [TILES.satellite],
  });

  map.zoomControl.setPosition('topright');

  map.on('mousemove', e => {
    document.getElementById('map-coords').textContent =
      `Lat: ${e.latlng.lat.toFixed(4)}° | Lng: ${e.latlng.lng.toFixed(4)}°`;
  });

  function makeIcon(color, shadow) {
    return L.divIcon({
      className: '',
      html: `
        <div style="
          width:28px;height:28px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color};
          border:3px solid rgba(255,255,255,.25);
          box-shadow:0 0 10px ${shadow},0 3px 8px rgba(0,0,0,.5);
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="
            width:8px;height:8px;
            border-radius:50%;
            background:rgba(255,255,255,.9);
            transform:rotate(45deg);
          "></div>
        </div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 28],
      popupAnchor:[0, -30],
    });
  }

  const ICONS = {
    confirmed: makeIcon('#00e57a', 'rgba(0,229,122,.6)'),
    litige:    makeIcon('#ff3b5c', 'rgba(255,59,92,.6)'),
    pending:   makeIcon('#ffb020', 'rgba(255,176,32,.5)'),
  };

  const STATUS_LABELS = { confirmed: 'Confirmé', litige: 'Litige', pending: 'En Attente' };
  const STATUS_BADGE  = { confirmed: 'popup__badge--confirmed', litige: 'popup__badge--litige', pending: 'popup__badge--pending' };
  const DOT_CLASS     = { confirmed: 'dot-green', litige: 'dot-red', pending: 'dot-orange' };

  function buildPopup(p) {
    return `
      <div class="popup__id">#${p.id}</div>
      <div class="popup__row">
        <span class="popup__key">Statut</span>
        <span class="popup__badge ${STATUS_BADGE[p.status]}">${STATUS_LABELS[p.status]}</span>
      </div>
      <div class="popup__row">
        <span class="popup__key">Propriétaire</span>
        <span class="popup__val">${p.owner}</span>
      </div>
      <div class="popup__row">
        <span class="popup__key">District</span>
        <span class="popup__val">${p.district}</span>
      </div>
      <div class="popup__row">
        <span class="popup__key">Type</span>
        <span class="popup__val">${p.type}</span>
      </div>
      <div class="popup__row">
        <span class="popup__key">Superficie</span>
        <span class="popup__val">${p.area}</span>
      </div>
    `;
  }

  function addMarkers() {
    PARCELLES.forEach(p => {
      const m = L.marker([p.lat, p.lng], { icon: ICONS[p.status] })
        .bindPopup(buildPopup(p), { maxWidth: 240, className: '' });
      m.addTo(map);
      markerMap[p.id] = { marker: m, data: p };
    });
  }

  function renderList(parcelles) {
    const list = document.getElementById('parcelle-list');
    document.getElementById('parcelle-count').textContent = parcelles.length;
    list.innerHTML = parcelles.map(p => `
      <article class="parcelle-item" onclick="focusParcelle('${p.id}')" tabindex="0"
               onkeypress="if(event.key==='Enter')focusParcelle('${p.id}')"
               aria-label="Parcelle ${p.id}, ${STATUS_LABELS[p.status]}">
        <div class="parcelle-item__id">${p.id}</div>
        <div class="parcelle-item__meta">${p.district} — ${p.area}</div>
        <span class="parcelle-item__dot ${DOT_CLASS[p.status]}"></span>
      </article>
    `).join('');
  }

  function focusParcelle(id) {
    const entry = markerMap[id];
    if (!entry) return;
    map.flyTo([entry.data.lat, entry.data.lng], 16, { duration: 1 });
    entry.marker.openPopup();
    document.querySelectorAll('.parcelle-item').forEach(el => el.classList.remove('active'));
    const el = [...document.querySelectorAll('.parcelle-item')]
      .find(el => el.querySelector('.parcelle-item__id').textContent === id);
    if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }

  function getFiltered() {
    return PARCELLES.filter(p => {
      if (activeStatus  !== 'all' && p.status   !== activeStatus)  return false;
      if (activeDistrict !== 'all' && p.district !== activeDistrict) return false;
      if (activeType    !== 'all' && p.type     !== activeType)    return false;
      return true;
    });
  }

  function applyFilters() {
    activeDistrict = document.getElementById('filter-district').value;
    activeType     = document.getElementById('filter-type').value;
    updateMap();
  }

  function filterStatus(status, btn) {
    activeStatus = status;
    document.querySelectorAll('.status-btn').forEach(b => {
      b.classList.remove('active', 'active-red', 'active-orange');
    });
    if (status === 'all')       btn.classList.add('active');
    else if (status === 'litige')  btn.classList.add('active-red');
    else if (status === 'pending') btn.classList.add('active-orange');
    else                           btn.classList.add('active');
    updateMap();
  }

  function updateMap() {
    const filtered = getFiltered();
    const filteredIds = new Set(filtered.map(p => p.id));

    Object.entries(markerMap).forEach(([id, entry]) => {
      if (filteredIds.has(id)) {
        if (!map.hasLayer(entry.marker)) map.addLayer(entry.marker);
      } else {
        map.removeLayer(entry.marker);
      }
    });

    renderList(filtered);
  }

  function switchTile(name, btn) {
    if (name === currentTile) return;
    map.removeLayer(TILES[currentTile]);
    map.addLayer(TILES[name]);
    currentTile = name;
    document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function openVerifyModal() {
    const modal = new bootstrap.Modal(document.getElementById('verifyModal'));
    modal.show();
  }

  function runVerify() {
    const q = document.getElementById('verify-input').value.trim().replace('#','').toUpperCase();
    const result = document.getElementById('verify-result');
    const match = PARCELLES.find(p => p.id.toUpperCase() === q || p.id.toUpperCase().includes(q));

    if (match) {
      result.style.display = 'block';
      result.innerHTML = `
        <div style="background:var(--fc-green-dim);border:1px solid rgba(0,229,122,.3);border-radius:8px;padding:12px;">
          <div style="font-family:var(--fc-mono);font-size:11px;color:var(--fc-green);margin-bottom:8px;">
            ✓ Titre trouvé et vérifié
          </div>
          <div style="font-size:12px;color:var(--fc-text);">
            <strong>#${match.id}</strong><br>
            Propriétaire : ${match.owner}<br>
            District : ${match.district} · ${match.type}<br>
            Superficie : ${match.area}
          </div>
        </div>`;
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('verifyModal')).hide();
        focusParcelle(match.id);
      }, 1400);
    } else {
      result.style.display = 'block';
      result.innerHTML = `
        <div style="background:var(--fc-red-dim);border:1px solid rgba(255,59,92,.3);border-radius:8px;padding:12px;font-size:12px;color:var(--fc-red);">
          ✗ Aucun titre correspondant trouvé dans le registre.
        </div>`;
    }
  }

  addMarkers();
  renderList(PARCELLES);