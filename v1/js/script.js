// Load header
fetch('./header.php')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;
    // Initialize mobile navbar after header is loaded
    initializeMobileNavbar();
  });

// Load footer
fetch('./footer.php')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });

function includeHTML(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            // Initialize mobile navbar after content is loaded
            if (id === 'header') {
                initializeMobileNavbar();
            }
        });
}

// Mobile Navbar Initialization Function
function initializeMobileNavbar() {
    const navbarToggle = document.querySelector('.mobile-navbar-toggle');
    const mobileNavbarOverlay = document.querySelector('.mobile-navbar-overlay');
    const mobileNavbar = document.querySelector('.mobile-navbar');
    const mobileNavbarClose = document.querySelector('.mobile-navbar-close');

    // Ensure elements exist before adding event listeners
    if (navbarToggle && mobileNavbarOverlay && mobileNavbar && mobileNavbarClose) {
        // Toggle mobile navbar when toggle button is clicked
        navbarToggle.addEventListener('click', function() {
            mobileNavbar.classList.toggle('show');
            mobileNavbarOverlay.classList.toggle('show');
            
            // Update aria-expanded attribute
            this.setAttribute('aria-expanded', 
                this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Close mobile navbar when close button is clicked
        mobileNavbarClose.addEventListener('click', function() {
            mobileNavbar.classList.remove('show');
            mobileNavbarOverlay.classList.remove('show');
            navbarToggle.setAttribute('aria-expanded', 'false');
        });

        // Close mobile navbar when clicking outside
        mobileNavbarOverlay.addEventListener('click', function(e) {
            if (e.target === mobileNavbarOverlay) {
                mobileNavbar.classList.remove('show');
                mobileNavbarOverlay.classList.remove('show');
                navbarToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Add event listeners to mobile navbar links to close menu when clicked
        const mobileNavLinks = document.querySelectorAll('.mobile-navbar-nav .nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNavbar.classList.remove('show');
                mobileNavbarOverlay.classList.remove('show');
                navbarToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    includeHTML('header', 'header.php');
    includeHTML('footer', 'footer.php');

    // Handle smooth scrolling for anchor links
    function scrollToSection() {
        // Check if there's a hash in the URL
        if (window.location.hash) {
            const targetSection = document.querySelector(window.location.hash);
            if (targetSection) {
                // Wait a bit for the page to fully load
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    // If the hash is for vehicle form, focus the input
                    if(window.location.hash === '#vehicle-check-form') {
                        focusVehicleInput();
                    }
                }, 100);
            }
        }
    }

    // Call scrollToSection when page loads
    scrollToSection();

    // Add click event listeners for smooth scrolling
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.hash && !e.target.onclick) {
            const targetSection = document.querySelector(e.target.hash);
            if (targetSection) {
                e.preventDefault();
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Update URL without page reload
                history.pushState(null, null, e.target.hash);
            }
        }
    });

    // Initialize mobile navbar
    initializeMobileNavbar();
});

// Function to handle fees section navigation
function scrollToFeesSection(event) {
    event.preventDefault();
    
    // Check if current page has a fees section
    const feesSection = document.getElementById('fees');
    
    if (feesSection) {
        // If fees section exists on current page, scroll to it
        feesSection.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, null, '#fees');
    } else {
        // If no fees section on current page, navigate to index.php#fees
        window.location.href = 'index.php#fees';
    }
}

// Function to focus the vehicle form input
function focusVehicleInput() {
    // Wait for the form to be fully loaded
    setTimeout(() => {
        // Try to find the input field - adjust the selector based on the actual form structure
        const formContainer = document.getElementById('vehicle-form-container');
        if (formContainer) {
            const input = formContainer.querySelector('input[type="text"]');
            if (input) {
                input.focus();
            }
        }
    }, 500); // Give enough time for the form to load
}

// Function to handle vehicle form focus
function focusVehicleForm(event) {
    event.preventDefault();
    const formSection = document.getElementById('vehicle-check-form');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, null, '#vehicle-check-form');
        focusVehicleInput();
    } else {
        window.location.href = 'index.php#vehicle-check-form';
    }
}
