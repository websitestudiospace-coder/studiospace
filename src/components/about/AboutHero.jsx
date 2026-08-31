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
// remaining 40vh is the runway the four phases scrub across, plus a ~15%
// settle buffer after the sequence completes (see the timeline positions
// below -- previously 300vh left a ~25% dead tail after the last tween).
const SECTION_HEIGHT_VH = 140;

// S-cutout.png / P-cutout.png's ACTUAL native canvas ratio (1536x1024 = 3/2)
// -- a stale "1067 / 1600" (portrait) value sat here for a while, mismatched
// against the real (landscape) files. Since the group's box drove
// object-contain's fit, that mismatch meant the box was taller than the
// image could ever fill: object-contain constrained by matching the box's
// *width* (image is proportionally much wider than the tall box), leaving
// invisible letterboxing margin above and below the visible photo -- about
// 28% of the box's own height on each side. That invisible margin is what
// broke bottom-anchoring: it's a *percentage* of the box, so anchoring the
// box's own bottom edge doesn't anchor the person's actual feet, which sit
// well inside it. Matching the aspect ratio to the real file makes the box
// and the visible content the same rectangle, so anchoring the box now
// means anchoring the feet.
const PHOTO_ASPECT = "3 / 2";
const PHOTO_WRAPPER_CLASS = "relative w-[26vw] sm:w-[20vw] md:w-[16vw] lg:w-[13vw]";

// CSS `scale()` grows a box outward from its transform-origin, which
// defaults to the box's own center -- so scaling up used to push the
// bottom edge (the feet) *down* by half the added height, past the sticky
// container's own `overflow-hidden` bottom edge, clipping them. Anchoring
// the origin at the bottom instead means growth is entirely upward: the
// bottom edge -- now the visible photo's own bottom edge exactly, since
// PHOTO_ASPECT above removed the letterboxing margin that used to sit
// below it -- stays exactly where the row's own layout (see
// WordmarkRow's `items-end`) put it, at every scale from
// INITIAL_PHOTO_SCALE through FINAL_PHOTO_SCALE. This is what makes "both
// feet at the same Y" and "no clipping" hold simultaneously instead of
// trading off against each other.
const PHOTO_WRAPPER_TRANSFORM_ORIGIN = "50% 100%";

// Phase 0's spread position used to be `xPercent: -160/160` -- a distance
// relative to each group's OWN (scaled) box width, not to the viewport or
// to "OUR". That's exactly why it drifted into an overlap: the actual px
// distance it produced was an indirect side effect of PHOTO_WRAPPER_CLASS's
// width, INITIAL_PHOTO_SCALE, and the flex row's own (asymmetric --
// "Studio" and "_ACE" aren't the same width) resting position, not
// something chosen to clear a specific target. A first attempt at a fixed
// px gap here (72) still wasn't enough -- "OUR" is centered and, at
// INITIAL_PHOTO_SCALE, wide enough that a fixed viewport-edge gap alone
// can't guarantee clearance at every breakpoint's font-size/box-width
// combination. `solveSpreadX` below measures "OUR"'s actual rendered rect
// at runtime and solves for a gap that's provably clear of it (plus this
// margin) -- so it adapts to the real text width instead of a guessed
// constant, at any breakpoint. Since "OUR" is itself perfectly centered,
// solving from its two (symmetric) edges is what makes both photos land
// at the same distance from their respective viewport edges "for free" --
// this margin doesn't need to also encode symmetry, only visual breathing
// room beyond the text.
const OUR_TEXT_CLEARANCE = 56;

