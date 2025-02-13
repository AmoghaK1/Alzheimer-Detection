function uploadImage() {
    let fileInput = document.getElementById("imageUpload");
    let file = fileInput.files[0];
    
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

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
