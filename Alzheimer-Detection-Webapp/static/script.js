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

function downloadPatientPDF(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Create new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set initial position
    let yPos = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Patient Medical Report', 105, yPos, { align: 'center' });
    
    // Add content with regular font size
    doc.setFontSize(12);
    
    // Personal Information
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('Personal Information', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;
    doc.text(`Name: ${patient.name}`, 20, yPos);
    yPos += 10;
    doc.text(`Age: ${patient.age}`, 20, yPos);
    yPos += 10;
    doc.text(`Date Added: ${patient.date}`, 20, yPos);
    
    // Medical History
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('Medical History', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;
    
    // Handle long text wrapping for medical history
    const splitHistory = doc.splitTextToSize(patient.history, 170);
    doc.text(splitHistory, 20, yPos);
    yPos += splitHistory.length * 7;
    
    // Analysis Result
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('Analysis Result', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 10;
    doc.text(patient.prediction, 20, yPos);
    
    // Add MRI Image
    if (patient.mriScan && patient.mriScan !== 'default-image.jpg') {
        yPos += 20;
        
        // Create temporary image to get dimensions
        const img = new Image();
        img.src = patient.mriScan;
        
        // Handle the image loading asynchronously
        img.onload = function() {
            // Define maximum dimensions for the PDF
            const maxWidth = 170;
            const maxHeight = 100;
            
            // Calculate aspect ratio
            const aspectRatio = img.width / img.height;
            
            // Calculate dimensions to maintain aspect ratio
            let imgWidth = maxWidth;
            let imgHeight = imgWidth / aspectRatio;
            
            // If calculated height exceeds maxHeight, scale based on height
            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight * aspectRatio;
            }
            
            // Add image with calculated dimensions
            doc.addImage(patient.mriScan, 'JPEG', 20, yPos, imgWidth, imgHeight);
            
            // Generate PDF
            doc.save(`patient_report_${patient.name.replace(/\s+/g, '_')}.pdf`);
        };
        
        // In case the image fails to load, still generate the PDF
        img.onerror = function() {
            doc.text('MRI image could not be loaded', 20, yPos);
            doc.save(`patient_report_${patient.name.replace(/\s+/g, '_')}.pdf`);
        };
        
        // Return early - the PDF will be generated in the onload callback
        return;
    }
    
    // If there's no image, generate PDF immediately
    doc.save(`patient_report_${patient.name.replace(/\s+/g, '_')}.pdf`);
}
// Modify the viewPatientDetails function to include the download button
function viewPatientDetails(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        const detailsHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold">Patient Details</h2>
                        <div class="flex space-x-2">
                            <button onclick="downloadPatientPDF(${patient.id})" class="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download PDF</span>
                            </button>
                            <button onclick="closePatientDetails()" class="text-gray-500 hover:text-gray-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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