// Large, confident display size -- proportional to FINAL_PHOTO_SCALE below,
// not secondary to it. Bumped ~35% at md/lg (88/120 -> 120/160) in step with
// FINAL_PHOTO_SCALE's own ~35% increase (2.9 -> 3.9), so the wordmark keeps
// reading at the same relative weight against the now-larger photos instead
// of looking suddenly small next to them. base/sm are deliberately left at
// their original 36/52 -- bumping those too (tried 48/72 first) pushed the
// flex row's natural content width (Studio + both photo boxes + _ACE) past
// the mobile viewport, and flex-shrink's default equal-shrink-factor
// silently squeezed the photo boxes down well below their intended 26vw/
// 20vw, which is what was actually causing the S/P marks to collide at
// mobile widths -- not the mark positions themselves. There genuinely
// isn't "room" for a bigger wordmark at those breakpoints the way there is
// at md/lg.
const WORDMARK_TEXT_CLASS =
  "text-[36px] sm:text-[52px] md:text-[120px] lg:text-[160px] uppercase";
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
// 47.75, not 49: re-derived after PHOTO_ASPECT was corrected to match the
// real file (3/2) above. The old "49" was tuned against the *old* box,
// which had ~27.8%-of-box-height of invisible letterboxing margin above
// the visible photo (see PHOTO_ASPECT's comment) -- 49% of that taller box
// worked out to 47.75% of the way down the *visible content specifically*
// ((49 - 27.8) / 44.45). Now that the box exactly matches the visible
// content (no letterboxing), that same 47.75% is the value that lands the
// mark on the identical physical spot on each person as before.
const LETTER_MARK_TOP = 47.75;
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
const S_MARK_POSITION = { top: LETTER_MARK_TOP, left: 54 };
const P_MARK_POSITION = { top: LETTER_MARK_TOP, left: 48 };

// S-cutout.png / P-cutout.png are transparent-background person cutouts
// (background-removed from the original S.png/P.png studio portraits, then
// color-decontaminated to strip the dark-backdrop halo the removal left on
// hair edges) sharing the same 1536x1024 canvas the original rectangular
// photos used -- object-contain's fit is driven by that canvas's own
// dimensions, not by where the opaque pixels sit inside it, so swapping the
// backdrop for transparency doesn't change how either photo is laid out.
// It does change what "the subject's own size" means, though: with the
// backdrop gone, the subject's true height is now the cutout's own alpha
// bounding box (measured with a small >10/255 threshold to ignore stray
// near-zero antialiasing dust the matting model leaves at the canvas
// edges), not a visually-estimated span inside an opaque rectangle.
// Measured directly from each cutout's non-transparent pixel bounds:
// Shubham's subject is 1021px tall out of the 1024px canvas (99.7%);
// Priyanka's is 996px tall out of the same 1024px canvas (97.3%) -- both
// are cropped at the exact bottom canvas row, so this height difference is
// really just a small headroom-above-the-hair difference between the two
// source photos, not a body-size difference. Both groups already share the
// exact same INITIAL_PHOTO_SCALE/FINAL_PHOTO_SCALE numbers -- confirmed via
// getBoundingClientRect, their rendered *boxes* are pixel-identical at
// every point in the sequence -- so the size mismatch isn't a code-level
// drift, it's this asset-level ratio.
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
const S_SUBJECT_HEIGHT_RATIO = 1021 / 1024;
const P_SUBJECT_HEIGHT_RATIO = 996 / 1024;
const P_SCALE_COMPENSATION = S_SUBJECT_HEIGHT_RATIO / P_SUBJECT_HEIGHT_RATIO;

// Photo scale at the fully-assembled end state (both the GSAP end value and
// the reduced-motion static fallback share this so the two paths land on
// the same composition). 4.9 = a further ~1.26x on top of the previous
// 3.9 -- now that both groups scale from their own *bottom* edge (see
// PHOTO_WRAPPER_TRANSFORM_ORIGIN below) instead of their center, growing
// bigger no longer pushes the feet down past the sticky container's
// overflow-hidden bottom edge the way it did when scaling from center, so
// there's room to keep pushing this for a more dominant presence without
// reintroducing the clipping this same growth used to cause. Bumping this
// alone is enough to enlarge the S/P marks too, since they're nested
// inside the same scaled group -- see LETTER_TEXT_CLASS's own comment.
const FINAL_PHOTO_SCALE = 4.9;

