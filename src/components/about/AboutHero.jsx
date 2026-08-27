"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Total pinned scroll distance. 100vh of that is the natural viewport; the
// remaining 200vh is the extra runway the four phases scrub across.
const SECTION_HEIGHT_VH = 300;

const PHOTO_ASPECT = "1067 / 1600"; // S.png / P.png's native canvas ratio
const PHOTO_WRAPPER_CLASS = "relative w-[26vw] sm:w-[20vw] md:w-[16vw] lg:w-[13vw]";

// Large, confident display size -- proportional to the doubled final photo
// size below, not secondary to it.
const WORDMARK_TEXT_CLASS =
  "text-[36px] sm:text-[52px] md:text-[88px] lg:text-[120px] uppercase";
const LETTER_TEXT_CLASS = "text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase";

// Where each letter sits ON its own photo, as a percentage of the group's
// own box -- object-contain maps the image into that box 1:1, so these
// percentages target the actual subject's head/shoulder area in each
// specific photo. `left` legitimately differs per photo (S.png and P.png
// place their subject at different horizontal offsets within their own
// canvas), but `top` is shared: S and P both use LETTER_MARK_TOP so they
// land on the exact same horizontal line across the pair -- they read as
// one matched, aligned set rather than one sitting higher/closer than the
// other. (An earlier version used two different `top` values, 47 and 51,
// tuned per-photo to clear each face individually -- that was the source
// of the "misaligned pair" look; both faces clear fine at the shared 49.)
const LETTER_MARK_TOP = 49;
// left legitimately differs (see comment above). At FINAL_PHOTO_SCALE
// (2.9), each group box bulges from its own center enough that the two
// *boxes* overlap by ~65% of their own width (measured: S's box right
// edge and P's box left edge overlap by ~356px out of a 543px box) -- so
// a percentage tuned only to "read as separate within its own box" (e.g.
// 68/34) can still land the two marks only a couple of px apart in
// absolute screen terms once both boxes are this scaled up. These two
// values are solved against the *actual measured* absolute overlap so
// the marks land with a real ~68px gap between them, while both stay
// comfortably inside their own subject's body span (S: 49%-94% of its
// canvas width, P: 16%-45% of its own -- measured from each PNG's
// non-transparent pixel bounds).
const S_MARK_POSITION = { top: LETTER_MARK_TOP, left: 62 };
const P_MARK_POSITION = { top: LETTER_MARK_TOP, left: 40 };

// Priyanka's cutout (P.png) has more empty canvas around her than
// Shubham's (S.png) does around him -- her visible subject occupies a
// smaller fraction of her own (identically-sized, identically-scaled)
// canvas. Measured directly from each PNG's non-transparent pixel bounds:
// Shubham's subject is 1037px tall out of a 1600px canvas (64.8%);
// Priyanka's is 911px tall out of the same 1600px canvas (56.9%). Both
// groups already share the exact same INITIAL_PHOTO_SCALE/FINAL_PHOTO_SCALE
// numbers -- confirmed via getBoundingClientRect, their rendered *boxes*
// are pixel-identical at every point in the sequence -- so the size
// mismatch isn't a code-level drift, it's this asset-level ratio.
//
// This gets applied to the <Image> itself (via FounderPhoto's imageScale
// prop below), NOT to the group's own GSAP scale. An earlier version of
// this fix multiplied the *group's* scale for P, which also scaled the
// letter (nested in that same box, positioned as a % of it) and the row's
// flex `items-center` cross-axis sizing (P's group became taller than
// S's, so the row no longer centered their top edges the same way) --
// that's what caused the S/P letters to end up both overlapping *and*
// misaligned again. Scaling only the image leaves the group box (and
// everything positioned relative to it) identical between S and P.
const S_SUBJECT_HEIGHT_RATIO = 1037 / 1600;
const P_SUBJECT_HEIGHT_RATIO = 911 / 1600;
const P_SCALE_COMPENSATION = S_SUBJECT_HEIGHT_RATIO / P_SUBJECT_HEIGHT_RATIO;

// Photo scale at the fully-assembled end state (both the GSAP end value and
// the reduced-motion static fallback share this so the two paths land on
// the same composition). 2.9 = double the previous 1.45 ("increase by
// 100%").
const FINAL_PHOTO_SCALE = 2.9;

