// DOM Elements
const startAdBtn = document.getElementById('startAdBtn');
const closeModal = document.getElementById('closeModal');
const adModal = document.getElementById('adModal');
const launchAdBtn = document.getElementById('launchAdBtn');
const budgetSlider = document.getElementById('budgetSlider');
const budgetValue = document.getElementById('budgetValue');
const imageUpload = document.getElementById('imageUpload');
const dropZone = document.getElementById('dropZone');
const adPreview = document.getElementById('adPreview');

// Current step tracking
let currentStep = 1;
const totalSteps = 4;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize budget slider
    updateBudgetValue();
});

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Modal controls
    startAdBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    
    // Budget slider
    budgetSlider.addEventListener('input', updateBudgetValue);
    
    // Step navigation
    document.querySelectorAll('.next-step-button').forEach(button => {
        button.addEventListener('click', goToNextStep);
    });
    
    document.querySelectorAll('.back-step-button').forEach(button => {
        button.addEventListener('click', goToPrevStep);
    });
    
    // Ad type selection
    document.querySelectorAll('.ad-type-card').forEach(card => {
        card.addEventListener('click', selectAdType);
    });
    
    // Image upload handling
    imageUpload.addEventListener('change', handleImageUpload);
    dropZone.addEventListener('click', () => imageUpload.click());
    
    // Drag and drop for images
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlightDropZone, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlightDropZone, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Launch ad button
    launchAdBtn.addEventListener('click', launchAdCampaign);
}

// ===== Modal Controls =====
function openModal() {
    adModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
    adModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    // Reset to step 1
    goToStep(1);
    
    // Deselect all ad types
    document.querySelectorAll('.ad-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear image preview
    adPreview.innerHTML = '';
    dropZone.querySelector('p').textContent = 'Drag & drop your image here';
    
    // Reset budget slider
    budgetSlider.value = 20;
    updateBudgetValue();
}

// ===== Step Navigation =====
function goToNextStep(e) {
    e.preventDefault();
    if (currentStep < totalSteps) {
        currentStep++;
        updateActiveStep();
    }
}

function goToPrevStep(e) {
    e.preventDefault();
    if (currentStep > 1) {
        currentStep--;
        updateActiveStep();
    }
}

function goToStep(step) {
    currentStep = step;
    updateActiveStep();
}

function updateActiveStep() {
    // Update progress steps
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Show/hide step content
    document.querySelectorAll('.modal-step').forEach(step => {
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// ===== Ad Type Selection =====
function selectAdType(e) {
    // Remove selection from all cards
    document.querySelectorAll('.ad-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add to clicked card
    this.classList.add('selected');
}

// ===== Budget Slider =====
function updateBudgetValue() {
    const value = budgetSlider.value;
    budgetValue.textContent = `$${value}`;
    
    // Update estimated reach (simple calculation)
    const estimatedReach = value * 120; // $1 = 120 impressions
    document.querySelector('.budget-estimate strong').textContent = 
        `~${estimatedReach.toLocaleString()} students/day`;
}

// ===== Image Upload Handling =====
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlightDropZone() {
    dropZone.classList.add('highlight');
}

function unhighlightDropZone() {
    dropZone.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length) {
        handleFiles(files);
    }
}

function handleImageUpload(e) {
    if (e.target.files.length) {
        handleFiles(e.target.files);
    }
}

function handleFiles(files) {
    const file = files[0];
    
    if (!file.type.match('image.*')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Update drop zone text
        dropZone.querySelector('p').textContent = file.name;
        
        // Create preview
        adPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        adPreview.appendChild(img);
    };
    
    reader.readAsDataURL(file);
}

// ===== Form Submission =====
function launchAdCampaign(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Show loading state
    launchAdBtn.disabled = true;
    launchAdBtn.textContent = 'Processing...';
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showToast('🎉 Ad campaign launched successfully!');
        
        // Close modal after delay
        setTimeout(() => {
            closeModalHandler();
            launchAdBtn.disabled = false;
            launchAdBtn.textContent = 'Launch Ad Campaign';
        }, 1500);
    }, 2000);
}

function validateForm() {
    // Check if ad type is selected
    const selectedAdType = document.querySelector('.ad-type-card.selected');
    if (!selectedAdType) {
        showToast('Please select an ad type', 'error');
        goToStep(1);
        return false;
    }
    
    // Check if image is uploaded (for visual ad types)
    const adType = selectedAdType.dataset.type;
    if (adType !== 'sponsored' && !adPreview.querySelector('img')) {
        showToast('Please upload an image for your ad', 'error');
        goToStep(2);
        return false;
    }
    
    return true;
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ===== Responsive Menu =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mainNav = document.querySelector('.main-nav');

mobileMenuBtn.addEventListener('click', () => {
    mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
});