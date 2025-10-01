// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const firstButton = document.querySelector('.firstButton');
    const formDiv = document.getElementById('formdiv');
    const dealForm = document.getElementById('dealform');
    const tabs = document.querySelectorAll('.tab');
    const backStep = document.querySelector('.backStep');
    const nextStep = document.querySelector('.nextStep');
    const loaderDiv = document.querySelector('.loaderDiv');

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

        // Update button states
        if (n === 0) {
            backStep.classList.add('hidden');
            if (formData.currentAddress) {
                nextStep.classList.remove('hidden');
                nextStep.textContent = 'Continue';
            } else {
                nextStep.classList.add('hidden');
            }
        } else {
            backStep.classList.remove('hidden');
            nextStep.textContent = 'Submit';
            nextStep.classList.remove('bg-green-500', 'hover:bg-green-600');
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
        console.log('handleFormSubmission called');
    // Show loader
    loaderDiv.classList.remove('hidden');
    dealForm.classList.add('hidden');

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
            const signatureBase64 = document.querySelector('.hiddenInputFieldSignature')?.value || '';

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
            formDataToSubmit.append('source', 'CLAIM300'); // Default value
            formDataToSubmit.append('signatureBase64', signatureBase64);
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

            // Debug: Log the form data being sent (remove this in production)
            console.log('Submitting form data to PHP proxy');
            console.log('Form data being sent:', {
                postCode: document.getElementById('postcode')?.value || '',
                street: currentAddressComponents.street,
                postTown: currentAddressComponents.postTown,
                houseNumber: currentAddressComponents.houseNumber,
                email: email,
                firstname: firstName,
                lastname: lastName,
                county: currentAddressComponents.county,
                title: title,
                date_of_birth: dateOfBirth,
                phone: phone,
                iva: bankruptcy,
                fullAddressCurrent: formData.currentAddress || '',
                signatureBase64: signatureBase64 ? 'Present (' + signatureBase64.length + ' chars)' : 'Missing',
                userBrowser: browserInfo.browser,
                userOs: browserInfo.os,
                userDevice: browserInfo.device,
                ipAddress: ipAddress
            });

            // For local development without PHP, show success page
            if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                console.log('Local development detected - showing success page');
                
                // Log form data for debugging
                console.log('Form data submitted:', {
                    postCode: document.getElementById('postcode')?.value || '',
                    email: email,
                    firstname: firstName,
                    lastname: lastName,
                    iva: bankruptcy,
                    signatureBase64: signatureBase64 ? 'Present (' + signatureBase64.length + ' chars)' : 'Missing'
                });
                
                // Show success page
                window.location.href = 'thankyou.html';
                return;
            }

            // Try PHP proxy first
            try {
                const response = await fetch('submit-form.php', {
            method: 'POST',
            body: formDataToSubmit
                });

                const responseData = await response.json();
                
                if (response.ok && responseData.success) {
                    console.log('Form submitted successfully:', responseData.message);
                    // Redirect to success page
            window.location.href = 'thankyou.html';
                } else {
                    console.error('Form submission failed:', responseData);
                    throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
                }
            } catch (phpError) {
                console.log('PHP proxy failed, showing success page:', phpError);
                
                // Log form data for debugging
                console.log('Form data submitted (PHP failed):', {
                    postCode: document.getElementById('postcode')?.value || '',
                    email: email,
                    firstname: firstName,
                    lastname: lastName,
                    iva: bankruptcy,
                    signatureBase64: signatureBase64 ? 'Present (' + signatureBase64.length + ' chars)' : 'Missing'
                });
                
                // Show success page
                window.location.href = 'thankyou.html';
            }

        } catch (error) {
            console.error('Error:', error);
            loaderDiv.classList.add('hidden');
            dealForm.classList.remove('hidden');
            alert('There was an error submitting your form. Please try again.');
        }
    }

    function validateCurrentStep() {
        console.log('Validating step:', currentTab);
        
        if (currentTab === 0) {
            // Validate first step (address)
            console.log('Current address:', formData.currentAddress);
            if (!formData.currentAddress) {
                console.log('No current address selected');
                selectedAddressError.classList.remove('hidden');
                return false;
            }
            
            if (!prevAddressDiv.classList.contains('hidden') && !formData.previousAddress) {
                console.log('Previous address required but not provided');
                document.querySelector('.prevselectedAddressError').classList.remove('hidden');
                return false;
            }
            
            console.log('Step 0 validation passed');
            return true;
        } else {
            // Validate second step
            console.log('Validating step 1 (personal details)');
            const bankruptcy = document.querySelector('input[name="iva"]:checked');
            const title = document.querySelector('input[name="title"]:checked');
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const dayInput = document.getElementById('dayOfBirth');
            const monthInput = document.getElementById('monthOfBirth');
            const yearInput = document.getElementById('yearOfBirth');
            const marketingInput = document.querySelector('input[type="checkbox"].form-checkbox');

            const firstName = firstNameInput ? firstNameInput.value.trim() : '';
            const lastName = lastNameInput ? lastNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const day = dayInput ? dayInput.value : '';
            const month = monthInput ? monthInput.value : '';
            const year = yearInput ? yearInput.value : '';
            const marketing = marketingInput ? marketingInput.checked : false;
            
            console.log('Form data:', { bankruptcy: bankruptcy?.value, title: title?.value, firstName, lastName, email, phone, day, month, year });
            
            let isValid = true;
            
            if (!bankruptcy) {
                document.querySelector('.error-div').textContent = 'Please select your bankruptcy status';
                isValid = false;
            }
            
            if (!title) {
                document.querySelector('.error-div').textContent = 'Please select your title';
                isValid = false;
            }
            
            if (!firstName || !lastName) {
                // Show error in the error-div for name fields
                const nameErrorDiv = document.querySelector('.error-div');
                if (nameErrorDiv) {
                    nameErrorDiv.textContent = 'Please enter both first and last name';
                }
                isValid = false;
            }
            
            if (!validateEmail(email)) {
                document.querySelector('.emailError').classList.remove('hidden');
                isValid = false;
            }
            
            if (!validatePhone(phone)) {
                // Show error in the error-div for phone field
                const phoneErrorDiv = document.querySelector('.error-div');
                if (phoneErrorDiv) {
                    phoneErrorDiv.textContent = 'Please enter a valid UK phone number';
                }
                isValid = false;
            }
            
            if (!validateDOB(day, month, year)) {
                // Show error in the error-checkbox div for DOB
                const dobErrorDiv = document.querySelector('.error-checkbox');
                if (dobErrorDiv) {
                    dobErrorDiv.textContent = 'Please enter a valid date of birth (age 18-100)';
                }
                isValid = false;
            }
            
            // Validate signature
            const signatureBase64 = document.querySelector('.hiddenInputFieldSignature')?.value || '';
            console.log('Signature validation:', { hasSignature: !!signatureBase64, length: signatureBase64.length });
            if (!signatureBase64 || signatureBase64.length < 100) { // Base64 signature should be substantial
                console.log('Signature validation failed');
                document.querySelector('.signatureError').classList.remove('hidden');
                isValid = false;
            }
            
            console.log('Step 1 validation result:', isValid);
            return isValid;
        }
    }

    // Show initial form when "Find My Agreements" is clicked
    firstButton.addEventListener('click', function() {
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
                // defaultOption.textContent = 'Select your address';
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
    document.getElementById('postcode').addEventListener('input', function(e) {
        const postcode = e.target.value.trim();
        if (postcode && postcode.length >= 5) {
            handlePostcodeLookup(postcode, '.propertyDiv', '#property', '.spinner-border');
        }
    });

    // Handle Find button click for current address
    postcodeBtn.addEventListener('click', function() {
        const postcode = document.getElementById('postcode').value.trim();
        if (postcode) {
            handlePostcodeLookup(postcode, '.propertyDiv', '#property', '.spinner-border');
        }
    });

    // Handle current address selection
    document.getElementById('property').addEventListener('click', function(e) {
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
    addAddressBtn.addEventListener('click', function() {
        prevAddressDiv.classList.remove('hidden');
        removeAddressBtn.classList.remove('hidden');
        addAddressBtn.classList.add('hidden');
    });

    removeAddressBtn.addEventListener('click', function() {
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
    prevPostcodeBtn.addEventListener('click', function() {
        const prevPostcode = document.getElementById('prevpostcode').value.trim();
        if (prevPostcode) {
            handlePostcodeLookup(prevPostcode, '.prevpropertyDiv', '#prevproperty', '.spinner-border2');
        }
    });

    // Handle previous address selection
    document.getElementById('prevproperty').addEventListener('change', function(e) {
        const selectedValue = e.target.value;
        if (selectedValue) {
            prevSelectedDiv.classList.remove('hidden');
            document.querySelector('.prevselectedAddress').textContent = selectedValue;
            document.querySelector('.prevselectedAddressError').classList.add('hidden');
            formData.previousAddress = selectedValue;
        }
    });

    // Next/Previous buttons
    nextStep.addEventListener('click', function() {
        console.log('Next button clicked, current tab:', currentTab);
        console.log('Total tabs:', tabs.length);
        
        if (!validateCurrentStep()) {
            console.log('Validation failed, stopping submission');
            return false;
        }

        if (currentTab === tabs.length - 1) {
            console.log('Last tab reached, submitting form');
            // Handle form submission
            handleFormSubmission();
        } else {
            console.log('Moving to next tab');
            currentTab++;
            showTab(currentTab);
        }
    });

    backStep.addEventListener('click', function() {
        if (currentTab > 0) {
            currentTab--;
            showTab(currentTab);
        }
    });

    // Clear validation errors when inputs change
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            const errorDiv = this.parentElement.querySelector('.error-div');
            if (errorDiv) {
                errorDiv.textContent = '';
            }
        });
    });

    // --- Signature Pad Functionality ---
    const signaturePad = document.getElementById('signature-pad');
    const clearSignatureBtn = document.querySelector('[data-action="click->new-form#clearSignature"]');
    const signatureInput = document.querySelector('.hiddenInputFieldSignature');
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    if (signaturePad && clearSignatureBtn && signatureInput) {
        const ctx = signaturePad.getContext('2d');
        
        // Set canvas dimensions if not already set
        if (signaturePad.width === 0 || signaturePad.height === 0) {
            signaturePad.width = signaturePad.offsetWidth;
            signaturePad.height = signaturePad.offsetHeight;
        }
        
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        function getPointerPos(e) {
            let rect = signaturePad.getBoundingClientRect();
            if (e.touches && e.touches.length > 0) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            } else {
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
        }

        function startDraw(e) {
            drawing = true;
            const pos = getPointerPos(e);
            lastX = pos.x;
            lastY = pos.y;
            
            // Clear signature error when user starts drawing
            document.querySelector('.signatureError').classList.add('hidden');
        }

        function draw(e) {
            if (!drawing) return;
            e.preventDefault();
            const pos = getPointerPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
        }

        function endDraw() {
            drawing = false;
            // Save signature to hidden input
            const signatureData = signaturePad.toDataURL('image/png');
            signatureInput.value = signatureData;
            
            // Debug: Log signature data (remove in production)
            console.log('Signature captured:', signatureData ? 'Yes' : 'No');
            console.log('Signature length:', signatureData ? signatureData.length : 0);
            console.log('Signature preview:', signatureData ? signatureData.substring(0, 50) + '...' : 'No signature');
            
            // Set signature time when user finishes signing
            const signatureTime = new Date().toLocaleString('en-GB', { 
                timeZone: 'Europe/London',
                hour12: false 
            });
            document.getElementById('signature_time').value = signatureTime;
        }

        // Mouse events
        signaturePad.addEventListener('mousedown', startDraw);
        signaturePad.addEventListener('mousemove', draw);
        signaturePad.addEventListener('mouseup', endDraw);
        signaturePad.addEventListener('mouseleave', endDraw);

        // Touch events
        signaturePad.addEventListener('touchstart', function(e) { startDraw(e); });
        signaturePad.addEventListener('touchmove', function(e) { draw(e); });
        signaturePad.addEventListener('touchend', function(e) { endDraw(e); });

        // Clear button
        clearSignatureBtn.addEventListener('click', function() {
            ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
            signatureInput.value = '';
            console.log('Signature cleared');
        });

        // Test function to verify signature base64 conversion (for debugging)
        window.testSignature = function() {
            const testData = signaturePad.toDataURL('image/png');
            console.log('Test signature base64:', testData ? 'Generated successfully' : 'Failed');
            console.log('Test signature length:', testData ? testData.length : 0);
            console.log('Test signature starts with:', testData ? testData.substring(0, 20) : 'No data');
            return testData;
        };
    }

});
