// JavaScript for the landing page
document.addEventListener('DOMContentLoaded', function() {
    // Track page view (only on first render)
    if (!window.pageViewTracked) {
        window.pageViewTracked = true;
        if (typeof gtag !== 'undefined') {
            gtag('event', '3999_end_page_view_var1', {
                variant_name: 'ghk_3999_1'
            });
        }
        if (typeof ym !== 'undefined') {
            ym(96171108, 'reachGoal', '3999_end_page_view_var1');
        }
    }
    
    // Initialize credit limit input
    initializeCreditLimit();
});

// Format number with spaces
function formatCreditLimit(value) {
    // Remove all non-digit characters
    const numbers = value.toString().replace(/\D/g, '');
    if (!numbers) return '';
    
    // Format with spaces every 3 digits
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Initialize credit limit input
function initializeCreditLimit() {
    const creditLimitInput = document.getElementById('creditLimit');
    if (!creditLimitInput) return;
    
    // Remove readonly attribute if present
    creditLimitInput.removeAttribute('readonly');
    
    // Handle input
    creditLimitInput.addEventListener('input', function(e) {
        const input = e.target;
        const cursorPos = input.selectionStart;
        const oldValue = input.value;
        const oldNumbers = oldValue.replace(/\D/g, '');
        
        // Get new value without formatting
        const newValue = input.value;
        const numbers = newValue.replace(/\D/g, '');
        
        if (!numbers) {
            input.value = '';
            return;
        }
        
        // Limit to 6 digits (max 999 999)
        const limitedNumbers = numbers.slice(0, 6);
        const formatted = formatCreditLimit(limitedNumbers);
        
        // Calculate new cursor position
        // Count how many digits were before cursor in old value
        let digitsBeforeCursor = 0;
        for (let i = 0; i < Math.min(cursorPos, oldValue.length); i++) {
            if (/\d/.test(oldValue[i])) {
                digitsBeforeCursor++;
            }
        }
        
        // Count how many digits are in new value
        const newDigitsCount = limitedNumbers.length;
        
        // Adjust cursor position based on digit count change
        let newCursorPos = 0;
        let digitCount = 0;
        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                digitCount++;
                if (digitCount <= digitsBeforeCursor) {
                    newCursorPos = i + 1;
                }
            } else {
                if (digitCount <= digitsBeforeCursor) {
                    newCursorPos = i + 1;
                }
            }
        }
        
        // Set formatted value
        input.value = formatted + ' ₽';
        
        // Set cursor position (but not at the end if user is typing)
        if (newDigitsCount > oldNumbers.length) {
            // User added a digit, place cursor after the new digit
            newCursorPos = Math.min(newCursorPos, formatted.length);
        } else {
            // User deleted or edited, keep relative position
            newCursorPos = Math.min(newCursorPos, formatted.length);
        }
        
        setTimeout(function() {
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    });
    
    // Handle focus
    creditLimitInput.addEventListener('focus', function(e) {
        const value = e.target.value.replace(/\D/g, '');
        if (value) {
            const formatted = formatCreditLimit(value);
            e.target.value = formatted;
            // Place cursor at the end of numbers (before ₽)
            e.target.setSelectionRange(formatted.length, formatted.length);
        }
    });
    
    // Handle blur - add ₽ if not present
    creditLimitInput.addEventListener('blur', function(e) {
        const value = e.target.value.trim();
        const numbers = value.replace(/\D/g, '');
        
        if (numbers) {
            const numValue = parseInt(numbers, 10);
            // Validate range
            if (numValue < 10000) {
                e.target.value = '10 000 ₽';
            } else if (numValue > 120000) {
                e.target.value = '120 000 ₽';
            } else {
                const formatted = formatCreditLimit(numbers);
                e.target.value = formatted + ' ₽';
            }
        } else {
            e.target.value = '10 000 ₽';
        }
    });
    
    // Handle keydown - prevent non-numeric input
    creditLimitInput.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

// Get all detail checkboxes
function getAllDetailCheckboxes() {
    return [
        document.getElementById('personalDataCheckbox'),
        document.getElementById('creditAssignmentCheckbox'),
        document.getElementById('marketingCheckbox'),
        document.getElementById('financialProtectionCheckbox')
    ].filter(function(cb) { return cb !== null; });
}

// Update all detail checkboxes based on main checkbox
function updateDetailCheckboxes(checked) {
    const detailCheckboxes = getAllDetailCheckboxes();
    detailCheckboxes.forEach(function(checkbox) {
        if (checkbox) {
            checkbox.checked = checked;
        }
    });
}

// Check if all detail checkboxes are checked
function areAllDetailCheckboxesChecked() {
    const detailCheckboxes = getAllDetailCheckboxes();
    return detailCheckboxes.length > 0 && detailCheckboxes.every(function(cb) {
        return cb.checked;
    });
}

// Initialize step 2 validation
function initializeStep2() {
    // Email input validation
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateForm();
        });
    }
    
    // Main agreement checkbox - master switch for all checkboxes
    const agreementCheckbox = document.getElementById('agreementCheckbox');
    if (agreementCheckbox) {
        agreementCheckbox.addEventListener('change', function() {
            // When main checkbox changes, update all detail checkboxes
            updateDetailCheckboxes(this.checked);
            validateForm();
        });
    }
    
    // Detail checkboxes - if any is unchecked, uncheck main checkbox
    const detailCheckboxes = getAllDetailCheckboxes();
    detailCheckboxes.forEach(function(checkbox) {
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const mainCheckbox = document.getElementById('agreementCheckbox');
                if (mainCheckbox) {
                    // If this checkbox is unchecked, uncheck main checkbox
                    if (!this.checked) {
                        mainCheckbox.checked = false;
                    } else {
                        // If all detail checkboxes are checked, check main checkbox
                        if (areAllDetailCheckboxesChecked()) {
                            mainCheckbox.checked = true;
                        }
                    }
                }
                validateForm();
            });
        }
    });
    
    // Initial validation
    validateForm();
}

