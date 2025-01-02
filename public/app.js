document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('videoFile');
    const progressBar = document.getElementById('uploadProgress');
    const progress = progressBar.querySelector('.progress');
    const progressText = progressBar.querySelector('.progress-text');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const fileDummy = document.querySelector('.file-dummy');

    fileInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        if (fileName) {
            fileDummy.querySelector('.default').style.display = 'none';
            fileDummy.querySelector('.selected').style.display = 'block';
            fileDummy.querySelector('.selected').textContent = `Selected: ${fileName}`;
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        
        if (!fileInput.files[0]) {
            alert('Please select a video file');
            return;
        }

        progressBar.style.display = 'block';
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progress.style.width = percentComplete + '%';
                progressText.textContent = Math.round(percentComplete) + '%';
            }
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.response);
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <span>${response.filename}</span>
                    <small>Upload complete</small>
                `;
                uploadedFiles.appendChild(fileItem);
            } else {
                alert('Upload failed');
            }
            resetUploadForm();
        };

        xhr.onerror = function() {
            alert('Upload failed');
            resetUploadForm();
        };

        xhr.open('POST', '/upload', true);
        xhr.send(formData);
    });

    function resetUploadForm() {
        uploadForm.reset();
        progressBar.style.display = 'none';
        progress.style.width = '0%';
        progressText.textContent = '0%';
        fileDummy.querySelector('.default').style.display = 'block';
        fileDummy.querySelector('.selected').style.display = 'none';
    }
});