// Photo scale at Phase 0 (the far-apart starting position) -- large enough
// that the founders read as recognizable portraits even zoomed out and far
// apart, not tiny distant figures. 2.2 = ~1.76x the previous 1.25 (this
// only moves the tween's *starting* value -- FINAL_PHOTO_SCALE above is a
// separate constant and is unaffected, so Phase 3 stays exactly as-is).
const INITIAL_PHOTO_SCALE = 2.2;

// `sizes` tells next/image the *layout* box width so it can request an
// appropriately-sized source -- but a CSS `transform: scale()` (applied
// below, up to FINAL_PHOTO_SCALE, or FINAL_PHOTO_SCALE * P_SCALE_COMPENSATION
// for P's image specifically) never changes that layout box, only the
// painted size.
// Without accounting for it, next/image fetches a source sized for the
// small unscaled box (matching PHOTO_WRAPPER_CLASS's own vw values) and
// the browser then stretches that undersized image up by the eventual
// scale, which is what caused the blur after the photos got bigger.
// Deriving this from the actual max scale either photo reaches (instead
// of hardcoding separate numbers) means a future scale change can't
// silently reintroduce the same bug. Applying the larger (P) value to
// both is a deliberate, harmless-bandwidth-only simplification -- S ends
// up with a bit more resolution headroom than it strictly needs.
const PHOTO_SIZES_SCALE = FINAL_PHOTO_SCALE * P_SCALE_COMPENSATION;
const PHOTO_SIZES = `(max-width: 640px) ${Math.ceil(26 * PHOTO_SIZES_SCALE)}vw, (max-width: 1024px) ${Math.ceil(20 * PHOTO_SIZES_SCALE)}vw, ${Math.ceil(13 * PHOTO_SIZES_SCALE)}vw`;

// Shared visual treatment for the S/P marks -- used by both the nested
// (source) letter in FounderPhoto and the position:fixed duplicate in
// LetterDisplay below, so the two can never visually drift apart.
const LETTER_DISPLAY_STYLE = {
  fontFamily: "var(--font-agatho)",
  color: CREAM,
  textShadow: "0 1px 3px rgba(43,38,34,0.7), 0 2px 8px rgba(43,38,34,0.5)",
  lineHeight: 1,
};

// The source letter is nested inside its photo's group, so its rendered
// size already reflects the group's own GSAP scale (up to 2.9x at Phase
// 3) on top of its own authored LETTER_TEXT_CLASS size -- e.g. 36px
// authored renders at ~104px once the group is fully scaled. The display
// duplicate has no such ancestor, so without correcting for this it
// renders at its own unscaled ~36px -- looking like a completely
// different, undersized mark floating near the correctly-sized (but
// invisible-where-covered) source. Caching each duplicate's own natural
// (unscaled) size once, keyed by element, means computing the live ratio
// against the source's current rendered size is just one division.
const naturalLetterSizeCache = new WeakMap();

function getNaturalLetterHeight(el) {
  if (!naturalLetterSizeCache.has(el)) {
    naturalLetterSizeCache.set(el, parseFloat(getComputedStyle(el).fontSize));
  }
  return naturalLetterSizeCache.get(el);
}

// Mirrors a nested S/P letter's live on-screen position/opacity/size onto a
// position:fixed duplicate rendered outside both photo groups' stacking
// contexts. This is necessary, not cosmetic: each photo group carries its
// own GSAP-driven `transform`, and a `transform` always creates a new CSS
// stacking context. Once S's and P's groups visually overlap -- which
// they do by design once they converge, so the two founders read as
// standing together -- the later one in DOM order (P) paints its *entire*
// subtree over the earlier one (S) wherever they overlap, including
// anything nested inside it. No z-index on the nested letter can escape
// that: z-index only resolves ordering *within* a stacking context, and
// both S's mark and P's mark land inside the mutual overlap zone (their
// bodies are the whole point of being there), so whichever group's own
// stacking order currently loses would have its letter invisible
// regardless of which letter or which group "wins." A duplicate outside
// both stacking contexts entirely, position:fixed and driven every frame
// from the source's own getBoundingClientRect (which already reflects
// GSAP's live transform, size included), always paints above both photos
// no matter which one currently wins the overlap.
function syncLetterDisplay(sourceRef, displayRef) {
  const source = sourceRef.current;
  const display = displayRef.current;
  if (!source || !display) return;
  const rect = source.getBoundingClientRect();
  const naturalHeight = getNaturalLetterHeight(display);
  display.style.left = `${rect.left}px`;
  display.style.top = `${rect.top}px`;
  display.style.opacity = getComputedStyle(source).opacity;
  display.style.transform = naturalHeight ? `scale(${rect.height / naturalHeight})` : "none";
}