// Go to step 2
function goToStep2() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    console.log('goToStep2 called', { step1, step2 });
    
    if (step1 && step2) {
        step1.classList.remove('active');
        step2.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Initialize step 2 validation
        setTimeout(function() {
            initializeStep2();
        }, 100);
        
        // Track step 2 view
        if (typeof gtag !== 'undefined') {
            gtag('event', '3999_step2_view_var1', {
                variant_name: 'ghk_3999_1'
            });
        }
        if (typeof ym !== 'undefined') {
            ym(96171108, 'reachGoal', '3999_step2_view_var1');
        }
    } else {
        console.error('Step elements not found', { step1, step2 });
    }
}

// Make function globally available
window.goToStep2 = goToStep2;
window.toggleDetails = toggleDetails;
window.submitForm = submitForm;

// Toggle details
function toggleDetails() {
    const detailsContent = document.getElementById('detailsContent');
    const detailsHeader = document.querySelector('.details-header');
    
    if (detailsContent && detailsHeader) {
        const isVisible = detailsContent.style.display !== 'none';
        detailsContent.style.display = isVisible ? 'none' : 'block';
        detailsHeader.classList.toggle('active', !isVisible);
    }
}

// Validate form
function validateForm() {
    const agreementCheckbox = document.getElementById('agreementCheckbox');
    const emailInput = document.getElementById('emailInput');
    const submitButton = document.getElementById('submitButton');
    
    if (agreementCheckbox && emailInput && submitButton) {
        const email = emailInput.value.trim();
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const agreementChecked = agreementCheckbox.checked;
        
        if (emailValid && agreementChecked) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
}

// Submit form
function submitForm() {
    const agreementCheckbox = document.getElementById('agreementCheckbox');
    const emailInput = document.getElementById('emailInput');
    
    if (!agreementCheckbox || !agreementCheckbox.checked) {
        alert('Пожалуйста, подтвердите согласие с условиями');
        return;
    }
    
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Пожалуйста, введите корректный email');
        return;
    }
    
    // Track form submission
    if (typeof gtag !== 'undefined') {
        gtag('event', '3999_form_submit_var1', {
            variant_name: 'ghk_3999_1',
            email: email
        });
    }
    if (typeof ym !== 'undefined') {
        ym(96171108, 'reachGoal', '3999_form_submit_var1');
    }
    
    // Redirect to Alfabank deep link
    window.location.href = 'alfabank://sdui_screen?screenName=InvestmentLongread&fromCurrent=true&shouldUseBottomSafeArea=true&endpoint=v1/invest-main-screen-view/investment-longread/93232%3flocation=AM%26campaignCode=GH';
}
