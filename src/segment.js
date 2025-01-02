const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");
const path = require("path");

const DEVICE_CONFIGS = {
  desktop: {
    segmentDuration: 120,
    videoBitrateScale: 1,
    bufferScale: 2,
    size: { width: 1920, height: 1080 },
    supportedQualities: ["720p", "360p"],
  },
  mobile: {
    segmentDuration: 60,
    videoBitrateScale: 0.7,
    bufferScale: 1.5,
    size: { width: 1280, height: 720 },
    supportedQualities: ["720p", "360p"],
  },
};

const FORMAT_CONFIGS = {
  "720p": {
    baseBitrate: "2800k",
    baseBuffer: "5600k",
  },
  "360p": {
    baseBitrate: "800k",
    baseBuffer: "1600k",
  },
};

async function segmentVideo(inputPath, outputDir) {
  await fs.ensureDir(outputDir);
  console.log(`Ensured output directory: ${outputDir}`);

  for (const [device, deviceConfig] of Object.entries(DEVICE_CONFIGS)) {
    const deviceOutputDir = path.join(outputDir, device);
    await fs.ensureDir(deviceOutputDir);
    console.log(`Ensured device output directory: ${deviceOutputDir}`);

    let masterPlaylist = "#EXTM3U\n#EXT-X-VERSION:3\n";

    for (const quality of deviceConfig.supportedQualities) {
      const formatOutputDir = path.join(deviceOutputDir, quality);
      await fs.ensureDir(formatOutputDir);
      console.log(`Ensured format output directory: ${formatOutputDir}`);

      const formatConfig = FORMAT_CONFIGS[quality];
      const resolution = deviceConfig.size;
      const bitrate =
        parseInt(formatConfig.baseBitrate) * deviceConfig.videoBitrateScale;
      const bufferSize =
        parseInt(formatConfig.baseBuffer) * deviceConfig.bufferScale;

      const options = [
        `-vf scale=${resolution.width}:${resolution.height}`,
        `-b:v ${bitrate}k`,
        `-maxrate ${bitrate}k`,
        `-bufsize ${bufferSize}k`,
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        `-hls_time ${deviceConfig.segmentDuration}`,
        "-hls_list_size 0",
        "-f hls",
      ];
      const bandwidth = Math.floor(bitrate * 1000);

      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution.width}x${resolution.height}\n`;
      masterPlaylist += `${quality}/playlist.m3u8\n`;

      console.log(`Starting ffmpeg process for ${formatOutputDir}`);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions(options)
          .output(path.join(formatOutputDir, "playlist.m3u8"))
          .on("end", () => {
            console.log(`Finished processing ${formatOutputDir}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(
              `Error processing ${formatOutputDir}: ${err.message}`
            );
            reject(err);
          })
          .run();
      });
    }

    await fs.writeFile(
      path.join(deviceOutputDir, "master.m3u8"),
      masterPlaylist
    );
    console.log(`Master playlist written for ${deviceOutputDir}`);
  }

  console.log("All master playlists written");
}

module.exports = {
  segmentVideo,
};
