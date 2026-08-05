export default function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <video
        src="/videos/hero-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute top-0 left-0 h-[250px] w-full bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
    </section>
  );
}
