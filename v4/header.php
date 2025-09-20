<header class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="index.php"><span style="color:#E53E3E">Re</span><span class="text-white">Claims</span><br><span class="finance" style="color:#E53E3E" class="">Finance</span></a>
            <button class="navbar-toggler mobile-navbar-toggle" type="button" aria-controls="mobileNavbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="desktopNavbar">
                <ul class="navbar-nav ms-auto gap-4">
                    <li class="nav-item"><a class="nav-link" href="index.php#about">About Us</a></li>
                    <li class="nav-item"><a class="nav-link" onclick="focusVehicleForm(event)" href="index.php#vehicle-check-form">Start Your Claim</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php#next-steps">Next Step</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php#faqs">FAQs</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php#resources">Resources</a></li>
                    <li class="nav-item"><a class="nav-link" onclick="scrollToFeesSection(event)" href="index.php#fees">Fees</a></li>
                    <div class="d-flex justify-content-end">
                    <li class="nav-item"><a class="nav-link bgcolor rounded-5 ms-2 px-4" href="contactus.php">Contact Us</a></li>
                    <li class="nav-item align-self-start align-self-md-center  ms-4">
                        <a class="nav-link p-0" href="index.php">
                            <img src="./assets/home.png" class="nav-image" style="height: 35px;" />
                        </a>
                      </li>
                    </div>
                </ul>
            </div>
        </div>
    </header> 

    <!-- Mobile Navbar -->
    <div class="mobile-navbar-overlay" id="mobileNavbar">
        <div class="mobile-navbar">
            <div class="mobile-navbar-header">
                <div class="mobile-navbar-brand">
                    <a href="index.php"><span style="color:#E53E3E">Re</span>Claims</a>
                    <span class="finance" style="color:#E53E3E">Finance</span>
                </div>
                <button class="mobile-navbar-close">&times;</button>
            </div>
            <nav class="mobile-navbar-nav">
                <div class="nav-item"><a class="nav-link" href="index.php#about">About Us</a></div>
                <div class="nav-item"><a class="nav-link" onclick="focusVehicleForm(event)" href="index.php#vehicle-check-form">Start Your Claim</a></div>
                <div class="nav-item"><a class="nav-link" href="index.php#next-steps">Next Step</a></div>
                <div class="nav-item"><a class="nav-link" href="index.php#faqs">FAQs</a></div>
                <div class="nav-item"><a class="nav-link" href="index.php#resources">Resources</a></div>
                <div class="nav-item"><a class="nav-link" onclick="scrollToFeesSection(event)" href="index.php#fees">Fees</a></div>
                <div class="nav-item"><a class="nav-link contact-link" href="contactus.php">Contact Us</a></div>
            </nav>
            <div class="mobile-navbar-footer">
                <a href="#">© 2023 ReClaims Finance</a>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const navbarToggle = document.querySelector('.mobile-navbar-toggle');
        const mobileNavbarOverlay = document.querySelector('.mobile-navbar-overlay');
        const mobileNavbar = document.querySelector('.mobile-navbar');
        const mobileNavbarClose = document.querySelector('.mobile-navbar-close');

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
    });
    </script> 