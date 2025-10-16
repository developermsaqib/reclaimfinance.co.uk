// DOM Elements

document.addEventListener('DOMContentLoaded', function () {
    // Form elements
    const token = new URLSearchParams(window.location.search).get('token');

    const firstButton = document.querySelector('.firstButton');
    const formDiv = document.getElementById('formdiv');
    const dealForm = document.getElementById('dealform');

    // If token exists, fetch data and show second step
    if (token) {
        fetch(`fetch-data.php?token=${token}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Hide first button and show form
                    if (firstButton) {
                        firstButton.style.display = 'none';
                        firstButton.classList.add('hidden');
                    }
                    if (formDiv) {
                        formDiv.style.display = 'block';
                        formDiv.classList.remove('hidden');
                    }

                    // Set current tab to 1 (step 2) and show it first
                    currentTab = 1;
                    showTab(currentTab);

                    // Fill form data after a longer delay to ensure elements are rendered
                    setTimeout(() => {
                        fillFormData(data.data);
                    }, 500);

                    // Show the continue button since we have data
                    const nextStep = document.querySelector('.nextStep');
                    if (nextStep) {
                        nextStep.classList.remove('hidden');
                        nextStep.textContent = 'Continue';
                    }
                } else {
                    console.error('Error fetching data:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Prevent default form submission
    if (dealForm) {
        dealForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }
    const tabs = document.querySelectorAll('.tab');
    const backStep = document.querySelector('.backStep');
    const nextStep = document.querySelector('.nextStep');
    let loaderDiv = document.querySelector('.loaderDiv');

    // Loader helper with nesting support
    let _loaderCount = 0;
        let _safetyTimer = null;
        function _createOverlay() {
        const existing = document.getElementById('globalLoaderOverlay');
        if (existing) return existing;
        const overlay = document.createElement('div');
        overlay.id = 'globalLoaderOverlay';
            overlay.setAttribute('aria-hidden', 'true');
            // Full-screen overlay styles
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.display = 'none';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.background = 'rgba(0,0,0,0.45)';
            overlay.style.zIndex = '9999';

            const box = document.createElement('div');
            box.style.display = 'flex';
            box.style.flexDirection = 'column';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.background = 'white';
            box.style.padding = '20px';
            box.style.borderRadius = '8px';
            box.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';

            const img = document.createElement('img');
            img.src = 'images/loader.gif';
            img.alt = 'loading';
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'contain';

            const h4 = document.createElement('h4');
            h4.style.marginTop = '12px';
            h4.style.fontSize = '18px';
            h4.style.fontWeight = '700';
            h4.textContent = 'Please wait...';

            box.appendChild(img);
            box.appendChild(h4);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            return overlay;
        }

        function showLoader(message) {
            _loaderCount++;
            try {
                    console.debug('showLoader called -> before show, count=', _loaderCount - 1, 'after=', _loaderCount, 'message=', message);
                    console.debug(new Error('showLoader stack').stack.split('\n').slice(1,4).join('\n'));
                const overlay = _createOverlay();
                const heading = overlay.querySelector('h4');
                if (heading && message) heading.textContent = message;
                overlay.style.display = 'flex';
                overlay.setAttribute('aria-hidden', 'false');
                // Optionally mark the form as busy for accessibility
                if (dealForm) dealForm.setAttribute('aria-busy', 'true');
                    // Safety: force hide after 30s to avoid permanently stuck overlay
                    if (_safetyTimer) clearTimeout(_safetyTimer);
                    _safetyTimer = setTimeout(() => {
                        console.warn('Loader safety timeout fired — forcing hide');
                        _loaderCount = 0;
                        try {
                            const overlayForce = document.getElementById('globalLoaderOverlay');
                            if (overlayForce) overlayForce.style.display = 'none';
                        } catch (e) { console.error(e); }
                    }, 30000);
            } catch (e) {
                console.error('Error showing loader overlay', e);
            }
        }

        function hideLoader() {
            _loaderCount = Math.max(0, _loaderCount - 1);
            console.debug('hideLoader called -> new count=', _loaderCount);
            console.debug(new Error('hideLoader stack').stack.split('\n').slice(1,4).join('\n'));
            if (_loaderCount === 0) {
                try {
                        if (_safetyTimer) { clearTimeout(_safetyTimer); _safetyTimer = null; }
                    console.debug('hideLoader: count reached 0 — hiding overlay');
                    const overlay = document.getElementById('globalLoaderOverlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                        overlay.setAttribute('aria-hidden', 'true');
                    }
                    if (dealForm) dealForm.removeAttribute('aria-busy');
                } catch (e) {
                    console.error('Error hiding loader overlay', e);
                }
            }
        }

    

    // Address elements
    const postcodeBtn = document.getElementById('postcodeBtn');
    const propertyDiv = document.querySelector('.propertyDiv');
    const selectedDiv = document.querySelector('.selectedDiv');
    const selectedAddress = document.querySelector('.selectedAddress');
    const selectedAddressError = document.querySelector('.selectedAddressError');

    // Previous address elements
    const addAddressBtn = document.querySelector('.addAddress');
    const removeAddressBtn = document.querySelector('.removeAddress');
    const prevAddressDiv = document.querySelector('.prevAddressDiv');
    const prevPostcodeBtn = document.getElementById('prevpostcodeBtn');
    const prevPropertyDiv = document.querySelector('.prevpropertyDiv');
    const prevSelectedDiv = document.querySelector('.prevselectedDiv');

    // Function to fill form data
    function fillFormData(data) {
        // Fill postcode and address
        if (data.postcode) {
            document.getElementById('postcode').value = data.postcode;
        }
        if (data.address) {
            formData.currentAddress = data.address;
            // Show selected address
            const selectedDiv = document.querySelector('.selectedDiv');
            const selectedAddress = document.querySelector('.selectedAddress');
            if (selectedDiv && selectedAddress) {
                selectedDiv.classList.remove('hidden');
                selectedAddress.textContent = data.address;
            }
        }

        // Fill IVA/Bankruptcy status
        if (data.iva_bankruptcy_status) {
            const ivaRadio = document.querySelector(`input[name="iva"][value="${data.iva_bankruptcy_status}"]`);
            if (ivaRadio) {
                ivaRadio.checked = true;
            }
        } else {
            // Set default to 'no' if not specified
            const ivaRadio = document.querySelector(`input[name="iva"][value="no"]`);
            if (ivaRadio) {
                ivaRadio.checked = true;
            }
        }

        // Fill title
        if (data.title) {
            const titleRadio = document.querySelector(`input[name="title"][value="${data.title}"]`);
            if (titleRadio) {
                titleRadio.checked = true;
            }
        }

        // Fill names
        if (data.firstname) {
            document.getElementById('first-name').value = data.firstname;
        }
        if (data.lastname) {
            document.getElementById('last-name').value = data.lastname;
        }
        if (data.previousname) {
            document.getElementById('previous-name').value = data.previousname;
        }

        // Fill email and phone
        if (data.email) {
            document.getElementById('email').value = data.email;
        }
        if (data.phone) {
            document.getElementById('phone').value = data.phone;
        }

        // Fill date of birth if available
        if (data.date_of_birth) {
            console.log('Filling date of birth:', data.date_of_birth);

            const dobParts = data.date_of_birth.split('-');
            console.log('Date parts:', dobParts);

            if (dobParts.length === 3) {
                // Keep leading zeros for proper formatting
                const day = dobParts[2];
                const month = dobParts[1];
                const year = dobParts[0];

                console.log('Parsed date:', { day, month, year });

                const daySelect = document.getElementById('dayOfBirth');
                const monthSelect = document.getElementById('monthOfBirth');
                const yearSelect = document.getElementById('yearOfBirth');

                console.log('Date select elements:', { daySelect, monthSelect, yearSelect });

                if (daySelect) {
                    daySelect.value = day;
                    console.log('Day set to:', daySelect.value);
                }
                if (monthSelect) {
                    monthSelect.value = month;
                    console.log('Month set to:', monthSelect.value);
                }
                if (yearSelect) {
                    yearSelect.value = year;
                    console.log('Year set to:', yearSelect.value);
                }

                // If elements weren't found, try again after a short delay
                if (!daySelect || !monthSelect || !yearSelect) {
                    console.log('Date elements not found, retrying...');
                    setTimeout(() => {
                        const retryDaySelect = document.getElementById('dayOfBirth');
                        const retryMonthSelect = document.getElementById('monthOfBirth');
                        const retryYearSelect = document.getElementById('yearOfBirth');

                        if (retryDaySelect) retryDaySelect.value = day;
                        if (retryMonthSelect) retryMonthSelect.value = month;
                        if (retryYearSelect) retryYearSelect.value = year;

                        console.log('Retry completed');
                    }, 200);
                }
            }
        } else {
            console.log('No date_of_birth in data');
        }

        // Update form data object
        formData.currentAddress = data.address || '';
        formData.previousAddress = data.previous_address || '';
    }

    // Form state
    let currentTab = 0;
    let formData = {
        currentAddress: '',
        previousAddress: '',
        bankruptcy: '',
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        marketing: false
    };

    // Validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    function validatePhone(phone) {
        const re = /^(?:(?:\+|00)44|0)7\d{9}$/;
        return re.test(phone.replace(/\s+/g, ''));
    }

    function validatePostcode(postcode) {
        const re = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
        return re.test(postcode);
    }

    function validateDOB(day, month, year) {
        const date = new Date(year, month - 1, day);
        const now = new Date();
        const minAge = 18;
        const maxAge = 100;

        if (date > now) return false;

        const age = (now - date) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= minAge && age <= maxAge;
    }

    // Form submission handling
    // Handle step navigation
    function showTab(n) {
        const tabs = document.querySelectorAll('.tab');
        const nextStep = document.querySelector('.nextStep');
        const backStep = document.querySelector('.backStep');

        tabs.forEach((tab, index) => {
            if (index === n) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        });

        // Update button states for 3 steps
        if (n === 0) {
            backStep.classList.add('hidden');
            nextStep.classList.remove('hidden');
            nextStep.textContent = 'Continue';
        } else if (n === 1) {
            backStep.classList.remove('hidden');
            nextStep.classList.remove('hidden');
            nextStep.textContent = 'Continue';
        } else if (n === 2) {
            backStep.classList.remove('hidden');
            nextStep.classList.remove('hidden');
            nextStep.textContent = 'Submit';
        }
    }

    // Function to get user's IP address
    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'unknown';
        }
    }

    // Function to get browser and device information
    function getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        let os = 'Unknown';
        let device = 'Desktop';

        // Detect browser
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Detect OS
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        // Detect device
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            device = 'Mobile';
        } else if (/iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)) {
            device = 'Tablet';
        }

        return { browser, os, device, userAgent };
    }

    // Function to format date for API
    function formatDateForAPI(day, month, year) {
        if (!day || !month || !year) return '';
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Function to extract address components
    function extractAddressComponents(address) {
        if (!address) return { street: '', postTown: '', houseNumber: '', county: '' };

        const parts = address.split(',');
        const street = parts[0] || '';
        const postTown = parts[parts.length - 3] || '';
        const county = parts[parts.length - 2] || '';

        // Extract house number from street
        const houseNumberMatch = street.match(/^(\d+)/);
        const houseNumber = houseNumberMatch ? houseNumberMatch[1] : '';

        return { street, postTown, houseNumber, county };
    }

    async function handleFormSubmission() {
        // Validate signature and terms
        const requiredCheckbox = document.querySelector('.form-checkbox2');
        const canvas = document.getElementById('signature-pad');

        if (!requiredCheckbox || !requiredCheckbox.checked) {
            alert('Please confirm the terms and conditions');
            return;
        }

        if (canvas && signaturePad && signaturePad.isEmpty()) {
            document.querySelector('.signatureError').classList.remove('hidden');
            return;
        }

    // Show loader
    showLoader('Please wait while we submit your form...');

        try {
            // Set submission time
            const submissionTime = new Date().toLocaleString('en-GB', {
                timeZone: 'Europe/London',
                hour12: false
            });
            document.getElementById('submission_time').value = submissionTime;

            // Get system information
            const ipAddress = await getUserIP();
            const browserInfo = getBrowserInfo();

            // Get signature time
            const signatureTime = document.getElementById('signature_time').value || new Date().toLocaleString('en-GB', {
                timeZone: 'Europe/London',
                hour12: false
            });

            // Get landing time
            const landingTime = document.querySelector('.landing_time').value;

            // Get form data
            const bankruptcy = document.querySelector('input[name="iva"]:checked')?.value || '';
            const title = document.querySelector('input[name="title"]:checked')?.value || '';
            const firstName = document.getElementById('first-name')?.value || '';
            const lastName = document.getElementById('last-name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const day = document.getElementById('dayOfBirth')?.value || '';
            const month = document.getElementById('monthOfBirth')?.value || '';
            const year = document.getElementById('yearOfBirth')?.value || '';
            // Use the correct field name for signature as expected by PHP
            const signatureBase64 = document.getElementById('hiddenInputFieldSignature')?.value || '';

            // Format date of birth
            const dateOfBirth = formatDateForAPI(day, month, year);

            // Extract address components
            const currentAddressComponents = extractAddressComponents(formData.currentAddress);
            const previousAddressComponents = extractAddressComponents(formData.previousAddress);

            // Prepare form data for PHP proxy
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('postCode', document.getElementById('postcode')?.value || '');
            formDataToSubmit.append('street', currentAddressComponents.street);
            formDataToSubmit.append('postTown', currentAddressComponents.postTown);
            formDataToSubmit.append('houseNumber', currentAddressComponents.houseNumber);
            formDataToSubmit.append('email', email);
            formDataToSubmit.append('firstname', firstName);
            formDataToSubmit.append('lastname', lastName);
            formDataToSubmit.append('county', currentAddressComponents.county);
            formDataToSubmit.append('title', title);
            formDataToSubmit.append('date_of_birth', dateOfBirth);
            formDataToSubmit.append('phone', phone);
            formDataToSubmit.append('signatureUrl', ''); // Skip as requested
            formDataToSubmit.append('aff_id', '666'); // Default value, can be changed
            formDataToSubmit.append('fullAddressPrevious', formData.previousAddress || '');
            formDataToSubmit.append('street2', '12'); // Default value as shown in example
            formDataToSubmit.append('iva', bankruptcy);
            formDataToSubmit.append('fullAddressCurrent', formData.currentAddress || '');
            formDataToSubmit.append('source', 'Reclaims'); // Default value

            // Include token if it exists
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
                formDataToSubmit.append('token', token);
            }
            formDataToSubmit.append('signatureBase64', signatureBase64); // PHP expects this field
            formDataToSubmit.append('userBrowser', browserInfo.browser);
            formDataToSubmit.append('userOs', browserInfo.os);
            formDataToSubmit.append('userDevice', browserInfo.device);
            formDataToSubmit.append('landingTime', landingTime);
            formDataToSubmit.append('signatureTime', signatureTime);
            formDataToSubmit.append('submissionTime', submissionTime);
            formDataToSubmit.append('userAgent', browserInfo.userAgent);
            formDataToSubmit.append('claimPdfUrl', ''); // Skip as requested
            formDataToSubmit.append('contactId', ''); // Skip as requested
            formDataToSubmit.append('ipAddress', ipAddress);
            formDataToSubmit.append('kyc', ''); // Skip as requested

            // Submit form data to server using AJAX only
            try {
                const response = await fetch('./submit-form.php', {
                    method: 'POST',
                    body: formDataToSubmit
                });

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                const responseData = await response.json();
                if (responseData.success) {
                    window.location.href = 'thankyou.html';
                } else {
                    throw new Error(responseData.error || 'Form submission failed');
                }
                } catch (phpError) {
                    console.error('Error submitting form:', phpError);
                    hideLoader();
                    alert('There was a problem sending your data. Please check your connection and try again.');
                }
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            alert('There was an error submitting your form. Please try again.');
        }
    }

    function validateCurrentStep() {
        // Clear all previous error messages
        clearAllErrorMessages();

        if (currentTab === 0) {
            // Step 1: Address
            if (!formData.currentAddress) {
                selectedAddressError.classList.remove('hidden');
                selectedAddressError.textContent = 'Please select your address';
                return false;
            }
            if (!prevAddressDiv.classList.contains('hidden') && !formData.previousAddress) {
                document.querySelector('.prevselectedAddressError').classList.remove('hidden');
                document.querySelector('.prevselectedAddressError').textContent = 'Please select your previous address';
                return false;
            }
            return true;
        } else if (currentTab === 1) {
            // Step 2: IVA, Title, Name, DOB, Email, Phone
            let isValid = true;
            const errors = [];

            const bankruptcy = document.querySelector('input[name="iva"]:checked');
            const title = document.querySelector('input[name="title"]:checked');
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const dayInput = document.getElementById('dayOfBirth');
            const monthInput = document.getElementById('monthOfBirth');
            const yearInput = document.getElementById('yearOfBirth');

            const firstName = firstNameInput ? firstNameInput.value.trim() : '';
            const lastName = lastNameInput ? lastNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const day = dayInput ? dayInput.value : '';
            const month = monthInput ? monthInput.value : '';
            const year = yearInput ? yearInput.value : '';

            // Validate each field and show specific error messages
            if (!bankruptcy) {
                errors.push('Please select whether you have been in an IVA or declared bankrupt');
                isValid = false;
            }
            if (!title) {
                errors.push('Please select your title');
                isValid = false;
            }
            if (!firstName) {
                errors.push('Please enter your first name');
                isValid = false;
            }
            if (!lastName) {
                errors.push('Please enter your last name');
                isValid = false;
            }
            if (!email) {
                errors.push('Please enter your email address');
                isValid = false;
            } else if (!validateEmail(email)) {
                errors.push('Please enter a valid email address');
                isValid = false;
            }
            if (!phone) {
                errors.push('Please enter your phone number');
                isValid = false;
            } else if (!validatePhone(phone)) {
                errors.push('Please enter a valid UK phone number (starting with 07)');
                isValid = false;
            }
            if (!day || !month || !year) {
                errors.push('Please select your complete date of birth');
                isValid = false;
            } else if (!validateDOB(day, month, year)) {
                errors.push('Please enter a valid date of birth (you must be 18-100 years old)');
                isValid = false;
            }

            // Show all errors
            if (!isValid) {
                showValidationErrors(errors);
            }

            return isValid;
        } else if (currentTab === 2) {
            // Step 3: Terms acceptance, signature, and final submit
            let isValid = true;
            const errors = [];

            // Check required checkboxes
            const requiredCheckbox = document.querySelector('.form-checkbox2');
            if (requiredCheckbox && !requiredCheckbox.checked) {
                errors.push('Please confirm the terms and conditions');
                isValid = false;
            }

            // Check signature
            const canvas = document.getElementById('signature-pad');
            const signatureInput = document.querySelector('.hiddenInputFieldSignature');
            if (canvas && signatureInput && signaturePad) {
                if (signaturePad.isEmpty()) {
                    errors.push('Please provide your signature');
                    isValid = false;
                } else {
                    signatureInput.value = signaturePad.toDataURL();
                    document.querySelector('.signatureError')?.classList.add('hidden');
                }
            } else {
                errors.push('Please provide your signature');
                isValid = false;
            }

            // Show all errors
            if (!isValid) {
                showValidationErrors(errors);
            }

            return isValid;
        }
        return false;
    }

    // Function to clear all error messages
    function clearAllErrorMessages() {
        // Clear address errors
        if (selectedAddressError) selectedAddressError.classList.add('hidden');
        const prevAddressError = document.querySelector('.prevselectedAddressError');
        if (prevAddressError) prevAddressError.classList.add('hidden');

        // Clear email error
        const emailError = document.querySelector('.emailError');
        if (emailError) emailError.classList.add('hidden');

        // Clear signature error
        const signatureError = document.querySelector('.signatureError');
        if (signatureError) signatureError.classList.add('hidden');

        // Clear all error divs
        document.querySelectorAll('.error-div').forEach(div => {
            div.textContent = '';
            div.classList.add('hidden');
        });

        document.querySelectorAll('.error-checkbox').forEach(div => {
            div.textContent = '';
            div.classList.add('hidden');
        });
    }

    // Function to show validation errors
    function showValidationErrors(errors) {
        if (errors.length === 0) return;

        // Create or update error message container
        let errorContainer = document.getElementById('validation-errors');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'validation-errors';
            errorContainer.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
            errorContainer.style.marginTop = '10px';

            // Insert after the form
            const form = document.getElementById('dealform');
            if (form) {
                form.insertBefore(errorContainer, form.firstChild);
            }
        }

        // Show errors
        errorContainer.innerHTML = `
            <strong>Please fix the following errors:</strong>
            <ul class="mt-2 list-disc list-inside">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        errorContainer.classList.remove('hidden');

        // Scroll to error message
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Show initial form when "Find My Agreements" is clicked
    firstButton.addEventListener('click', function () {
        document.getElementById('formdiv').classList.remove('hidden');
        firstButton.classList.add('hidden');
        // Hide continue button initially until address is selected
        document.querySelector('.nextStep').classList.add('hidden');
    });

    // Set the landing time when the page loads
    const landingTime = new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        hour12: false
    });
    document.querySelector('.landing_time').value = landingTime;

    // Postcode lookup functionality
    function handlePostcodeLookup(postcode, propertyDivSelector, propertySelector, spinnerSelector) {
        if (!postcode || postcode.length < 5) return; // Don't search for very short postcodes

        const spinner = document.querySelector(spinnerSelector);
        const propertyDiv = document.querySelector(propertyDivSelector);
        const propertyContainer = document.querySelector(propertySelector);
        const nextStep = document.querySelector('.nextStep');

        spinner.classList.remove('hidden');
        nextStep.classList.add('hidden');

        // API configuration
        const apiKey = "Mu2P8Fp9G0W8ZKNwTo44IQ25787";
        const url = `https://api.getaddress.io/find/${postcode}?api-key=${apiKey}&expand=true`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                spinner.classList.add('hidden');
                propertyDiv.classList.remove('hidden');

                // Clear previous options
                propertyContainer.innerHTML = '';

                // Add default option
                const defaultOption = document.createElement('a');
                defaultOption.value = '';
                propertyContainer.appendChild(defaultOption);

                // Add address options
                if (data.addresses && data.addresses.length > 0) {
                    data.addresses.forEach((address) => {
                        const option = document.createElement('a');
                        option.href = '#';

                        // Format address parts
                        const addressParts = [
                            address.line_1,
                            address.line_2,
                            address.line_3,
                            address.line_4,
                            address.locality,
                            address.town_or_city,
                            address.county,
                            postcode.toUpperCase()
                        ].filter(Boolean); // Remove empty values

                        // Create formatted address
                        const formattedAddress = addressParts.join(', ');

                        // Add data attributes
                        option.className = 'address-link';
                        option.setAttribute('data-fulladdress', formattedAddress);
                        option.setAttribute('data-street', address.thoroughfare || address.line_1 || '');
                        option.setAttribute('data-city', address.town_or_city || '');
                        option.setAttribute('data-province', address.county || '');
                        option.setAttribute('data-building', address.building_number || address.building_name || '');
                        option.setAttribute('data-pxl', '_n' + Math.floor(Math.random() * 1000));

                        option.textContent = formattedAddress;
                        propertyContainer.appendChild(option);
                    });

                    // Style the select container
                    propertyContainer.className = 'property';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                spinner.classList.add('hidden');
                alert('Error finding address. Please try again.');
            });
    }

    // Current address postcode input handling
    document.getElementById('postcode').addEventListener('input', function (e) {
        const postcode = e.target.value.trim();
        if (postcode && postcode.length >= 5) {
            handlePostcodeLookup(postcode, '.propertyDiv', '#property', '.spinner-border');
        }
    });

    // Handle Find button click for current address
    postcodeBtn.addEventListener('click', function () {
        const postcode = document.getElementById('postcode').value.trim();
        if (postcode) {
            handlePostcodeLookup(postcode, '.propertyDiv', '#property', '.spinner-border');
        }
    });

    // Handle current address selection
    document.getElementById('property').addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.classList.contains('address-link')) {
            const selectedValue = e.target.getAttribute('data-fulladdress');
            const nextStep = document.querySelector('.nextStep');

            if (selectedValue) {
                selectedDiv.classList.remove('hidden');
                selectedDiv.style.display = 'block';
                selectedDiv.setAttribute('data-pxl', '_n108');

                // Update the heading
                const heading = selectedDiv.querySelector('h4');
                if (!heading) {
                    const h4 = document.createElement('h4');
                    h4.className = 'text-lg mb-0 mt-5 text-left';
                    h4.setAttribute('data-pxl', '_n109');
                    h4.textContent = 'Selected Address';
                    selectedDiv.insertBefore(h4, selectedDiv.firstChild);
                }

                // Update selected address
                selectedAddress.className = 'selectedAddress text-left text-sm';
                selectedAddress.setAttribute('data-pxl', '_n110');
                selectedAddress.textContent = selectedValue;

                // Update error message styling
                selectedAddressError.className = 'selectedAddressError text-red-400 text-sm hidden';
                selectedAddressError.setAttribute('data-pxl', '_n111');
                selectedAddressError.textContent = 'Please select your Address';

                formData.currentAddress = selectedValue;

                // Show and update continue button
                nextStep.classList.remove('hidden');
                nextStep.textContent = 'Continue';
                nextStep.classList.add("nextStep", "bg-accent2", "text-xl", "w-auto", "px-10", "text-center", "py-4", "rounded-lg", "font-bold", "text-white");

                // Hide the address options after selection
                propertyDiv.classList.add('hidden');
            } else {
                nextStep.classList.add('hidden');
            }
        }
    });

    // Previous address handling
    addAddressBtn.addEventListener('click', function () {
        prevAddressDiv.classList.remove('hidden');
        removeAddressBtn.classList.remove('hidden');
        addAddressBtn.classList.add('hidden');
    });

    removeAddressBtn.addEventListener('click', function () {
        prevAddressDiv.classList.add('hidden');
        removeAddressBtn.classList.add('hidden');
        addAddressBtn.classList.remove('hidden');

        // Clear previous address data
        document.getElementById('prevpostcode').value = '';
        document.querySelector('.prevproperty').innerHTML = '';
        document.querySelector('.prevselectedAddress').textContent = '';
        formData.previousAddress = '';

        prevPropertyDiv.classList.add('hidden');
        prevSelectedDiv.classList.add('hidden');
    });

    // Previous address postcode lookup
    prevPostcodeBtn.addEventListener('click', function () {
        const prevPostcode = document.getElementById('prevpostcode').value.trim();
        if (prevPostcode) {
            handlePostcodeLookup(prevPostcode, '.prevpropertyDiv', '#prevproperty', '.spinner-border2');
        }
    });

    // Handle previous address selection
    document.getElementById('prevproperty').addEventListener('change', function (e) {
        const selectedValue = e.target.value;
        if (selectedValue) {
            prevSelectedDiv.classList.remove('hidden');
            document.querySelector('.prevselectedAddress').textContent = selectedValue;
            document.querySelector('.prevselectedAddressError').classList.add('hidden');
            formData.previousAddress = selectedValue;
        }
    });

    // Send step-2 data to webhook via server proxy to avoid CORS issues
    async function sendStep2Webhook(firstName, lastName, phone, email, token) {
        try {
            showLoader('Sending Email...');
            // Generate a more complex unique token for each submission (letters, numbers, special chars)
            // function generateComplexToken(length = 32) {
            //     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            //     let token = 'rf_';
            //     for (let i = 0; i < length; i++) {
            //         token += chars.charAt(Math.floor(Math.random() * chars.length));
            //     }
            //     return token;
            // }
            // const token = generateComplexToken();

            const payload = {
                firstName: firstName || '',
                lastName: lastName || '',
                phoneNumber: phone || '',
                Email: email || '',
                Link: `https://reclaimsfinance.co.uk/v1/?token=${encodeURIComponent(token)}`
            };

            // Send to local PHP proxy which will forward to the real webhook
            const res = await fetch('webhook-proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Try to parse response (proxy returns JSON)
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                console.warn('Webhook proxy returned non-OK status', res.status, data);
                return { ok: false, status: res.status, data };
            }
            return { ok: true, status: res.status, data };
        } catch (err) {
            console.error('Error sending step2 webhook:', err);
            return { ok: false, error: err };
        } finally {
            hideLoader();
        }
    }

    // Next/Previous buttons
    nextStep.addEventListener('click', async function () {
        if (!validateCurrentStep()) {
            return false;
        }

        // If this is the final submission from step 3
        if (currentTab === 2) {
            await handleFormSubmission();
            return;
        }

        // If on step 2 (index 1), save data and send webhook before moving to step 3
        if (currentTab === 1) {
            // Get form values safely with error checking
            const titleEl = document.querySelector('input[name="title"]:checked');
            const firstNameEl = document.getElementById('first-name');
            const lastNameEl = document.getElementById('last-name');
            const phoneEl = document.getElementById('phone');
            const emailEl = document.getElementById('email');
            const postcodeEl = document.getElementById('postcode');
            const ivaEl = document.querySelector('input[name="iva"]:checked');

            // Validate required fields (excluding previousName as it's optional)
            if (!titleEl) {
                alert('Please select your title');
                return false;
            }
            if (!firstNameEl || !firstNameEl.value.trim()) {
                alert('Please enter your first name');
                return false;
            }
            if (!lastNameEl || !lastNameEl.value.trim()) {
                alert('Please enter your last name');
                return false;
            }
            if (!phoneEl || !phoneEl.value.trim()) {
                alert('Please enter your phone number');
                return false;
            }
            if (!emailEl || !emailEl.value.trim()) {
                alert('Please enter your email');
                return false;
            }
            if (!postcodeEl || !postcodeEl.value.trim()) {
                alert('Please enter your postcode');
                return false;
            }
            if (!ivaEl) {
                alert('Please select whether you have been in an IVA or declared bankrupt');
                return false;
            }

            // Get values
            const title = titleEl.value;
            const firstName = firstNameEl.value.trim();
            const lastName = lastNameEl.value.trim();
            const phone = phoneEl.value.trim();
            const email = emailEl.value.trim();
            const postcode = postcodeEl.value.trim();
            const iva = ivaEl.value;

            // Get date of birth
            const day = document.getElementById('dayOfBirth')?.value || '';
            const month = document.getElementById('monthOfBirth')?.value || '';
            const year = document.getElementById('yearOfBirth')?.value || '';
            const dateOfBirth = day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';

            // Previous name is optional
            const previousNameEl = document.querySelector('input[name="previousName"]');
            const previousName = previousNameEl ? previousNameEl.value.trim() : '';

            // Get address from selected address display
            const address = selectedAddress ? selectedAddress.textContent.trim() : '';

            // First send webhook


            // Then save data and get unique link
            try {
                // Show loader while submitting
                showLoader('Please wait while we save your details...');

                const formData = {
                    firstName,
                    lastName,
                    iva,
                    phoneNumber: phone, // Match the field name from the form
                    email,
                    postcode,
                    address,
                    title,
                    previousName,
                    dateOfBirth
                };

                const response = await fetch('save-step2.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                let responseText;
                try {
                    responseText = await response.text();
                    console.log("Raw response Text:", responseText);
                    const parsedResponse = JSON.parse(responseText)
                    const token = await parsedResponse.token;
                    try {
                        await sendStep2Webhook(firstName, lastName, phone, email, token);
                    } catch (error) {
                        console.error('Webhook error:', error);
                        // Continue even if webhook fails
                    }

                    // Check if response is empty or not JSON
                    if (!responseText || responseText.trim() === '') {
                        throw new Error('Server returned empty response');
                    }

                    // Try to parse as JSON
                    let result;
                    try {
                        result = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Failed to parse JSON response:', parseError);
                        console.error('Response was:', responseText);
                        throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100) + '...');
                    }

                    if (!response.ok) {
                        throw new Error(result.error || `Server returned ${response.status}`);
                    }

                    if (!result.success) {
                        throw new Error(result.error || 'Failed to save data');
                    }

                    // If successful, move to step 3
                    if (result.success) {
                        // Hide loader and show form
                        hideLoader();

                        // Move to step 3
                        currentTab = 2;
                        showTab(currentTab);

                        // Initialize signature pad
                        const canvas = document.getElementById('signature-pad');
                        if (canvas) {
                            // Clear any existing content
                            const ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            // Setup canvas for signature
                            canvas.width = canvas.offsetWidth;
                            canvas.height = canvas.offsetHeight;
                            canvas.style.backgroundColor = 'rgb(255, 255, 255)';

                            // Initialize the signature pad
                            const clearButton = document.querySelector('[data-action="click->new-form#clearSignature"]');
                            if (clearButton) {
                                clearButton.onclick = function () {
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                };
                            }
                        }

                        return result;
                    } else {
                        throw new Error(result.error || 'Failed to save data');
                    }
                } catch (error) {
                    console.error('Response Text:', responseText);
                    hideLoader();
                    throw error;
                }
            } catch (error) {
                console.error('Error:', error);
                // Hide loader and show form again on error
                hideLoader();

                // More user-friendly error message
                let errorMessage = 'An error occurred while saving your data. ';
                if (error.message.includes('Server returned invalid JSON')) {
                    errorMessage += 'Please try again in a few moments.';
                } else {
                    errorMessage += error.message;
                }

                alert(errorMessage);
                return;
            }
        }

        // Move to next tab (this only happens for step 1 -> 2 now)
        currentTab++;
        showTab(currentTab);
    });

    backStep.addEventListener('click', function () {
        if (currentTab > 0) {
            currentTab--;
            showTab(currentTab);
        }
    });

    // Clear validation errors when inputs change
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function () {
            clearValidationErrors();
        });
        input.addEventListener('change', function () {
            clearValidationErrors();
        });
    });

    // Function to clear validation error container
    function clearValidationErrors() {
        const errorContainer = document.getElementById('validation-errors');
        if (errorContainer) {
            errorContainer.classList.add('hidden');
        }
    }

    // --- Signature Pad Functionality ---
    const signatureCanvas = document.getElementById('signature-pad');
    const clearSignatureBtn = document.querySelector('[data-action="click->new-form#clearSignature"]');
    const signatureInput = document.querySelector('.hiddenInputFieldSignature');
    let signaturePad = null;

    if (signatureCanvas && clearSignatureBtn && signatureInput) {
        // Set canvas dimensions
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
        signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
        signatureCanvas.getContext("2d").scale(ratio, ratio);

        // Initialize SignaturePad with proper configuration
        signaturePad = new SignaturePad(signatureCanvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16, // Increase smoothness
            velocityFilterWeight: 0.7
        });

        // Clear button functionality
        clearSignatureBtn.addEventListener('click', function () {
            signaturePad.clear();
            signatureInput.value = '';
            document.querySelector('.signatureError')?.classList.add('hidden');
        });

        // Handle end of signature
        signaturePad.addEventListener('endStroke', () => {
            // Save signature to hidden input
            const signatureData = signaturePad.toDataURL('image/png');
            signatureInput.value = signatureData;

            // Set signature time
            const signatureTime = new Date().toLocaleString('en-GB', {
                timeZone: 'Europe/London',
                hour12: false
            });
            document.getElementById('signature_time').value = signatureTime;

            // Hide error message if signature exists
            if (!signaturePad.isEmpty()) {
                document.querySelector('.signatureError')?.classList.add('hidden');
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const data = signaturePad.toData();

            signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
            signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
            signatureCanvas.getContext("2d").scale(ratio, ratio);

            signaturePad.clear();
            if (data) {
                signaturePad.fromData(data);
            }
        });

        // Test function to verify signature (for debugging)
        window.testSignature = function () {
            const testData = signaturePad.toDataURL('image/png');
            return !signaturePad.isEmpty() && testData.startsWith('data:image/png;base64,');
        };
    }

});
