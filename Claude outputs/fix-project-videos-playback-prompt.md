The 6 new client project videos aren't playing/scrubbing properly on the project pages -- they appear stuck on a single frame instead of playing or scrubbing with scroll. Diagnose and fix this.

Background: These videos were just added at `public/images/projects/<slug>/video.mp4` for these projects:
- the-neo-colonial-home
- the-modern-classical-home (this one was originally a .mov file, renamed to .mp4 WITHOUT re-encoding -- likely the most at-risk for playback issues)
- the-modern-eclectic-home
- the-modern-transitional-home
- the-shraddhas-thinkpad
- the-modern-organic-home (replaced an older, much smaller video.mp4, which is backed up as video-old-backup.mp4 in the same folder)

They're rendered by `src/components/projects/ProjectVideo.jsx`, which on desktop pins the section and scrubs `videoEl.currentTime` based on scroll progress via GSAP ScrollTrigger (`onUpdate: videoEl.currentTime = self.progress * videoEl.duration`). On mobile/reduced-motion it falls back to a plain autoplay/loop/muted `<video>`.

Please investigate these likely causes, in order of likelihood, and fix what's actually wrong:

1. **File size / "fast start" encoding.** The source files are huge -- 150MB to 425MB each, straight from a camera/phone. Un-optimized MP4/MOV exports usually have the `moov atom` (metadata needed for duration/seeking) at the END of the file rather than the start. Browsers need to read that atom before `videoEl.duration` is available and before arbitrary seeking (which is exactly what the scroll-scrub does) works -- without "fast start," the video can appear frozen because the browser can't seek to arbitrary points until much more of the file has downloaded, and `videoEl.duration` may read as `NaN` or `Infinity` early on, which the scrub math divides against.
   - Check with `ffprobe -v trace <file> 2>&1 | grep -i moov` or by inspecting whether `moov` appears near the start vs. end of each file.
   - If ffmpeg isn't installed, install it (e.g. `winget install ffmpeg` or `choco install ffmpeg` on Windows) rather than skipping this check.
   - Re-mux each video with `ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4` (this just rewrites the container, no re-encode, so it's fast and lossless) and replace the file in place.

2. **File size itself is almost certainly too large for smooth web scrubbing regardless of faststart.** 150-425MB per video is far beyond normal web delivery (typical hero/scroll videos are 5-30MB). Even with faststart, scrubbing requires frequent seeks across the whole timeline, which will stutter or hang badly on files this large over a network connection (including Cloudinary CDN delivery). Compress each video with something like:
   `ffmpeg -i input.mp4 -vcodec libx264 -crf 23 -preset slow -vf "scale=1920:-2" -movflags +faststart -acodec aac -b:a 128k output.mp4`
   Adjust `-crf` (lower = higher quality/bigger file, 20-26 is a reasonable range) and the `scale` target to match what `ProjectVideo.jsx` actually displays it at, and compare output file sizes -- aim for well under 50MB per video if possible, ideally under 20MB, without visibly hurting quality. Confirm audio is even needed (the `<video>` tags are `muted`, so consider stripping audio entirely with `-an` to save size).

3. **The `.mov` → `.mp4` rename for the-modern-classical-home specifically.** A renamed-not-transcoded file may use a codec (e.g. HEVC/H.265 from an iPhone) that not all browsers play back well in an MP4 container, or may simply not be a valid MP4 bitstream despite the extension. Actually re-encode this one (not just remux) using the same ffmpeg command as step 2 to guarantee a real, standard H.264 MP4 -- don't just rely on `-c copy` for this file.

4. **Confirm the actual browser behavior**, not just a headless check: open each of the 6 project pages in a real desktop browser (Chrome/Edge) at a wide viewport (scrubbing is desktop-only per `scrubEnabled = !reduceMotion && isDesktop`), scroll through the pinned video section, and confirm the video visibly plays/scrubs rather than staying on one frame. Check the Network tab to see whether the video is fully downloading before playback starts or streaming/seeking properly (range requests, HTTP 206 responses).

5. Once local files are fixed and confirmed working, re-run `npm run upload:cloudinary` to push the corrected (faststart + compressed) versions to Cloudinary, since the site serves video via Cloudinary URLs (see `getProjectVideo` in `src/lib/projects.js`), and verify playback again through the actual Cloudinary URLs (not just the local file), since Cloudinary's own delivery/transformation settings could also affect this -- check whether Cloudinary is applying any video transformation that needs adjusting for smooth range-request delivery.

Report back: what the actual root cause was (faststart, file size, codec issue, or something else you found), what you changed for each of the 6 files, the before/after file sizes, and confirmation that scroll-scrub playback now works correctly in a real browser for all 6.
