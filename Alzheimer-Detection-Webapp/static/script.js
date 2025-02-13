function uploadImage() {
    let fileInput = document.getElementById("imageUpload");
    let file = fileInput.files[0];
    
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    // Generate a temporary URL for the image
    let imgURL = URL.createObjectURL(file);
    
    let imgbox = document.getElementById('imgbox');
    imgbox.innerHTML = `<img src="${imgURL}" style="max-width: 100%; height: auto;" />;`

    // Prepare FormData
    let formData = new FormData();
    formData.append("file", file);

    // Send the image to the server
    fetch("/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("result").innerText = "Prediction: " + data.prediction;
    })
    .catch(error => console.error("Error:", error));
}