function LetterDisplay({ displayRef, letter }) {
  return (
    <span
      ref={displayRef}
      aria-hidden="true"
      className={`pointer-events-none fixed z-50 ${LETTER_TEXT_CLASS}`}
      style={{ ...LETTER_DISPLAY_STYLE, opacity: 0, transformOrigin: "top left" }}
    >
      {letter}
    </span>
  );
}

// Renders "_ACE" with the underscore drawn as a small decorative bar --
// mirrors Footer.jsx's InlineWordmark treatment exactly (including *not*
// wrapping it in its own inline-flex box): the bundled Agatho font's
// underscore glyph is a "buy font" watermark, not a real underscore. An
// earlier version here wrapped the bar+text in an `inline-flex` span,
// which gave this element different line-box/baseline metrics than the
// plain-text "Studio" span next to it -- that's what was causing the two
// words to sit on visibly different baselines. Returning plain inline
// content (matching Footer's pattern) fixes it.
function UnderscoreAce() {
  return (
    <>
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          position: "relative",
          top: "0.14em",
          width: "0.32em",
          height: "0.09em",
          backgroundColor: "currentColor",
        }}
      />
      ACE
    </>
  );
}

function FounderPhoto({
  groupRef,
  letterRef,
  src,
  alt,
  letter,
  markPosition,
  className = "",
  finalScale,
  imageScale = 1,
}) {
  return (
    <div
      ref={groupRef}
      className={`${PHOTO_WRAPPER_CLASS} ${className}`}
      style={{
        aspectRatio: PHOTO_ASPECT,
        // Only the reduced-motion static fallback sets this -- the
        // animated path's scale is entirely GSAP's (set below), so this
        // and that never fight over the same property.
        ...(finalScale ? { transform: `scale(${finalScale})` } : null),
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={PHOTO_SIZES}
        quality={90}
        className="object-contain grayscale"
        // Constant, not animated -- applies in both the GSAP path and the
        // reduced-motion static path alike, since it's correcting the
        // source asset's own subject-to-canvas ratio (see
        // P_SCALE_COMPENSATION above), not part of the scroll sequence.
        // object-contain has already fitted the image to the group's box
        // before this applies, so it just enlarges that correctly-fitted
        // image from its own center -- nothing here touches the group's
        // box size, so the letter and the row's flex centering are
        // unaffected.
        style={imageScale !== 1 ? { transform: `scale(${imageScale})` } : undefined}
        priority
      />
      {/* Sits directly on the subject's own upper body/shoulder area
          (markPosition, in %), not floating above the photo in the empty
          canvas margin -- reads as a mark on the person. Percentages
          resolve against the group's own box, which is exactly what
          object-contain maps the image into, so this point tracks the
          same spot on the photo at every breakpoint and scale without
          separate tuning. Nested inside the group that GSAP transforms
          for the convergence tween, so it rides the identical
          xPercent/scale animation as its photo for free -- no separate
          synced tween needed for THIS element's motion.
          This is the source of truth for position/opacity/scale (and
          what centerLetterOnGroup below measures against), but it is NOT
          what actually gets seen once the photos overlap -- see
          syncLetterDisplay/LetterDisplay for why a visible duplicate is
          rendered separately, outside this group's stacking context. */}
      <span
        ref={letterRef}
        className={`absolute ${LETTER_TEXT_CLASS}`}
        style={{
          top: `${markPosition.top}%`,
          left: `${markPosition.left}%`,
          marginTop: "-0.5em",
          marginLeft: "-0.35em",
          ...LETTER_DISPLAY_STYLE,
        }}
      >
        {letter}
      </span>
    </div>
  );
}

// Every *Ref prop is optional -- the reduced-motion fallback renders this
// same markup with no refs at all (isStatic instead applies FINAL_PHOTO_SCALE
// directly via CSS, since there's no GSAP tween to land it there).
function WordmarkRow({
  studioRef,
  aceRef,
  sGroupRef,
  pGroupRef,
  sLetterRef,
  pLetterRef,
  isStatic = false,
}) {
  return (
    // Single centered flex row -- the whole lockup (Studio + S/P + photos
    // + _ACE) reads as one compact, unified composition in the middle of
    // the viewport, not spread across the full width. (An earlier pass
    // tried a 3-column edge-to-edge grid; that was the wrong call and this
    // reverts it, keeping only the larger photo/text sizes from that pass.)
    <div className="relative flex h-full w-full items-center justify-center gap-2 px-4 sm:gap-3 sm:px-8 md:gap-4">
      <span
        ref={studioRef}
        className={WORDMARK_TEXT_CLASS}
        style={{ fontFamily: "var(--font-agatho)", color: INK, lineHeight: 1 }}
      >
        Studio
      </span>

      <FounderPhoto
        groupRef={sGroupRef}
        letterRef={sLetterRef}
        src="/images/about/S.png"
        alt="Shubham, co-founder of Studio SP_ACE"
        letter="S"
        markPosition={S_MARK_POSITION}
        className="-mr-2 sm:-mr-3 md:-mr-4"
        finalScale={isStatic ? FINAL_PHOTO_SCALE : undefined}
      />

      <FounderPhoto
        groupRef={pGroupRef}
        letterRef={pLetterRef}
        src="/images/about/P.png"
        alt="Priyanka, co-founder of Studio SP_ACE"
        letter="P"
        markPosition={P_MARK_POSITION}
        imageScale={P_SCALE_COMPENSATION}
        finalScale={isStatic ? FINAL_PHOTO_SCALE : undefined}
      />

      <span
        ref={aceRef}
        className={WORDMARK_TEXT_CLASS}
        style={{ fontFamily: "var(--font-agatho)", color: INK, lineHeight: 1 }}
      >
        <UnderscoreAce />
      </span>
    </div>
  );
}

export default function AboutHero() {
  const outerRef = useRef(null);
  const bgWordRef = useRef(null);
  const sGroupRef = useRef(null);
  const pGroupRef = useRef(null);
  const sLetterRef = useRef(null);
  const pLetterRef = useRef(null);
  const sLetterDisplayRef = useRef(null);
  const pLetterDisplayRef = useRef(null);
  const studioWordRef = useRef(null);
  const aceWordRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Runs the same pinned/scrubbed sequence at every viewport width -- only
  // prefers-reduced-motion opts out, matching every other section's rule.
  const enhanced = !reduceMotion;

  // The reduced-motion static path has no scroll-driven timeline to hook a
  // per-frame sync into, but it still needs the display duplicates
  // positioned once after its own layout (including the finalScale/
  // imageScale transforms, which are plain CSS there) has settled.
  useEffect(() => {
    if (enhanced) return;
    syncLetterDisplay(sLetterRef, sLetterDisplayRef);
    syncLetterDisplay(pLetterRef, pLetterDisplayRef);
  }, [enhanced]);

  useEffect(() => {
    if (!enhanced) return;

    // Owned outside gsap.context below because it's wired up via
    // gsap.ticker.add, not a GSAP tween/set -- ctx.revert() only undoes
    // things the context created, so this needs its own explicit
    // gsap.ticker.remove on cleanup (see the returned function).
    let syncDisplays;

    // This is the first section on the page, directly under the fixed
    // Nav with nothing above it in document flow -- unlike About/Projects
    // on the home page, this trigger's "top top" measurement doesn't
    // depend on any earlier section's mount-time layout settling, so it's
    // safe to build the ScrollTrigger immediately instead of waiting for
    // "preloader:complete" (same reasoning as Hero/HeroQuoteTransition).
    const ctx = gsap.context(() => {
      // The S/P letters need to reveal FROM their photo's visual center,
      // not just fade in in place. Since each letter is absolutely
      // positioned via CSS inset (its authored "resting" spot), the offset
      // from there to its group's center depends on the group's actual
      // rendered size -- which varies by breakpoint (PHOTO_WRAPPER_CLASS is
      // vw-based) and isn't expressible as a clean percentage (percentage
      // transforms resolve against the letter's *own* tiny box, not its
      // parent's). Measuring both rects once at setup -- before any
      // transform is applied, so this reads the plain untransformed layout
      // -- and setting an exact px offset is simpler and more robust than
      // hand-deriving the percentage math per breakpoint. This runs once on
      // mount, not per frame, so it's cheap; the child's transform then
      // composes correctly with whatever transform the parent group applies
      // during the convergence tween below, with no further math needed.
      const centerLetterOnGroup = (letterEl, groupEl) => {
        const groupRect = groupEl.getBoundingClientRect();
        const letterRect = letterEl.getBoundingClientRect();
        const dx =
          groupRect.left + groupRect.width / 2 - (letterRect.left + letterRect.width / 2);
        const dy =
          groupRect.top + groupRect.height / 2 - (letterRect.top + letterRect.height / 2);
        gsap.set(letterEl, { x: dx, y: dy, scale: 0, opacity: 0 });
      };
      centerLetterOnGroup(sLetterRef.current, sGroupRef.current);
      centerLetterOnGroup(pLetterRef.current, pGroupRef.current);

      // Phase 0 (authored starting state): photos apart and zoomed down,
      // "Studio"/"_ACE" off-screen and invisible. The resting/final values
      // are just the plain, untransformed flex-row layout, so every
      // offset below is xPercent (relative to the element's own box) --
      // responsive for free, no hand-measured pixel offsets to maintain.
      gsap.set(sGroupRef.current, { xPercent: -160, scale: INITIAL_PHOTO_SCALE });
      gsap.set(pGroupRef.current, { xPercent: 160, scale: INITIAL_PHOTO_SCALE });
      gsap.set(studioWordRef.current, { xPercent: -260, opacity: 0 });
      gsap.set(aceWordRef.current, { xPercent: 260, opacity: 0 });

      // ONE ScrollTrigger, ONE timeline, on the section's own pinned root
      // -- photos, letters, and the word-assembly text never get their
      // own independent triggers (the same golden rule as About/Projects/
      // Quote). transform + opacity only (no width/left tweens) keeps
      // every frame compositor-only work, which is what actually keeps
      // this smooth on mobile -- a GSAP timeline driven by scrub already
      // applies values the same way a hand-rolled quickSetter would, so
      // no separate quickSetter wiring is needed on top of it.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Anchor the timeline to 1 "unit" so every position argument below
      // reads as a literal fraction of the pinned scroll range -- including
      // the trailing 75%-100% hold, where nothing animates but the
      // assembled lockup still needs scroll distance to sit still in.
      tl.to({}, { duration: 1 }, 0);

      // Phase 1 (0%-55%): photos converge toward center and scale up past
      // their natural authored size (FINAL_PHOTO_SCALE) so they read as
      // large/dominant in the assembled composition, not just "full size".
      // The "S"/"P" letters are plain DOM children of these same group
      // elements (not separately targeted), so they ride the identical
      // transform -- the "same transform" convergence the brief asks for,
      // satisfied by nesting rather than a second tween. Both groups use
      // the exact same scale target here -- the S/P subject-size
      // difference is corrected on the <Image> itself (imageScale, a
      // constant, applied independently of this tween), not on the group.
      tl.to(
        [sGroupRef.current, pGroupRef.current],
        { xPercent: 0, scale: FINAL_PHOTO_SCALE, ease: "power2.out", duration: 0.55 },
        0
      );

      // The placeholder "OUR" backdrop recedes as the real wordmark
      // assembles, so the two never visually compete for the same space.
      tl.to(bgWordRef.current, { opacity: 0, ease: "power1.out", duration: 0.2 }, 0.3);

      // 18%-40%: S/P reveal, once convergence is already visibly underway
      // (not present at Phase 0's very start) -- growing from scale(0) at
      // their photo's own center out to their resting position on the
      // photo (markPosition), rather than just fading in in place. x/y
      // animate back to 0 (their authored CSS position, set by
      // centerLetterOnGroup above) while scale/opacity ramp up together.
      tl.to(
        [sLetterRef.current, pLetterRef.current],
        { x: 0, y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 0.22 },
        0.18
      );

      // Phase 2 (40%-75%): "Studio" and "_ACE" slide in from the outer
      // edges to flank the now-adjacent S/P letters, completing the
      // "Studio SP_ACE" lockup before the trailing hold.
      tl.to(
        [studioWordRef.current, aceWordRef.current],
        { xPercent: 0, opacity: 1, ease: "power2.out", duration: 0.35 },
        0.4
      );

      // Keep the position:fixed letter duplicates (see syncLetterDisplay)
      // glued to their nested source letters on every single rendered
      // frame, not just when the timeline's own onUpdate fires. Driving
      // this off tl.eventCallback("onUpdate", ...) was the bug: GSAP
      // ScrollTrigger's refresh() -- which SmoothScroll.jsx explicitly
      // re-triggers once the custom Agatho font finishes loading, since
      // that swap can shift this section's layout metrics after the
      // trigger's start/end were first measured -- snaps the timeline to
      // its new correct progress via progress(value, true), where that
      // second `true` is GSAP's suppressEvents flag. It deliberately does
      // NOT fire onUpdate. The source letters and photo groups are driven
      // by direct GSAP tweens, so the refresh's snap still visibly
      // repaints them at the new correct position -- but the fixed-
      // position duplicates (LetterDisplay), whose only source of truth
      // was that suppressed onUpdate, stayed frozen exactly where they
      // were before the refresh. That is what produced the reported
      // "P alone at one spot, SP together at another" frame: the real
      // photos/letters had already snapped to the assembled position,
      // while a duplicate letter -- still fixed at its stale pre-refresh
      // coordinates -- kept rendering on top, on its own, elsewhere.
      // gsap.ticker runs every animation frame regardless of *why* the
      // source moved (scrub, a suppressed refresh snap, a resize-driven
      // reflow), so the duplicate can no longer miss an update no matter
      // which path caused it -- there's no longer a specific event to
      // remember to hook.
      // Assigns the outer `let syncDisplays` (not a shadowing re-declare)
      // so the cleanup below can find and remove this exact function
      // reference from gsap.ticker.
      syncDisplays = () => {
        syncLetterDisplay(sLetterRef, sLetterDisplayRef);
        syncLetterDisplay(pLetterRef, pLetterDisplayRef);
      };
      syncDisplays();
      gsap.ticker.add(syncDisplays);
    }, outerRef);

    return () => {
      if (syncDisplays) gsap.ticker.remove(syncDisplays);
      ctx.revert();
    };
  }, [enhanced]);

  if (reduceMotion) {
    return (
      <section
        // min-h-screen (not just py-24/py-32) matters here: the pinned
        // path always has a full h-screen canvas for the 2.9x-scaled
        // photo to visually bulge into via its transform. This path's
        // section previously sized itself to its *unscaled* layout height
        // (transforms don't add layout height), leaving too little room
        // above the row's natural top edge -- the scaled photo (and the
        // S/P letters riding it) rendered above the page's own top edge,
        // clipped and unreachable by scrolling. A full-viewport section
        // with the row vertically centered inside it gives the same
        // clearance the pinned path gets for free.
        className="flex min-h-screen w-full flex-col items-center justify-center py-24 md:py-32"
        style={{ backgroundColor: CREAM }}
      >
        <h1 className="sr-only">Studio SP_ACE</h1>
        <div aria-hidden="true">
          <WordmarkRow isStatic sLetterRef={sLetterRef} pLetterRef={pLetterRef} />
        </div>
        <LetterDisplay displayRef={sLetterDisplayRef} letter="S" />
        <LetterDisplay displayRef={pLetterDisplayRef} letter="P" />
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative w-full"
      style={{ height: `${SECTION_HEIGHT_VH}vh` }}
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor: CREAM }}
      >
        <h1 className="sr-only">Studio SP_ACE</h1>

        {/* PLACEHOLDER copy -- the voice-brief transcript this was sourced
            from was ambiguous between "OUR" and a longer phrase. Needs
            explicit client confirmation on the exact word(s) before this
            ships; swapping it is a one-line text change once confirmed. */}
        <div
          ref={bgWordRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="text-[100px] sm:text-[160px] md:text-[240px] lg:text-[320px] uppercase"
            style={{ fontFamily: "var(--font-agatho)", color: INK, opacity: 0.06, lineHeight: 1 }}
          >
            Our
          </span>
        </div>

        <div aria-hidden="true" className="h-full w-full">
          <WordmarkRow
            studioRef={studioWordRef}
            aceRef={aceWordRef}
            sGroupRef={sGroupRef}
            pGroupRef={pGroupRef}
            sLetterRef={sLetterRef}
            pLetterRef={pLetterRef}
          />
        </div>

        <LetterDisplay displayRef={sLetterDisplayRef} letter="S" />
        <LetterDisplay displayRef={pLetterDisplayRef} letter="P" />
      </div>
    </section>
  );
}
