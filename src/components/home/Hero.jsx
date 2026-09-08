export default function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <video
        poster="/images/hero/poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        // The poster is the single most prominent above-the-fold image on
        // the site (first paint of the homepage) -- fetchPriority hints the
        // browser to fetch it with the same urgency `priority` gives an
        // <Image>, since <video poster> has no equivalent prop of its own.
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-video-hevc.mp4" type="video/mp4; codecs=hvc1" />
        <source src="/videos/hero-video-h264.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-0 left-0 h-[250px] w-full bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
    </section>
  );
}
