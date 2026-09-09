const viewer = document.querySelector('#viewer');
const viewerImage = viewer.querySelector('img');
const viewerText = viewer.querySelector('p');
document.querySelectorAll('.gallery article img').forEach((image) => {
  image.addEventListener('click', () => {
    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    viewerText.textContent = image.closest('article').querySelector('b').textContent;
    viewer.showModal();
  });
});
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close();
});

// Mise à jour dynamique du site vers la dernière APK publiée.
const latestVersion = '1.3.2.27';
const latestApkUrl = 'https://github.com/ramat82/topographe-gnss/releases/download/V1.3.2.27/TOPOGRAHE_GNSS_1.3.2.27.apk';
document.querySelectorAll('a[href*="releases/download/V1.3.2.26/"]').forEach((link) => {
  link.href = latestApkUrl;
  if (link.textContent.includes('1.3.2.26')) {
    link.textContent = link.textContent.replace('1.3.2.26', latestVersion);
  }
});
const installAside = document.querySelector('#installation aside');
if (installAside) {
  const strongs = installAside.querySelectorAll('strong');
  if (strongs.length) strongs[0].textContent = latestVersion;
}

// Ajoute un compteur visible dans le bandeau d'informations principal.
const facts = document.querySelector('.facts');
if (facts && !facts.querySelector('[data-download-count]')) {
  const item = document.createElement('span');
  item.innerHTML = '<b data-download-count>…</b> téléchargements APK';
  facts.appendChild(item);
}

// Ajoute aussi le compteur dans le bloc Installation.
if (installAside && !installAside.querySelector('[data-download-count]')) {
  const label = document.createElement('span');
  label.textContent = 'Téléchargements cumulés';
  const value = document.createElement('strong');
  value.setAttribute('data-download-count', '');
  value.textContent = '…';
  const button = installAside.querySelector('a.button');
  installAside.insertBefore(label, button);
  installAside.insertBefore(value, button);
}

// Compteur cumulatif des téléchargements APK depuis toutes les Releases GitHub.
// Le résultat est mis en cache 15 minutes dans le navigateur pour limiter les appels API.
(async function loadDownloadCount() {
  const counters = document.querySelectorAll('[data-download-count]');
  if (!counters.length) return;

  const cacheKey = 'topographe-gnss-download-count';
  const cacheDuration = 15 * 60 * 1000;

  const showCount = (count) => {
    const formatted = Number(count).toLocaleString('fr-FR');
    counters.forEach((node) => {
      node.textContent = formatted;
      node.title = `${formatted} téléchargements APK cumulés sur GitHub`;
    });
  };

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.time < cacheDuration && Number.isFinite(cached.count)) {
      showCount(cached.count);
      return;
    }
  } catch (_) {
    // Cache indisponible : continuer avec l'API GitHub.
  }

  try {
    const response = await fetch('https://api.github.com/repos/ramat82/topographe-gnss/releases?per_page=100', {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const releases = await response.json();
    const total = releases.reduce((sum, release) => {
      const apkDownloads = (release.assets || [])
        .filter((asset) => String(asset.name || '').toLowerCase().endsWith('.apk'))
        .reduce((assetSum, asset) => assetSum + Number(asset.download_count || 0), 0);
      return sum + apkDownloads;
    }, 0);

    showCount(total);
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ count: total, time: Date.now() }));
    } catch (_) {
      // Le compteur reste affiché même si le cache navigateur est désactivé.
    }
  } catch (error) {
    counters.forEach((node) => {
      node.textContent = '—';
      node.title = 'Compteur GitHub temporairement indisponible';
    });
  }
})();
