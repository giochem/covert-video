document.addEventListener("DOMContentLoaded", () => {
  const videoPlayer = document.getElementById("videoPlayer");
  const segmentsList = document.getElementById("segmentsList");
  const videoTitle = document.getElementById("videoTitle");
  const currentSegment = document
    .getElementById("currentSegment")
    .querySelector("span");
  const deviceSelect = document.getElementById("deviceSelect");
  const qualitySelect = document.getElementById("qualitySelect");
  let hls;

  if (Hls.isSupported()) {
    hls = new Hls();
  }

  function loadVideo(videoId, device, quality) {
    videoId = videoId.split(".")[0];
    const playlistUrl = `/segments/${videoId}/${device}/${quality}/playlist.m3u8`;
    videoTitle.textContent = videoId;

    if (Hls.isSupported()) {
      hls.loadSource(playlistUrl);
      hls.attachMedia(videoPlayer);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const segments = data.levels[0].details.fragments;
        createSegmentsList(segments);
      });
    }
  }

  function createSegmentsList(segments) {
    segmentsList.innerHTML = "";
    segments.forEach((segment, index) => {
      const segmentItem = document.createElement("div");
      segmentItem.className = "segment-item";
      segmentItem.dataset.startTime = segment.start;
      segmentItem.dataset.endTime = segment.start + segment.duration;
      segmentItem.innerHTML = `
        <div class="segment-number">Segment ${index + 1}</div>
        <div class="segment-time">${formatTime(segment.start)} - ${formatTime(
        segment.start + segment.duration
      )}</div>
      `;

      segmentItem.addEventListener("click", () => {
        videoPlayer.currentTime = segment.start;
        highlightSegment(segmentItem);
      });

      segmentsList.appendChild(segmentItem);
    });
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function highlightSegment(selectedSegment) {
    document.querySelectorAll(".segment-item").forEach((item) => {
      item.classList.remove("active");
    });
    selectedSegment.classList.add("active");
  }

  // Get video ID from URL or load first video
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("video");
  if (videoId) {
    loadVideo(videoId, deviceSelect.value, qualitySelect.value);
  }

  // Update video when device or quality changes
  deviceSelect.addEventListener("change", () => {
    if (videoId) {
      loadVideo(videoId, deviceSelect.value, qualitySelect.value);
    }
  });

  qualitySelect.addEventListener("change", () => {
    if (videoId) {
      loadVideo(videoId, deviceSelect.value, qualitySelect.value);
    }
  });

  // Update current segment based on video time
  videoPlayer.addEventListener("timeupdate", () => {
    const currentTime = videoPlayer.currentTime;
  });
});
