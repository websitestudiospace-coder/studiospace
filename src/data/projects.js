// Static project roster. Photo lists, cover image, gallery layout, and video
// availability are all resolved from the filesystem at request time (see
// @/lib/projects) so dropping/removing files in public/images just works
// without touching this file.
//
// Text copy (description/longDescription/typology/location/squareFootage/
// completion) is real client-provided content as of this pass. Cover/gallery
// photos are untouched -- the client only shared Google Drive links for
// those, not actual image files, so there's nothing to process yet.
export const PROJECTS = [
  {
    slug: "the-modern-eclectic-home",
    name: "The Modern Eclectic Home",
    description:
      "A colourful and eclectic first home on the edge of Turahalli Forest, designed around a love for pattern, art, and vibrant details. The result is a warm, personal space that feels cheerful without feeling overwhelming.",
    longDescription: `Located on the edge of Turahalli Forest, this home was designed for a corporate professional creating her first owned home. The brief was simple — to bring in colour and personality while keeping the spaces comfortable, practical, and mindful of the budget. The design takes an eclectic approach, using colour and pattern in small, thoughtful ways rather than following one particular style. A mix of textiles, artwork, furnishings, and decorative details brings the client's love for vibrant colours into the home, while a simple base keeps everything feeling balanced. Each space has its own little moments of character, with layers of pattern and colour adding warmth without making the interiors feel busy. The result is a cheerful, lived-in home that feels distinctly personal and reflects the client's personality at every turn.`,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,300 sq. ft.",
    completion: "2023",
  },
  {
    slug: "the-modern-neo-classical-home",
    name: "The Modern Neo Classical Home",
    description:
      "A warm Neo-Classical retreat in West Bangalore, transformed from an old bachelor's pad into a calm and welcoming home. Rich wood, soft neutrals, and subtle black and brass details add warmth and character.",
    longDescription: `This West Bangalore bungalow, built about a decade ago, was remodelled to create a warm and calming home for a young couple. The first floor was completely reworked to suit their lifestyle, with spaces designed for unwinding after a long day, spending time with family, and having friends over. The design takes a contemporary approach to Neo-Classical style, combining clean forms with subtle traditional details. Rich wood brings warmth to the interiors, while soft neutrals, muted blush tones, black accents, and brass details add depth without making the spaces feel heavy. Patterned tiles and carefully chosen furniture bring small moments of personality, particularly in the kitchen and bathrooms. What was once an old bachelor's pad has now become a cosy, considered retreat that feels relaxed, contemporary, and quietly elegant.`,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "1,300 sq. ft.",
    completion: "2024",
  },
  {
    slug: "the-modern-transitional-home",
    name: "The Modern Transitional Home",
    description:
      "A warm and playful transitional home in Hyderabad, designed for a young family returning to their Indian roots. Classic details, expressive colours, and patterns come together with a fresh, contemporary feel.",
    longDescription: `Designed for a young family making the move from the States to Hyderabad, this 4 BHK home brings together the familiarity of their life abroad with subtle references to their Indian roots. The brief was to create a space that felt warm, relaxed, and welcoming, while still having a sense of formality and detail. The interiors take a transitional approach, combining contemporary forms with more classic elements. A mix of colours, patterns, and prints brings a playful energy to the home, while ornate wood and glass details add a more timeless layer. As an outstation project, the home came together through many conversations and careful coordination across the distance. The result is a cosy, vibrant space that feels personal to the family and is designed to grow and evolve with them over time.`,
    typology: "Residential",
    location: "Hyderabad",
    squareFootage: "2,600 sq. ft.",
    completion: "2025",
  },
  {
    slug: "the-modern-classical-home",
    name: "The Modern Classical Home",
    description:
      "A modern home with classical influences, shaped around an earthy palette, collected curios, and subtle touches of colour. Designed for a family that values calm living, travel, and spaces with a sense of character.",
    longDescription: `Located in one of North Bangalore's sought-after neighbourhoods, this home was designed for a family who enjoy travelling, discovering new places, and collecting pieces that hold a story. Their love for calm, earthy interiors became the starting point for a home that feels warm and personal, while still being current and refined. The design takes a modern approach at its core, with classical details woven in through furniture, finishes, and architectural elements. A neutral palette forms the base, while carefully placed colour, texture, and collected objects bring depth and personality into the spaces. Rather than following one particular style, the home brings together different influences in a way that feels natural to the family. The result is a comfortable, characterful home that balances everyday functionality with the individuality of the people who live in it.`,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,000 sq. ft.",
    completion: "2025",
  },
  {
    slug: "the-modern-organic-home",
    name: "The Modern Organic Home",
    description:
      "A calm, modern organic home in North Bangalore, designed around natural materials, warm textures, and clean lines. A restrained palette creates a serene backdrop, while thoughtful touches of colour bring personality to the bedrooms.",
    longDescription: `Spread across 2,400 sq. ft., this three-bedroom apartment in North Bangalore was designed for a doctor couple who wanted their home to feel calm, soothing, and timeless. Taking cues from the Modern Organic style, the design brings together natural materials and clean forms in a warm, understated palette. Marble, warm wood, limestone, rich textures, and subtle brass and glass details come together with touches of black to add depth and contrast. The common spaces follow a quiet and cohesive material palette, with soft lighting and textured surfaces adding warmth throughout. In the bedrooms, colour comes through in more playful ways, giving each space its own personality. The result is a home that feels simple and serene, while still having enough detail and character to make it feel personal.`,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,400 sq. ft.",
    completion: "2025",
  },
  {
    slug: "the-neo-colonial-home",
    name: "The Neo Colonial Home",
    description:
      "A warm Neo Colonial home in Chembur, designed for a young family with a love for colour and character. Rich hues, natural textures, and timeless details come together to create a relaxed and inviting home.",
    longDescription: `Designed for a young family in Chembur, this 1,500 sq. ft. home takes a softer approach to Neo Colonial design, bringing together familiar traditional details with a more relaxed, contemporary feel. Warm timber, limewashed textures, brass accents, and a palette of jewel tones and earthy rusts create a backdrop that feels both nostalgic and fresh. Arched transitions, checkerboard flooring, patterned tiles, and sculptural lighting add character throughout the home. The kitchen brings in a playful touch with coloured cabinetry, while the bathrooms take on a richer mood with terracotta, deep brown, and cobalt blue. A sunlit balcony with a suspended swing adds another relaxed corner to the home. Together, these details create a warm and personal space where every room has its own character, while still feeling connected to the home as a whole.`,
    typology: "Residential",
    location: "Mumbai",
    squareFootage: "1,500 sq. ft.",
    completion: "2026",
  },
  // Working title as provided by the client -- doesn't match the "The [Style]
  // Home" naming pattern of the other projects, kept as-is rather than
  // renamed to fit.
  {
    slug: "the-shraddhas-thinkpad",
    name: "Shraddha's Thinkpad",
    description:
      "A creative work-home in West Bangalore, where modern, airy spaces meet Indian and Bohemian influences. Natural materials, warm neutrals, brass, and abundant greenery create a calm backdrop for everyday life and creativity.",
    longDescription: `Originally a conventional 3 BHK apartment in West Bangalore, this home was remodelled for a digital content creator looking for a space that could work equally well as her home and creative studio. The brief was to create something calm and contemporary, while bringing in the warmth and character of Indian and Bohemian influences. Natural wood and cane, neutral tones, Indian prints, brass accents, and plenty of greenery form the foundation of the interiors. The spaces were planned to be flexible, allowing them to easily change with different creative setups while remaining comfortable for everyday living. Considerable civil changes helped transform the original apartment into a more open and adaptable home. Airy, cosy, and full of natural warmth, the finished space brings together an easy modern feel with subtle old-world charm.`,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "1,100 sq. ft.",
    completion: "2024",
  },
];
