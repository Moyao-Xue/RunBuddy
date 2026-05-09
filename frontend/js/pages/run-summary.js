const moreBtn = document.getElementById('moreBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    const summaryDateEl = document.getElementById('summaryDate');
    const summaryDistanceEl = document.getElementById('summaryDistance');
    const summaryPaceEl = document.getElementById('summaryPace');
    const summaryDurationEl = document.getElementById('summaryDuration');
    const caloriesValueEl = document.getElementById('caloriesValue');
    const coinsTextEl = document.querySelector('.coins-text');
    const streakTextEl = document.querySelector('.streak-copy');
    const completionTitleEl = document.getElementById('completion-title');
    const eyebrowEl = document.querySelector('.eyebrow');
    const runnerIllustrationEl = document.querySelector('.runner-illustration');

    const routeMapEl = document.getElementById('routeMap');
    const routeEmptyEl = document.getElementById('routeEmpty');
    const weatherIconEl = document.getElementById('weatherIcon');
    const weatherTextEl = document.getElementById('weatherText');
    const weatherInlineEl = document.getElementById('weatherInline');
    const reportExportCardEl = document.getElementById('reportExportCard');
    const exportRunnerImageEl = document.getElementById('exportRunnerImage');
    const exportEyebrowEl = document.getElementById('exportEyebrow');
    const exportTitleEl = document.getElementById('exportTitle');
    const exportStreakTextEl = document.getElementById('exportStreakText');
    const exportCoinsTextEl = document.getElementById('exportCoinsText');
    const exportSummaryDateEl = document.getElementById('exportSummaryDate');
    const exportSummaryDistanceEl = document.getElementById('exportSummaryDistance');
    const exportSummaryPaceEl = document.getElementById('exportSummaryPace');
    const exportSummaryDurationEl = document.getElementById('exportSummaryDuration');
    const exportSummaryCaloriesEl = document.getElementById('exportSummaryCalories');
    const exportWeatherInlineEl = document.getElementById('exportWeatherInline');
    const exportWeatherTextEl = document.getElementById('exportWeatherText');
    const exportWeatherIconEl = document.getElementById('exportWeatherIcon');
    const reportExportRouteArtEl = document.getElementById('reportExportRouteArt');

    let routePreviewMap = null;
    let activeSession = null;

    const DEFAULT_ROUTE_CENTER = { lat: 31.2304, lng: 121.4737 };
    const WEATHER_ASSETS = {
      clear: { src: 'images/sunny.jpg', label: 'Sunny' },
      cloudy: { src: 'images/cloud.jpg', label: 'Cloudy' },
      rain: { src: 'images/runny.jpg', label: 'Rainy' },
      snow: { src: 'images/snow.jpg', label: 'Snowy' },
      fallback: { src: 'images/weather.png', label: 'Weather Unavailable' }
    };
    const TILE_SOURCES = [
      {
        name: 'Gaode CN',
        url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        subdomains: '1234'
      },
      {
        name: 'Geoq CN',
        url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
      },
      {
        name: 'OSM Global',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: 'abc'
      }
    ];
    const EXPORT_ASSETS = window.RunBuddyExportAssets || {};

    moreBtn.addEventListener('click', () => {
      dropdownMenu.classList.toggle('show');
    });

    saveBtn.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
      saveCurrentReportAsImage();
    });

    shareBtn.addEventListener('click', () => {
      window.location.href = 'run-share.html';
    });

    deleteBtn.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
      deleteCurrentRunRecord();
    });

    backToMenuBtn.addEventListener('click', () => {
      window.location.href = 'home.html';
    });

    document.addEventListener('click', (event) => {
      if (!moreBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

    document.addEventListener('DOMContentLoaded', async () => {
      activeSession = Storage.getLastSession();

      if (activeSession) {
        updateSummary(activeSession);
        renderRoute(activeSession.routePoints || []);
        await updateWeather(activeSession);
      } else {
        renderRoute([]);
        await updateWeather(null);
      }
    });

    function updateSummary(session) {
      if (coinsTextEl) {
        coinsTextEl.textContent = `${session.coinsEarned || 0} coins collected!`;
      }

      if (summaryDateEl && session.timestamp) {
        const date = new Date(session.timestamp);
        summaryDateEl.textContent = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      if (summaryDistanceEl) {
        summaryDistanceEl.textContent = `${((session.distance || 0) / 1000).toFixed(2)} km`;
      }

      if (summaryPaceEl) {
        summaryPaceEl.textContent = formatPace(session.distance || 0, session.time || 0);
      }

      if (summaryDurationEl) {
        summaryDurationEl.textContent = formatDuration(session.time || 0);
      }

      if (caloriesValueEl) {
        caloriesValueEl.textContent = `${session.calories || 0} Kcal`;
      }
    }

    async function updateWeather(session) {
      setWeatherDisplay(WEATHER_ASSETS.fallback.src, 'Loading...', 'Fetching live weather');

      const chinaWeather = await fetchChinaWeather();
      if (chinaWeather) {
        setWeatherDisplay(chinaWeather.asset.src, chinaWeather.label, chinaWeather.detail);
        return;
      }

      await updateWeatherFallback(session);
    }

    function getWeatherCoordinates(session) {
      if (session && Array.isArray(session.routePoints) && session.routePoints.length > 0) {
        const point = session.routePoints[session.routePoints.length - 1];
        if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
          return { lat: point.lat, lng: point.lng };
        }
      }

      return DEFAULT_ROUTE_CENTER;
    }

    function getWeatherAssetByCode(code) {
      if (code === 0) return WEATHER_ASSETS.clear;
      if ([1, 2, 3, 45, 48].includes(code)) return WEATHER_ASSETS.cloudy;
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return WEATHER_ASSETS.rain;
      if ([71, 73, 75, 77, 85, 86].includes(code)) return WEATHER_ASSETS.snow;
      return WEATHER_ASSETS.fallback;
    }

    function getWeatherAssetByText(conditionText) {
      const englishText = String(conditionText || '').toLowerCase();
      const rawText = String(conditionText || '');

      if (
        englishText.includes('snow') ||
        englishText.includes('sleet') ||
        englishText.includes('hail') ||
        rawText.includes('\u96ea') ||
        rawText.includes('\u51b0\u96f9')
      ) {
        return WEATHER_ASSETS.snow;
      }

      if (
        englishText.includes('rain') ||
        englishText.includes('storm') ||
        englishText.includes('drizzle') ||
        englishText.includes('shower') ||
        rawText.includes('\u96e8') ||
        rawText.includes('\u96f7')
      ) {
        return WEATHER_ASSETS.rain;
      }

      if (
        englishText.includes('cloud') ||
        englishText.includes('overcast') ||
        englishText.includes('fog') ||
        englishText.includes('mist') ||
        englishText.includes('haze') ||
        rawText.includes('\u4e91') ||
        rawText.includes('\u9634') ||
        rawText.includes('\u96fe') ||
        rawText.includes('\u973e')
      ) {
        return WEATHER_ASSETS.cloudy;
      }

      if (englishText.includes('sun') || englishText.includes('clear') || rawText.includes('\u6674')) {
        return WEATHER_ASSETS.clear;
      }

      return WEATHER_ASSETS.fallback;
    }

    async function fetchChinaWeather() {
      try {
        const response = await fetch('https://api.vvhan.com/api/weather', {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`China weather request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (!payload || payload.success !== true || !payload.data) {
          return null;
        }

        const condition = payload.data.type || payload.data.night?.type || '';
        const weatherAsset = getWeatherAssetByText(condition);

        return {
          asset: weatherAsset,
          label: condition || weatherAsset.label,
          detail: buildChinaWeatherDetail(payload)
        };
      } catch (error) {
        console.warn('China weather source unavailable:', error);
        return null;
      }
    }

    function buildChinaWeatherDetail(payload) {
      const city = payload.city || 'Current city';
      const low = payload.data && payload.data.low ? payload.data.low : '';
      const high = payload.data && payload.data.high ? payload.data.high : '';
      const range = [low, high].filter(Boolean).join(' / ');
      return [city, range].filter(Boolean).join('  ');
    }

    async function updateWeatherFallback(session) {
      const coordinates = getWeatherCoordinates(session);

      try {
        const query = new URLSearchParams({
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          current: 'weather_code,temperature_2m',
          timezone: 'auto'
        });

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`);
        if (!response.ok) {
          throw new Error(`Weather request failed: ${response.status}`);
        }

        const payload = await response.json();
        const weatherCode = payload && payload.current ? payload.current.weather_code : null;
        const temperature = payload && payload.current ? payload.current.temperature_2m : null;
        const weatherAsset = getWeatherAssetByCode(weatherCode);

        setWeatherDisplay(
          weatherAsset.src,
          weatherAsset.label,
          buildWeatherDetail(temperature)
        );
      } catch (error) {
        console.error('Weather fetch failed:', error);
        setWeatherDisplay(
          WEATHER_ASSETS.fallback.src,
          WEATHER_ASSETS.fallback.label,
          'Live weather unavailable'
        );
      }
    }

    function setWeatherDisplay(src, label, detailText) {
      if (weatherIconEl) {
        weatherIconEl.src = src;
        weatherIconEl.alt = label;
      }

      if (weatherInlineEl) {
        weatherInlineEl.textContent = label;
      }

      if (weatherTextEl) {
        weatherTextEl.textContent = detailText;
      }
    }

    function buildWeatherDetail(temperature) {
      if (typeof temperature !== 'number') return 'Real-time conditions';
      return `Current ${Math.round(temperature)}\u00B0C`;
    }

    async function saveCurrentReportAsImage() {
      if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas is unavailable.');
        return;
      }

      const payload = buildReportPreviewPayload();
      Storage.saveReportPreview(payload);
      hydrateExportCard(payload);

      try {
        await waitForImages(reportExportCardEl);

        let canvas;

        try {
          canvas = await html2canvas(reportExportCardEl, {
            backgroundColor: null,
            useCORS: true,
            scale: 2,
            logging: false,
            width: 393,
            height: 852,
            windowWidth: 393,
            windowHeight: 852
          });
        } catch (primaryError) {
          console.warn('Live route export failed, retrying with SVG route fallback:', primaryError);
          hydrateExportCard(payload, { forceSvgRoute: true });
          await waitForImages(reportExportCardEl);
          canvas = await html2canvas(reportExportCardEl, {
            backgroundColor: null,
            useCORS: true,
            scale: 2,
            logging: false,
            width: 393,
            height: 852,
            windowWidth: 393,
            windowHeight: 852
          });
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl) {
          throw new Error('PNG export failed');
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = buildReportFilename(payload);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Report export failed:', error);
        alert(`Failed to save the report image on this device.\n${error && error.message ? error.message : error}`);
      }
    }

    function buildReportPreviewPayload() {
      const session = activeSession || Storage.getLastSession() || {};

      return {
        generatedAt: Date.now(),
        title: eyebrowEl ? eyebrowEl.textContent.trim() : 'Run Summary',
        completionTitle: completionTitleEl ? completionTitleEl.textContent.trim() : 'Complete!',
        streakText: streakTextEl ? streakTextEl.textContent.trim() : '',
        coinsText: coinsTextEl ? coinsTextEl.textContent.trim() : '',
        summaryDate: summaryDateEl ? summaryDateEl.textContent.trim() : '--',
        summaryDistance: summaryDistanceEl ? summaryDistanceEl.textContent.trim() : '--',
        summaryPace: summaryPaceEl ? summaryPaceEl.textContent.trim() : '--',
        summaryDuration: summaryDurationEl ? summaryDurationEl.textContent.trim() : '--',
        summaryCalories: caloriesValueEl ? caloriesValueEl.textContent.trim() : '--',
        weatherLabel: weatherInlineEl ? weatherInlineEl.textContent.trim() : '--',
        weatherDetail: weatherTextEl ? weatherTextEl.textContent.trim() : 'Real-time conditions',
        weatherIcon: getAssetPath(weatherIconEl, WEATHER_ASSETS.fallback.src),
        runnerImage: getAssetPath(runnerIllustrationEl, 'images/character.png'),
        routePoints: Array.isArray(session.routePoints)
          ? session.routePoints
              .filter((point) => point && typeof point.lat === 'number' && typeof point.lng === 'number')
              .map((point) => ({
                lat: point.lat,
                lng: point.lng,
                timestamp: point.timestamp || null
              }))
          : [],
        weatherKey: detectWeatherAssetKey(weatherIconEl ? weatherIconEl.getAttribute('src') : ''),
        timestamp: session.timestamp || Date.now()
      };
    }

    function getAssetPath(element, fallback) {
      if (!element) return fallback;
      return element.getAttribute('src') || element.src || fallback;
    }

    function hydrateExportCard(payload, options = {}) {
      if (exportEyebrowEl) {
        exportEyebrowEl.textContent = payload.title || 'Run Summary';
      }

      if (exportTitleEl) {
        exportTitleEl.textContent = payload.completionTitle || 'Complete!';
      }

      if (exportRunnerImageEl) {
        exportRunnerImageEl.src = EXPORT_ASSETS.character || payload.runnerImage || 'images/character.png';
      }

      if (exportStreakTextEl) {
        exportStreakTextEl.textContent = payload.streakText || 'You have kept running for 100 days';
      }

      if (exportCoinsTextEl) {
        exportCoinsTextEl.textContent = payload.coinsText || '0 coins collected!';
      }

      if (exportSummaryDateEl) {
        exportSummaryDateEl.textContent = payload.summaryDate || '--';
      }

      if (exportSummaryDistanceEl) {
        exportSummaryDistanceEl.textContent = payload.summaryDistance || '--';
      }

      if (exportSummaryPaceEl) {
        exportSummaryPaceEl.textContent = payload.summaryPace || '--';
      }

      if (exportSummaryDurationEl) {
        exportSummaryDurationEl.textContent = payload.summaryDuration || '--';
      }

      if (exportSummaryCaloriesEl) {
        exportSummaryCaloriesEl.textContent = payload.summaryCalories || '--';
      }

      if (exportWeatherInlineEl) {
        exportWeatherInlineEl.textContent = payload.weatherLabel || '--';
      }

      if (exportWeatherTextEl) {
        exportWeatherTextEl.textContent = payload.weatherDetail || 'Real-time conditions';
      }

      if (exportWeatherIconEl) {
        exportWeatherIconEl.src = resolveExportWeatherIcon(payload);
        exportWeatherIconEl.alt = payload.weatherLabel || 'Weather icon';
      }

      if (reportExportRouteArtEl) {
        reportExportRouteArtEl.innerHTML = '';

        if (!options.forceSvgRoute) {
          const liveRouteClone = buildLiveRouteClone();
          if (liveRouteClone) {
            reportExportRouteArtEl.appendChild(liveRouteClone);
            return;
          }
        }

        reportExportRouteArtEl.innerHTML = buildExportRouteGraphic(payload.routePoints || []);
      }
    }

    function buildLiveRouteClone() {
      if (!routeMapEl) return null;
      if (routeMapEl.classList.contains('is-empty')) return null;
      if (!routeMapEl.querySelector('.leaflet-pane')) return null;

      const clone = routeMapEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.remove('is-empty');
      clone.classList.add('report-export-route-live-map');
      return clone;
    }

    function buildExportRouteGraphic(routePoints) {
      const latLngs = normalizeRoutePoints(routePoints);
      if (latLngs.length < 2) {
        return `
          <div class="report-export-route-empty">
            No route data available for this run.
          </div>
        `;
      }

      const viewBoxWidth = 321;
      const viewBoxHeight = 172;
      const padding = 18;
      const projected = latLngs.map(([lat, lng]) => ({
        x: lng,
        y: Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2))
      }));

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      projected.forEach((point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });

      const spanX = Math.max(maxX - minX, 0.000001);
      const spanY = Math.max(maxY - minY, 0.000001);
      const scale = Math.min((viewBoxWidth - padding * 2) / spanX, (viewBoxHeight - padding * 2) / spanY);
      const offsetX = (viewBoxWidth - spanX * scale) / 2;
      const offsetY = (viewBoxHeight - spanY * scale) / 2;

      const normalized = projected.map((point) => ({
        x: (point.x - minX) * scale + offsetX,
        y: (maxY - point.y) * scale + offsetY
      }));

      const points = normalized.map((point) => `${point.x},${point.y}`).join(' ');
      const start = normalized[0];
      const finish = normalized[normalized.length - 1];

      return `
        <svg class="report-export-route-svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" role="img" aria-label="Export route">
          <defs>
            <linearGradient id="exportRouteBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#edf5fb"></stop>
              <stop offset="100%" stop-color="#d8e8f4"></stop>
            </linearGradient>
            <pattern id="exportRouteGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"></path>
            </pattern>
          </defs>
          <rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" rx="10" fill="url(#exportRouteBg)"></rect>
          <rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" rx="10" fill="url(#exportRouteGrid)"></rect>
          <polyline points="${points}" fill="none" stroke="#2577d9" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline>
          <circle cx="${start.x}" cy="${start.y}" r="5" fill="#4b9cf5" stroke="#ffffff" stroke-width="2"></circle>
          <circle cx="${finish.x}" cy="${finish.y}" r="5" fill="#f08a2d" stroke="#ffffff" stroke-width="2"></circle>
        </svg>
      `;
    }

    function resolveExportWeatherIcon(payload) {
      const key = payload && payload.weatherKey ? payload.weatherKey : '';
      if (key === 'clear' && EXPORT_ASSETS.weatherSunny) return EXPORT_ASSETS.weatherSunny;
      if (key === 'cloudy' && EXPORT_ASSETS.weatherCloudy) return EXPORT_ASSETS.weatherCloudy;
      if (key === 'rain' && EXPORT_ASSETS.weatherRain) return EXPORT_ASSETS.weatherRain;
      if (key === 'snow' && EXPORT_ASSETS.weatherSnow) return EXPORT_ASSETS.weatherSnow;
      return EXPORT_ASSETS.weatherDefault || payload.weatherIcon || 'images/weather.png';
    }

    function detectWeatherAssetKey(src) {
      const value = String(src || '').toLowerCase();
      if (value.includes('sunny')) return 'clear';
      if (value.includes('cloud')) return 'cloudy';
      if (value.includes('runny') || value.includes('rain')) return 'rain';
      if (value.includes('snow')) return 'snow';
      return 'fallback';
    }

    function waitForImages(container) {
      const images = Array.from(container.querySelectorAll('img'));
      return Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      }));
    }

    function buildReportFilename(payload) {
      const date = new Date(payload && payload.timestamp ? payload.timestamp : Date.now());
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `runbuddy-report-${year}${month}${day}-${hours}${minutes}.png`;
    }

    function deleteCurrentRunRecord() {
      const session = Storage.getLastSession();
      let deleted = false;

      if (session && session.historyRecordId) {
        deleted = Storage.deleteRunCompletely(session.historyRecordId);
      }

      if (!deleted && session) {
        const history = Storage.getRunHistory();
        const matchedRecord = history.find((record) =>
          Math.abs((record.timestamp || 0) - (session.timestamp || 0)) < 10000 &&
          Math.abs((record.distance || 0) - (session.distance || 0)) < 1 &&
          Math.abs((record.time || 0) - (session.time || 0)) < 1000
        );

        if (matchedRecord) {
          Storage.deleteRunCompletely(matchedRecord.id);
        }
      }

      window.location.href = 'home.html';
    }

    function renderRoute(routePoints) {
      if (!routeMapEl) return;

      const latLngs = normalizeRoutePoints(routePoints);
      destroyRoutePreviewMap();

      if (latLngs.length < 2) {
        routeMapEl.classList.add('is-empty');
        if (routeEmptyEl) routeEmptyEl.classList.add('show');
        return;
      }

      routeMapEl.classList.remove('is-empty');
      if (routeEmptyEl) routeEmptyEl.classList.remove('show');

      if (typeof L === 'undefined') return;

        requestAnimationFrame(() => {
          routePreviewMap = L.map('routeMap', {
            zoomControl: false,
            attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false,
            touchZoom: false,
            preferCanvas: false
          });

        attachPreviewTileLayer(routePreviewMap);

        const routeLine = L.polyline(latLngs, {
          color: '#2577d9',
          weight: 6,
          opacity: 0.96,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routePreviewMap);

        L.circleMarker(latLngs[0], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4b9cf5',
          fillOpacity: 1
        }).addTo(routePreviewMap);

        L.circleMarker(latLngs[latLngs.length - 1], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#f08a2d',
          fillOpacity: 1
        }).addTo(routePreviewMap);

        routePreviewMap.fitBounds(routeLine.getBounds(), {
          padding: [22, 22]
        });

        setTimeout(() => routePreviewMap.invalidateSize(true), 80);
        setTimeout(() => routePreviewMap.invalidateSize(true), 260);
      });
    }

    function normalizeRoutePoints(routePoints) {
      if (!Array.isArray(routePoints)) return [];

      return routePoints
        .filter((point) => point && typeof point.lat === 'number' && typeof point.lng === 'number')
        .map((point) => [point.lat, point.lng]);
    }

    function destroyRoutePreviewMap() {
      if (!routePreviewMap) return;
      routePreviewMap.remove();
      routePreviewMap = null;
    }

    function attachPreviewTileLayer(targetMap) {
      let tileSourceIndex = 0;
      let tileErrorCount = 0;
      let activeLayer = null;

      function buildTileLayer(source) {
        const layer = L.tileLayer(source.url, {
          maxZoom: 19,
          detectRetina: true,
          updateWhenIdle: true,
          crossOrigin: true,
          subdomains: source.subdomains || undefined
        });

        layer.on('tileerror', () => {
          tileErrorCount += 1;
          if (tileErrorCount >= 4 && tileSourceIndex < TILE_SOURCES.length - 1) {
            tileSourceIndex += 1;
            tileErrorCount = 0;
            if (activeLayer) {
              targetMap.removeLayer(activeLayer);
            }
            activeLayer = buildTileLayer(TILE_SOURCES[tileSourceIndex]);
            activeLayer.addTo(targetMap);
          }
        });

        return layer;
      }

      activeLayer = buildTileLayer(TILE_SOURCES[tileSourceIndex]);
      activeLayer.addTo(targetMap);
    }

    function formatDuration(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function formatPace(distanceMeters, durationMs) {
      if (!distanceMeters || !durationMs) return '--';

      const paceSecondsPerKm = durationMs / 1000 / (distanceMeters / 1000);
      const minutes = Math.floor(paceSecondsPerKm / 60);
      const seconds = Math.round(paceSecondsPerKm % 60);
      return `${minutes}'${seconds.toString().padStart(2, '0')}/KM`;
    }
