/**
 * Web Dashboard — Головна панель вкладок
 * Головний віджет Alerts.in.ua, бічна панель погоди та швидкі плашки для сайтів
 */

(function () {
  'use strict';

  // 6 сайтів для швидких плашок
  const QUICK_SITES = [
    {
      id: 'facebook',
      title: 'Facebook',
      url: 'https://www.facebook.com/',
      domain: 'facebook.com',
      category: 'Соціальна мережа'
    },
    {
      id: 'ukrnet',
      title: 'Ukr.net — Черкаси',
      url: 'https://www.ukr.net/news/cherkasy.html',
      domain: 'ukr.net',
      category: 'Новини'
    },
    {
      id: 'procherk',
      title: 'Прочерк — Черкаси',
      url: 'https://procherk.info/',
      domain: 'procherk.info',
      category: 'Новини'
    },
    {
      id: 'sinoptik',
      title: 'Sinoptik — Черкаси',
      url: 'https://sinoptik.ua/pohoda/cherkasy',
      domain: 'sinoptik.ua',
      category: 'Погода'
    },
    {
      id: 'gotoshop',
      title: 'GoToShop — Черкаси',
      url: 'https://gotoshop.ua/cherkasy/',
      domain: 'gotoshop.ua',
      category: 'Знижки'
    },
    {
      id: 'olx',
      title: 'OLX Україна',
      url: 'https://www.olx.ua/uk/',
      domain: 'olx.ua',
      category: 'Оголошення'
    }
  ];

  // SVG-іконка відкриття / розгортання
  const SVG_EXTERNAL_LINK = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;

  // Елементи DOM
  const clockTimeEl = document.getElementById('clock-time');
  const clockDateEl = document.getElementById('clock-date');
  const greetingBadgeEl = document.getElementById('greeting-badge');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const platesGrid = document.getElementById('plates-grid');
  const platesCountEl = document.getElementById('plates-count');
  const openAlertsBtn = document.getElementById('open-alerts-btn');
  const openWeatherBtn = document.getElementById('open-weather-btn');

  /**
   * Оновлення цифрового годинника, дати та привітання українською мовою
   */
  function updateClockAndGreeting() {
    const now = new Date();

    // Час (ГГ:ХХ:СС)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (clockTimeEl) {
      clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Дата українською мовою
    if (clockDateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Intl.DateTimeFormat('uk-UA', options).format(now);
      clockDateEl.textContent = formattedDate;
    }

    // Динамічне привітання за часом доби
    if (greetingBadgeEl) {
      const currentHour = now.getHours();
      let greeting = 'Доброго дня';
      if (currentHour >= 5 && currentHour < 12) {
        greeting = 'Доброго ранку';
      } else if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Доброго дня';
      } else if (currentHour >= 18 && currentHour < 23) {
        greeting = 'Доброго вечора';
      } else {
        greeting = 'Доброї ночі';
      }
      greetingBadgeEl.textContent = greeting;
    }
  }

  /**
   * Керування темами оформлення (Світла / Темна)
   */
  function setupTheme() {
    const savedTheme = localStorage.getItem('dashboard_theme') || 'theme-dark';
    document.body.className = savedTheme;

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        const newTheme = isDark ? 'theme-light' : 'theme-dark';
        document.body.className = newTheme;
        localStorage.setItem('dashboard_theme', newTheme);

        // Переініціалізація віджета погоди для підлаштування під тему
        if (typeof window.__weatherwidget_init === 'function') {
          window.__weatherwidget_init();
        }
      });
    }
  }

  /**
   * Обробка швидкого пошуку в Google та переходу за посиланням
   */
  function setupSearch() {
    if (!searchForm || !searchInput) return;

    // Гаряча клавіша "/" для швидкого переходу до пошуку
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawQuery = searchInput.value.trim();
      if (!rawQuery) return;

      const isUrl = /^https?:\/\//i.test(rawQuery) ||
                    (/^[\w-]+(\.[\w-]+)+[/#?]?.*$/i.test(rawQuery) && !rawQuery.includes(' '));

      if (isUrl) {
        const targetUrl = /^https?:\/\//i.test(rawQuery) ? rawQuery : `https://${rawQuery}`;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(rawQuery)}`;
        window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
      }

      searchInput.value = '';
      searchInput.blur();
    });
  }

  /**
   * Налаштування кнопок швидкого переходу для віджетів
   */
  function setupWidgetActions() {
    // Відкриття Alerts.in.ua
    if (openAlertsBtn) {
      openAlertsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open('https://alerts.in.ua/', '_blank', 'noopener,noreferrer');
      });
    }

    // Відкриття Sinoptik Черкаси
    if (openWeatherBtn) {
      openWeatherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open('https://sinoptik.ua/pohoda/cherkasy', '_blank', 'noopener,noreferrer');
      });
    }
  }

  /**
   * Отримання URL фавіконки сайту
   */
  function getFaviconUrl(url) {
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return '';
    }
  }

  /**
   * Генерація плашок для закріплених сайтів
   */
  function renderPlates() {
    if (!platesGrid) return;
    platesGrid.innerHTML = '';

    if (platesCountEl) {
      platesCountEl.textContent = `${QUICK_SITES.length} сайтів`;
    }

    QUICK_SITES.forEach((site) => {
      const card = document.createElement('article');
      card.className = 'plate-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Відкрити ${site.title} у новій вкладці`);

      const faviconUrl = getFaviconUrl(site.url);

      card.innerHTML = `
        <div class="plate-left">
          <div class="plate-favicon-wrapper">
            <img
              class="plate-favicon"
              src="${faviconUrl}"
              alt="Іконка ${site.title}"
              loading="lazy"
              onerror="this.style.display='none'"
            />
          </div>
          <div class="plate-text-group">
            <span class="plate-title" title="${site.title}">${site.title}</span>
            <div class="plate-meta-row">
              <span class="plate-domain">${site.domain}</span>
              <span class="plate-category-badge">${site.category}</span>
            </div>
          </div>
        </div>
        <div class="plate-expand-icon" title="Відкрити ${site.title} у новій вкладці">
          ${SVG_EXTERNAL_LINK}
        </div>
      `;

      // Відкриття сайту у новій вкладці за кліком
      const openSite = () => {
        window.open(site.url, '_blank', 'noopener,noreferrer');
      };

      card.addEventListener('click', openSite);

      // Підтримка доступності (A11y): відкриття за натисканням Enter або Пробілу
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSite();
        }
      });

      platesGrid.appendChild(card);
    });
  }

  // Ініціалізація після завантаження сторінки
  document.addEventListener('DOMContentLoaded', () => {
    updateClockAndGreeting();
    setInterval(updateClockAndGreeting, 1000);
    setupTheme();
    setupSearch();
    setupWidgetActions();
    renderPlates();
  });
})();
