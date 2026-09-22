Verify the project photo galleries are intact and finish adding project videos.

Context: 6 client-provided videos were just placed as `public/images/projects/<slug>/video.mp4` for these projects:
- the-neo-colonial-home
- the-modern-classical-home (was originally a .mov file, renamed to video.mp4 -- NOT re-encoded, just renamed)
- the-modern-eclectic-home
- the-modern-transitional-home
- the-shraddhas-thinkpad
- the-modern-organic-home (this one already had video support before; its old video.mp4 was renamed to video-old-backup.mp4 in the same folder, and the new client video took its place as video.mp4)

`scripts/photo-manifest.json` was regenerated once by mistake (which temporarily wiped every project's photo list down to 0 photos each), then restored via `git checkout -- scripts/photo-manifest.json`, then manually patched to set `hasVideo: true` for the 5 newly-added projects (Organic Home already had `hasVideo: true` from before). The photo arrays for every project should currently match what's in git history exactly -- nothing should be missing.

Please do the following, in order:

1. Run `git diff scripts/photo-manifest.json` and confirm the only change from the last commit is `hasVideo` flipping from `false` to `true` for the 5 slugs listed above (the-modern-organic-home should show no diff at all, or only if posterFile changed). If any project's `photos` array shows as changed/removed in the diff, STOP and flag it -- do not proceed.

2. Start the dev server (`npm run dev`) and check, for at least these projects:
   - One project NOT in the video list (e.g. the-modern-neo-classical-home) -- confirm its photo gallery renders normally, unchanged.
   - the-neo-colonial-home -- confirm its photo gallery renders AND a video section appears below the gallery, before the "next project" link.
   - the-modern-classical-home -- confirm the video section renders and actually plays back correctly in the browser (this file was a .mov renamed to .mp4 without re-encoding -- if it fails to play or shows a broken video icon, flag this specifically, since it may need real transcoding via ffmpeg).

3. Once local playback looks correct across all 6 video projects, run `npm run upload:cloudinary` to mirror the new video files (and the renamed the-modern-organic-home/video.mp4) to Cloudinary. This will take a while given file sizes (150-425MB each) -- let it run to completion and report the full output, especially any failed uploads.

4. After the Cloudinary upload finishes, confirm `scripts/cloudinary-url-map.json` has new entries for each of the 6 `public/images/projects/<slug>/video.mp4` paths (and the poster for the-modern-organic-home if it has one).

Report back: (a) whether the manifest diff was clean, (b) which projects' video sections rendered and played correctly locally, (c) whether the-modern-classical-home's renamed .mov played fine or needs real transcoding, and (d) the Cloudinary upload result.
