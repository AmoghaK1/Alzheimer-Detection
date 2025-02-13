// Patient Management
let patients = [];

// Navigation Functions
function showAddPatient() {
    document.getElementById('patient-form').classList.remove('hidden');
    document.getElementById('patient-history').classList.add('hidden');
}

function showPatientHistory() {
    document.getElementById('patient-history').classList.remove('hidden');
    document.getElementById('patient-form').classList.add('hidden');
    renderPatientList();
}

// Form Handling
function handlePatientSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const patient = {
        id: Date.now(),
        name: formData.get('name'),
        age: formData.get('age'),
        history: formData.get('history'),
        mriScan: document.getElementById('preview-image').src,
        date: new Date().toLocaleDateString(),
        prediction: document.querySelector('#prediction-result').textContent
    };
    patients.push(patient);
    event.target.reset();
    removeImage();
    alert('Patient added successfully!');
}

// Patient List Rendering
function renderPatientList() {
    const patientList = document.getElementById('patient-list');
    patientList.innerHTML = patients.map(patient => `
        <div class="patient-card bg-white p-6 rounded-xl shadow-md">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold">${patient.name}</h3>
                    <p class="text-gray-600">Age: ${patient.age}</p>
                    <p class="text-gray-600">Date: ${patient.date}</p>
                </div>
                <button onclick="viewPatientDetails(${patient.id})" class="text-blue-600 hover:text-blue-800">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Patient Details
function viewPatientDetails(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        const detailsHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold">Patient Details</h2>
                        <button onclick="closePatientDetails()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold">Personal Information</h3>
                            <p>Name: ${patient.name}</p>
                            <p>Age: ${patient.age}</p>
                            <p>Date Added: ${patient.date}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold">Medical History</h3>
                            <p>${patient.history}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold">MRI Scan</h3>
                            <img src="${patient.mriScan}" alt="MRI Scan" class="w-full max-h-64 object-contain rounded-lg">
                        </div>
                        <div>
                            <h3 class="font-semibold">Analysis Result</h3>
                            <p>${patient.prediction}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const detailsElement = document.createElement('div');
        detailsElement.id = 'patient-details-modal';
        detailsElement.innerHTML = detailsHtml;
        document.body.appendChild(detailsElement);
    }
}

function closePatientDetails() {
    const modal = document.getElementById('patient-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Image Handling
document.getElementById('file-upload').addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showImagePreview(e.target.result);
        }
        reader.readAsDataURL(file);
    }
}

function showImagePreview(imageUrl) {
    document.getElementById('upload-area').classList.add('hidden');
    const previewArea = document.getElementById('image-preview-area');
    previewArea.classList.remove('hidden');
    document.getElementById('preview-image').src = imageUrl;
}

function removeImage() {
    document.getElementById('file-upload').value = '';
    document.getElementById('image-preview-area').classList.add('hidden');
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('prediction-result').classList.add('hidden');
}

// MRI Analysis
function analyzeMRI() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image first');
        return;
    }

    const predictionResult = document.getElementById('prediction-result');
    predictionResult.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
            <div class="loading-spinner w-6 h-6 border-4 border-blue-200 rounded-full"></div>
            <span class="text-gray-600">Analyzing MRI scan...</span>
        </div>
    `;
    predictionResult.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', file);

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const resultClass = getPredictionClass(data.prediction);
        predictionResult.innerHTML = `
            <div class="flex items-center justify-between ${resultClass.bg} p-4 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="${resultClass.icon} p-2 rounded-full">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-semibold ${resultClass.text}">Analysis Result</h3>
                        <p class="text-sm ${resultClass.text}">${data.prediction}</p>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(error => {
        predictionResult.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0 text-red-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-semibold text-red-800">Error</h3>
                        <p class="text-sm text-red-700">Failed to analyze image. Please try again.</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Prediction Styling
function getPredictionClass(prediction) {
    const classes = {
        'Non Demented': {
            bg: 'bg-green-50',
            text: 'text-green-800',
            icon: 'bg-green-100 text-green-500'
        },
        'Very Mild Demented': {
            bg: 'bg-yellow-50',
            text: 'text-yellow-800',
            icon: 'bg-yellow-100 text-yellow-500'
        },
        'Mild Demented': {
            bg: 'bg-orange-50',
            text: 'text-orange-800',
            icon: 'bg-orange-100 text-orange-500'
        },
        'Moderate Demented': {
            bg: 'bg-red-50',
            text: 'text-red-800',
            icon: 'bg-red-100 text-red-500'
        }
    };
    return classes[prediction] || classes['Non Demented'];
}

// Drag and Drop Handling
const dropZone = document.querySelector('label[for="file-upload"]');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    document.getElementById('file-upload').files = files;
    
    if (files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showImagePreview(e.target.result);
        }
        reader.readAsDataURL(files[0]);
    }
}