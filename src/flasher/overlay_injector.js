// Injects the P300 speller matrix overlay into the current web page
(function() {
    if (document.getElementById('p300-speller-overlay')) return; // Prevent duplicate overlays
    const overlay = document.createElement('div');
    overlay.id = 'p300-speller-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.3)';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.backdropFilter = 'blur(2px)';
    overlay.innerHTML = `<div id="speller_matrix_overlay"></div>`;
    document.body.appendChild(overlay);

    // Load CSS
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = chrome.runtime.getURL('src/flasher/speller_matrix.css');
    document.head.appendChild(style);

    // Fetch and inject the matrix HTML
    fetch(chrome.runtime.getURL('src/flasher/speller_matrix.html'))
      .then(r => r.text())
      .then(html => {
        document.getElementById('speller_matrix_overlay').innerHTML = html;
        // Load JS logic
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('src/flasher/speller_matrix.js');
        document.body.appendChild(script);
      });

    // Click outside to close overlay
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });
})();
