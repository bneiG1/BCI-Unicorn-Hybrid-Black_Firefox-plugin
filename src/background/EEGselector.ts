// Debounce function to limit how often a function can be called
function debounce<T>(func: (this: T, ...args: any[]) => void, delay: number): (this: T, ...args: any[]) => void {
    let timeout: NodeJS.Timeout;
    return function (this: T, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to find clickable elements in view, limiting to the first 5 visible elements
function findClickableElementsInView(excludeElements: HTMLElement[]): HTMLElement[] {
    const allElements = document.querySelectorAll<HTMLElement>('*');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const excludedSet = new Set(excludeElements);
    return Array.from(allElements).filter(element => {
        const tagName = element.tagName.toLowerCase();
        const isClickableTag = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
        const hasOnClick = typeof element.onclick === 'function';
        const hasTabIndex = element.hasAttribute('tabindex');
        const rect = element.getBoundingClientRect();

        return (isClickableTag || hasOnClick || hasTabIndex) &&
               rect.top >= 0 &&
               rect.left >= 0 &&
               rect.bottom <= viewportHeight &&
               rect.right <= viewportWidth &&
               !excludedSet.has(element);
    }).slice(0, 5);
}

// Function to add flashing border and overlay to elements
function addFlashingBorderAndOverlayToElements(): void {
    const clickableElements = findClickableElementsInView(previouslyFlashingElements);

    // Clean up previous overlays and borders
    const flashingElements = document.querySelectorAll<HTMLElement>('.flashing-border, .overlay');
    flashingElements.forEach(element => {
        element.classList.remove('flashing-border');
        element.classList.remove('overlay');
    });

    const frequencies: number[] = [0.1, 0.0333, 0.02]; // Corresponding to 10Hz, 30Hz, and 50Hz

    clickableElements.forEach(element => {
        const randomFrequency = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        element.classList.add('flashing-border');
        element.style.animationDuration = `${randomFrequency}s`;

        if (window.getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.style.animationDuration = `${randomFrequency}s`;
        element.appendChild(overlay);
    });

    const timestamp = new Date().toLocaleString();
    console.log(`Currently flashing elements at ${timestamp}:`, clickableElements);
    
    previouslyFlashingElements.push(...clickableElements);
}

// Function to handle events and update flashing elements
const updateFlashingElements = debounce(() => {
    currentClickableElements = findClickableElementsInView([]); // Get all clickable elements
    addFlashingBorderAndOverlayToElements();
}, 5000);

let inactivityTimer: NodeJS.Timeout;
let previouslyFlashingElements: HTMLElement[] = [];
let currentClickableElements: HTMLElement[] = [];

// Function to reset the inactivity timer
function resetInactivityTimer(): void {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        switchToNextFlashingElements();
    }, 5000);
}

// Function to switch to the next set of flashing elements
function switchToNextFlashingElements(): void {
    let nextClickableElements = findClickableElementsInView(previouslyFlashingElements);

    if (nextClickableElements.length === 0) {
        previouslyFlashingElements = [];
        nextClickableElements = findClickableElementsInView(previouslyFlashingElements);
    }

    if (nextClickableElements.length > 0) {
        addFlashingBorderAndOverlayToElements();
        const timestamp = new Date().toLocaleString();
        console.log(`Switched to new flashing elements at ${timestamp}:`, nextClickableElements);
    } else {
        console.log("No new elements to flash.");
    }
}

// Inject CSS for the border flashing animation and overlay
const style = document.createElement('style');
style.innerHTML = `
    @keyframes flash-border {
        0% { border-color: black; }
        100% { border-color: white; }
    }
    
    @keyframes flash-overlay {
        0% { background-color: rgba(255, 255, 255, 0.5); }
        100% { background-color: rgba(0, 0, 0, 0.5); }
    }

    .flashing-border {
        border: 2px solid black;
        animation: flash-border infinite alternate;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.5;
        pointer-events: none;
        animation: flash-overlay infinite alternate;
    }
`;
document.head.appendChild(style);

// Initialize elements on page load
window.onload = () => {
    currentClickableElements = findClickableElementsInView(previouslyFlashingElements);
    addFlashingBorderAndOverlayToElements();
};

// Listen for various events to update elements
const eventsToMonitor: string[] = [
    'scroll',
    'resize',
    'mousemove',
    'click',
    'keyup',
    'keydown',
    'touchstart',
    'touchmove'
];

eventsToMonitor.forEach(event => {
    window.addEventListener(event, () => {
        resetInactivityTimer();
        updateFlashingElements();
    });
});

// MutationObserver to detect changes in the DOM
let mutationTimeout: NodeJS.Timeout;
const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(() => {
        if (document.body) {
            updateFlashingElements(); // Ensure the body exists before updating
        }
    }, 500); // Reduced delay for quicker updates
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Accessibility consideration: Disable flashing for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('.flashing-border, .overlay').forEach(element => {
        element.classList.remove('flashing-border');
        element.classList.remove('overlay');
    });
}
