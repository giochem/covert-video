const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { segmentVideo } = require("./src/segment");

const app = express();
const port = 3000;

// Static file serving
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));
app.use("/segments", express.static(path.join(__dirname, "src", "segments")));

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "src", "uploads");
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    cb(null, originalName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/mkv", "video/x-matroska"];
    if (
      allowedTypes.includes(file.mimetype) ||
      file.originalname.endsWith(".mkv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4 and MKV files are allowed"));
    }
  },
});

// Upload endpoint
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { file } = req;
    const segmentDir = path.join(
      __dirname,
      "src",
      "segments",
      path.parse(file.filename).name
    );

    console.log(`Received file: ${file.filename}`);
    console.log(`Segment directory: ${segmentDir}`);

    // First save the original file
    const uploadPath = path.join(__dirname, "src", "uploads", file.filename);

    // Then segment the video
    await segmentVideo(uploadPath, segmentDir);

    res.json({
      success: true,
      message: "Video uploaded and segmented successfully",
      filename: file.filename,
      segments: `/segments/${path.parse(file.filename).name}/playlist.m3u8`,
    });
  } catch (error) {
    console.error("Error during upload and segmentation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Add this endpoint to get list of videos
app.get("/api/videos", (req, res) => {
  const uploadsDir = path.join(__dirname, "src", "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan directory" });
    }

    const videos = files.map((filename) => ({
      filename,
      url: `/uploads/${encodeURIComponent(filename)}`,
    }));

    res.json(videos);
  });
});
