document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('videoFile');
    const dropZone = document.querySelector('.drop-zone');
    const fileInfo = document.querySelector('.file-info');
    const progressWrapper = document.getElementById('uploadProgress');
    const progress = progressWrapper.querySelector('.progress');
    const progressText = progressWrapper.querySelector('.progress-text');
    const uploadButton = document.getElementById('uploadBtn');

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-active');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-active');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        fileInput.files = files;
        updateFileInfo(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        updateFileInfo(e.target.files[0]);
    });

    function updateFileInfo(file) {
        if (file) {
            fileInfo.textContent = `Selected: ${file.name}`;
            fileInfo.style.display = 'block';
        }
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files[0]) {
            alert('Please select a video file');
            return;
        }

        const formData = new FormData(uploadForm);
        uploadButton.disabled = true;
        progressWrapper.style.display = 'block';

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progress.style.width = percentComplete + '%';
                progressText.textContent = `${Math.round(percentComplete)}%`;
                
                if (percentComplete === 100) {
                    progressText.textContent = 'Processing video...';
                }
            }
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.response);
                progressText.textContent = 'Upload complete!';
                setTimeout(() => {
                    window.location.href = '/videos.html';
                }, 1000);
            } else {
                alert('Upload failed');
                resetUpload();
            }
        };

        xhr.onerror = function() {
            alert('Upload failed');
            resetUpload();
        };

        xhr.open('POST', '/upload', true);
        xhr.send(formData);
    });

    function resetUpload() {
        uploadForm.reset();
        uploadButton.disabled = false;
        progressWrapper.style.display = 'none';
        progress.style.width = '0%';
        progressText.textContent = '0%';
        fileInfo.style.display = 'none';
    }
});