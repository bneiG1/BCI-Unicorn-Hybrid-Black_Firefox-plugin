// P300 Speller Matrix Flashing Logic for Popup/Overlay

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start');
    const allIds = [
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        '0','1','2','3','4','5','6','7','8','9'
    ];
    let flashingOrder = [];
    let trialCount = 5;
    let currentIndex = 0;
    let flashing = false;
    let flashTimeout;

    function shuffle(array) {
        let arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function clearFlashing() {
        allIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('flashing');
        });
    }

    function flashNext() {
        if (currentIndex >= flashingOrder.length) {
            flashing = false;
            clearFlashing();
            return;
        }
        clearFlashing();
        const id = allIds[flashingOrder[currentIndex] - 1];
        const el = document.getElementById(id);
        if (el) el.classList.add('flashing');
        currentIndex++;
        flashTimeout = setTimeout(() => {
            clearFlashing();
            setTimeout(flashNext, 100); // ISI
        }, 100); // flash time
    }

    startBtn.addEventListener('click', () => {
        if (flashing) return;
        flashing = true;
        flashingOrder = shuffle([...Array(36).keys()].map(i => i + 1));
        for (let t = 1; t < trialCount; t++) {
            flashingOrder = flashingOrder.concat(shuffle([...Array(36).keys()].map(i => i + 1)));
        }
        currentIndex = 0;
        setTimeout(flashNext, 2000); // 2s pause before start
    });
});
