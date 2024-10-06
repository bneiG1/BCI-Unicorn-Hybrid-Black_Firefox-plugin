// Debounce function to limit how often a function can be called
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to find clickable elements in view, limiting to the first 5 visible elements
function findClickableElementsInView(excludeElements) {
    const allElements = document.querySelectorAll('*');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Convert NodeList to an array and filter out excluded elements
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
               !excludedSet.has(element); // Exclude previously flashing elements
    }).slice(0, 5); // Limit to the first 5 clickable elements that are visible
}

// Function to add flashing border and overlay to elements
function addFlashingBorderAndOverlayToElements() {
    const clickableElements = findClickableElementsInView(previouslyFlashingElements);

    // Clean up previous overlays and borders
    const flashingElements = document.querySelectorAll('.flashing-border, .overlay');
    flashingElements.forEach(element => {
        element.classList.remove('flashing-border');
        element.classList.remove('overlay');
    });

    // Define frequencies for animation duration
    const frequencies = [0.1, 0.0333, 0.02]; // Corresponding to 10Hz, 30Hz, and 50Hz

    clickableElements.forEach(element => {
        const randomFrequency = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        element.classList.add('flashing-border');
        element.style.animationDuration = `${randomFrequency}s`;

        if (window.getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        // Create the overlay
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.style.animationDuration = `${randomFrequency}s`;
        element.appendChild(overlay);
    });

    // Log the currently flashing elements with timestamp
    const timestamp = new Date().toLocaleString();
    console.log(`Currently flashing elements at ${timestamp}:`, clickableElements);
    
    // Update the previously flashing elements
    previouslyFlashingElements.push(...clickableElements);
}

// Function to handle events and update flashing elements
const updateFlashingElements = debounce(() => {
    // Re-verify if the elements are still visible and update the array
    currentClickableElements = findClickableElementsInView([]); // Get all clickable elements
    addFlashingBorderAndOverlayToElements();
}, 200); // Adjust delay as needed

// Inactivity timer for switching flashing elements
let inactivityTimer;
let previouslyFlashingElements = []; // To track previously flashing elements
let currentClickableElements = []; // To track the currently visible clickable elements

// Function to reset the inactivity timer
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        switchToNextFlashingElements();
    }, 5000); // Change the delay to 5 seconds
}

// Function to switch to the next set of flashing elements
function switchToNextFlashingElements() {
    // Get the next set of clickable elements excluding previously flashed ones
    let nextClickableElements = findClickableElementsInView(previouslyFlashingElements);

    // If no new clickable elements are found, reset the previously flashing elements
    if (nextClickableElements.length === 0) {
        previouslyFlashingElements = []; // Reset the list of previously flashing elements
        nextClickableElements = findClickableElementsInView(previouslyFlashingElements); // Find clickable elements again from the beginning
    }

    if (nextClickableElements.length > 0) {
        addFlashingBorderAndOverlayToElements();
        
        // Log the switch with a timestamp
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
        0% { background-color: rgba(255, 255, 255, 0.5); } /* White with 0.5 opacity */
        100% { background-color: rgba(0, 0, 0, 0.5); } /* Black with 0.5 opacity */
    }

    .flashing-border {
        border: 2px solid black; /* Initial black border */
        animation: flash-border infinite alternate; /* Flashing border animation */
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.5; /* Set opacity */
        pointer-events: none; /* Allow interaction with the underlying element */
        animation: flash-overlay infinite alternate; /* Flashing overlay animation */
    }
`;
document.head.appendChild(style);

// Initialize elements on page load
window.onload = () => {
    currentClickableElements = findClickableElementsInView(previouslyFlashingElements);
    addFlashingBorderAndOverlayToElements();
};

// Listen for various events to update elements
const eventsToMonitor = [
    'scroll',
    'resize',
    'mousemove',
    'click',
    'keyup',
    'keydown',
    'touchstart',
    'touchmove'
];

// Attach event listeners to the window for each event type
eventsToMonitor.forEach(event => {
    window.addEventListener(event, (e) => {
        resetInactivityTimer(); // Reset the inactivity timer on any interaction
        updateFlashingElements(); // Update flashing elements and verify visibility
    });
});

// MutationObserver to detect changes in the DOM
let mutationTimeout; // Variable to hold timeout ID for mutation observer
const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout); // Clear the previous timeout
    mutationTimeout = setTimeout(() => {
        updateFlashingElements(); // Call the update function after 5 seconds
    }, 5000); // 5 seconds delay
});
observer.observe(document.body, {
    childList: true, // Watch for added or removed child elements
    subtree: true // Watch for changes in all descendants
});

// Accessibility consideration: Disable flashing for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.flashing-border, .overlay').forEach(element => {
        element.classList.remove('flashing-border');
        element.classList.remove('overlay');
    });
}
