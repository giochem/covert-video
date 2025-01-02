document.addEventListener('DOMContentLoaded', () => {
    const videoList = document.getElementById('videoList');

    // Function to fetch and display videos
    async function loadVideos() {
        try {
            const response = await fetch('/api/videos');
            const videos = await response.json();
            
            videos.forEach(video => {
                const videoCard = createVideoCard(video);
                videoList.appendChild(videoCard);
            });
        } catch (error) {
            console.error('Error loading videos:', error);
        }
    }

    // Create video card element
    function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        card.innerHTML = `
            <video class="video-player" controls>
                <source src="/uploads/${encodeURIComponent(video.filename)}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="video-info">
                <h3 class="video-title">${video.filename}</h3>
            </div>
        `;
        
        return card;
    }

    loadVideos();
});
