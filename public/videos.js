document.addEventListener("DOMContentLoaded", () => {
  const videoList = document.getElementById("videoList");

  async function loadVideos() {
    try {
      const response = await fetch("/api/videos");
      const videos = await response.json();

      videos.forEach((video) => {
        const videoCard = createVideoCard(video);
        videoList.appendChild(videoCard);
      });
    } catch (error) {
      console.error("Error loading videos:", error);
    }
  }

  function createVideoCard(video) {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <video class="video-preview">
        <source src="/uploads/${video.filename}" type="video/mp4">
      </video>
      <div class="video-info">
        <h3>${video.filename}</h3>
        <div class="video-actions">
          <button class="play-btn">Play</button>
          <button class="segment-btn" onclick="window.location.href='/segment.html?video=${encodeURIComponent(video.filename)}'">
            View Segments
          </button>
        </div>
      </div>
    `;

    return card;
  }

  loadVideos();
});