// Photo scale at Phase 0 (the far-apart starting position) -- large enough
// that the founders read as recognizable portraits even zoomed out and far
// apart, not tiny distant figures. 3.75 = the same ~1.26x bump applied to
// INITIAL as FINAL_PHOTO_SCALE got, so the two phases stay in the same
// proportion to each other (this only moves the tween's *starting* value --
// FINAL_PHOTO_SCALE above is a separate constant and is unaffected, so
// Phase 3 stays exactly as-is).
const INITIAL_PHOTO_SCALE = 3.75;

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
        transformOrigin: PHOTO_WRAPPER_TRANSFORM_ORIGIN,
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
        // image -- nothing here touches the group's box size, so the
        // letter and the row's flex alignment are unaffected. Anchored at
        // the bottom (not this element's own default center) for the same
        // reason as PHOTO_WRAPPER_TRANSFORM_ORIGIN on the parent group:
        // this is the one place P's image gets its own extra zoom the
        // group-level transform doesn't, and a center-anchored zoom would
        // nudge her feet down by half this correction's added height
        // relative to Shubham's (who has no imageScale at all) -- small at
        // ~2.5%, but a real, avoidable re-introduction of the exact
        // bottom-misalignment this whole fix is for.
        style={
          imageScale !== 1
            ? { transform: `scale(${imageScale})`, transformOrigin: "bottom" }
            : undefined
        }
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
    // items-center governs the two text spans (Studio/_ACE) only -- they
    // stay vertically centered on the row same as always. The two
    // FounderPhoto items override that with their own `self-end` (below),
    // bottom-anchoring just the photos flush against the row's own bottom
    // edge instead. Bottom-aligning the *whole row* here would have been
    // the simpler one-line change, but a text span's flex-item box is only
    // as tall as its own line-height -- bottom-aligning it against the now
    // much taller (FINAL_PHOTO_SCALE-scaled) photo boxes would drag
    // "Studio"/"_ACE" down to sit beside the founders' feet instead of
    // their chest/shoulder height. No bottom padding here (an earlier pass
    // added pb-12/pb-24 for clearance above the section's true bottom
    // edge, before PHOTO_ASPECT was corrected) -- now that the box exactly
    // matches the visible photo with no letterboxing margin, that padding
    // just left visible empty space below the already-correctly-anchored
    // feet, so it came back out.
    <div className="relative flex h-full w-full items-center justify-center gap-2 px-4 sm:gap-3 sm:px-8 md:gap-4">
      <span
        ref={studioRef}
        className={WORDMARK_TEXT_CLASS}
        style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1 }}
      >
        Studio
      </span>

      <FounderPhoto
        groupRef={sGroupRef}
        letterRef={sLetterRef}
        src="/images/about/S-cutout.png"
        alt="Shubham, co-founder of Studio SP_ACE"
        letter="S"
        markPosition={S_MARK_POSITION}
        className="self-end -mr-2 sm:-mr-3 md:-mr-4"
        finalScale={isStatic ? FINAL_PHOTO_SCALE : undefined}
      />

      <FounderPhoto
        groupRef={pGroupRef}
        letterRef={pLetterRef}
        src="/images/about/P-cutout.png"
        alt="Priyanka, co-founder of Studio SP_ACE"
        letter="P"
        markPosition={P_MARK_POSITION}
        imageScale={P_SCALE_COMPENSATION}
        className="self-end"
        finalScale={isStatic ? FINAL_PHOTO_SCALE : undefined}
      />

      <span
        ref={aceRef}
        className={WORDMARK_TEXT_CLASS}
        style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1 }}
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
  const ourTextRef = useRef(null);
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
        return { dx, dy };
      };
      const sLetterCenter = centerLetterOnGroup(sLetterRef.current, sGroupRef.current);
      const pLetterCenter = centerLetterOnGroup(pLetterRef.current, pGroupRef.current);

      // Captured now, before anything below applies a transform to either
      // group -- solveSpreadX (further down) needs each group's plain
      // natural rect too, and the wordmark-alignment measurement right
      // after this temporarily transforms sGroupRef specifically.
      const sGroupRectNatural = sGroupRef.current.getBoundingClientRect();
      const pGroupRectNatural = pGroupRef.current.getBoundingClientRect();

      // "Studio"/"_ACE" sit in the same flex row as the photos but are
      // vertically centered independently (items-center, on the row's own
      // height), not anchored to the photos in any way -- so they never
      // automatically track wherever the photos' bottom-anchor happens to
      // land. That was invisible while BOTTOM_CLEARANCE_CLASS's padding
      // existed (it happened to leave the photos, and the S/P letters
      // riding them, close enough to the row's own vertical center that
      // the mismatch didn't read), but removing that padding to flush the
      // photos to the section's true bottom shifted the photos (and S/P)
      // down by exactly that padding amount while "Studio"/"_ACE" stayed
      // put -- ~96px apart at lg, enough to crowd "STUDIO"'s tail into the
      // photo and "_ACE" into Priyanka's hair.
      //
      // The fix is to re-anchor both text spans to the line S/P actually
      // rest on -- but that line only exists once the group is scaled up
      // to FINAL_PHOTO_SCALE; measuring the letter's plain, untransformed
      // rect (as centerLetterOnGroup does, for a completely different
      // purpose) gives its position in a tiny, unscaled box, nowhere near
      // where PHOTO_WRAPPER_TRANSFORM_ORIGIN's bottom-anchor actually
      // leaves it once grown ~5x (a first attempt at this used that
      // measurement directly and pushed "Studio"/"_ACE" down far enough to
      // clip against the section's own bottom edge). So: briefly apply the
      // *actual* Phase-3 configuration to S's group and letter, measure
      // where that puts the letter for real, then immediately overwrite
      // with the real Phase-0 state below -- both happen synchronously,
      // before the browser paints either intermediate state, so nothing
      // ever flashes on screen.
      gsap.set(sGroupRef.current, { x: 0, scale: FINAL_PHOTO_SCALE });
      gsap.set(sLetterRef.current, { x: 0, y: 0, scale: 1, opacity: 1 });
      const sLetterFinalRect = sLetterRef.current.getBoundingClientRect();
      const wordmarkTargetY = sLetterFinalRect.top + sLetterFinalRect.height / 2;
      const wordmarkDy = (wordEl) => {
        const wordRect = wordEl.getBoundingClientRect();
        return wordmarkTargetY - (wordRect.top + wordRect.height / 2);
      };
      const studioDy = wordmarkDy(studioWordRef.current);
      const aceDy = wordmarkDy(aceWordRef.current);

      // Phase 0's spread position: each group's box, once scaled up to
      // INITIAL_PHOTO_SCALE, should clear "OUR"'s actual rendered edge (plus
      // OUR_TEXT_CLEARANCE) -- not "some percentage of its own width away
      // from wherever the flex row happens to rest it," which is what
      // xPercent gave and is why the two photos could end up overlapping
      // "OUR" in the first place. Solved the same way centerLetterOnGroup
      // solves its own offset: measure the plain untransformed rects, then
      // compute the exact `x` (a transform, so this stays compositor-only
      // like everything else in this timeline) that lands the *scaled* box
      // just outside "OUR"'s edge. "OUR" is itself perfectly centered
      // (flex items-center/justify-center over the full section width), so
      // its left and right edges are already symmetric around the
      // viewport's own center -- solving each photo against its nearer
      // "OUR" edge is what makes both land the same distance from their
      // respective viewport edges "for free," with no separate symmetry
      // math needed. PHOTO_WRAPPER_TRANSFORM_ORIGIN is horizontally
      // centered (the "50%" in "50% 100%"), so scaling never shifts the
      // box's horizontal center -- only x needs solving for, not
      // scale-vs-position interaction.
      const ourRect = ourTextRef.current.getBoundingClientRect();
      const solveSpreadX = (groupRect, side) => {
        const scaledHalfWidth = (INITIAL_PHOTO_SCALE * groupRect.width) / 2;
        const centerX = groupRect.left + groupRect.width / 2;
        return side === "left"
          ? ourRect.left - OUR_TEXT_CLEARANCE - scaledHalfWidth - centerX
          : ourRect.right + OUR_TEXT_CLEARANCE + scaledHalfWidth - centerX;
      };
      const sSpreadX = solveSpreadX(sGroupRectNatural, "left");
      const pSpreadX = solveSpreadX(pGroupRectNatural, "right");

      // Phase 0 (authored starting state): photos apart and zoomed down,
      // letters collapsed at their photo's center, "Studio"/"_ACE"
      // off-screen and invisible. This is also what overwrites the
      // temporary Phase-3 configuration the wordmark-alignment
      // measurement above applied to sGroupRef/sLetterRef -- since both
      // that measurement and this all happen synchronously with no paint
      // in between, the temporary state is never actually visible.
      gsap.set(sGroupRef.current, { x: sSpreadX, scale: INITIAL_PHOTO_SCALE });
      gsap.set(pGroupRef.current, { x: pSpreadX, scale: INITIAL_PHOTO_SCALE });
      gsap.set(sLetterRef.current, {
        x: sLetterCenter.dx,
        y: sLetterCenter.dy,
        scale: 0,
        opacity: 0,
      });
      gsap.set(pLetterRef.current, {
        x: pLetterCenter.dx,
        y: pLetterCenter.dy,
        scale: 0,
        opacity: 0,
      });
      // y is set once here and never targeted by the timeline below, so it
      // holds constant through the whole sequence while xPercent/opacity
      // animate -- these two words stay level with the S/P letters at
      // every phase, not just once assembled at the end.
      gsap.set(studioWordRef.current, { xPercent: -260, y: studioDy, opacity: 0 });
      gsap.set(aceWordRef.current, { xPercent: 260, y: aceDy, opacity: 0 });

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
      // the trailing 85%-100% hold, where nothing animates but the
      // assembled lockup still needs scroll distance to sit still in.
      tl.to({}, { duration: 1 }, 0);

      // Phase 1 (0%-62%): photos converge toward center and scale up past
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
        { x: 0, scale: FINAL_PHOTO_SCALE, ease: "none", duration: 0.62 },
        0
      );

      // The placeholder "OUR" backdrop recedes as the real wordmark
      // assembles, so the two never visually compete for the same space.
      tl.to(bgWordRef.current, { opacity: 0, ease: "none", duration: 0.23 }, 0.34);

      // 20%-45%: S/P reveal, once convergence is already visibly underway
      // (not present at Phase 0's very start) -- growing from scale(0) at
      // their photo's own center out to their resting position on the
      // photo (markPosition), rather than just fading in in place. x/y
      // animate back to 0 (their authored CSS position, set by
      // centerLetterOnGroup above) while scale/opacity ramp up together.
      tl.to(
        [sLetterRef.current, pLetterRef.current],
        { x: 0, y: 0, scale: 1, opacity: 1, ease: "none", duration: 0.25 },
        0.2
      );

      // Phase 2 (45%-85%): "Studio" and "_ACE" slide in from the outer
      // edges to flank the now-adjacent S/P letters, completing the
      // "Studio SP_ACE" lockup before the trailing hold.
      tl.to(
        [studioWordRef.current, aceWordRef.current],
        { xPercent: 0, opacity: 1, ease: "none", duration: 0.4 },
        0.45
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
        style={{ backgroundColor: INK }}
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
      style={{ height: `${SECTION_HEIGHT_VH}vh`, backgroundColor: INK }}
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor: INK }}
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
            ref={ourTextRef}
            className="text-[100px] sm:text-[160px] md:text-[240px] lg:text-[320px] uppercase"
            style={{ fontFamily: "var(--font-agatho)", color: CREAM, opacity: 0.1, lineHeight: 1 }}
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
