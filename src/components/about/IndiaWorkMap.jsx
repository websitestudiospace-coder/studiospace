import india from "@svg-maps/india";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const BASE_FILL = "#E8E1D6";
const HIGHLIGHT_FILL = "#AE9873";

// Coordinates below are in the package's own viewBox units (0 0 612 696,
// standard map orientation -- x increases east, y increases south).
// Dot positions are each target state's actual SVG bounding-box center,
// confirmed (via a headless canvas isPointInPath check against the real
// path geometry, not eyeballed) to land inside that state's shape, not in
// a concave notch outside it. labelPos is deliberately NOT the same as
// dot -- it's shifted so the three leader lines fan out into the left
// margin without crossing each other (Maharashtra and Telangana's dots
// sit only ~22 units apart vertically but at different x, so pulling
// their label rows apart -- 380/470/560 -- keeps each line in its own
// vertical band).
const HIGHLIGHTS = {
  mh: { label: "MAHARASHTRA", dot: [179.7, 435.3], labelPos: [-30, 380] },
  tg: { label: "TELANGANA", dot: [237.1, 456.6], labelPos: [-30, 470] },
  ka: { label: "KARNATAKA", dot: [170.6, 518.7], labelPos: [-30, 560] },
};

// The package's own landmass (including outlying islands) already spans
// the full 0 0 612 696 viewBox with no built-in margin, so there's no
// empty space inside it to drop labels into -- this pads the viewBox
// itself, mostly on the left (where these three western/southern states
// sit, with open sea beyond their coastline in this data's orientation),
// so the leader lines/labels have somewhere to live outside the map
// outline instead of overlapping other states.
const PAD_LEFT = 190;
const PAD_TOP = 10;
const PAD_RIGHT = 10;
const PAD_BOTTOM = 10;
const VIEW_BOX = `-${PAD_LEFT} -${PAD_TOP} ${612 + PAD_LEFT + PAD_RIGHT} ${
  696 + PAD_TOP + PAD_BOTTOM
}`;

export default function IndiaWorkMap() {
  return (
    <svg
      viewBox={VIEW_BOX}
      className="h-auto w-full"
      role="img"
      aria-label="Map of India highlighting Maharashtra, Telangana, and Karnataka, the states where Studio SP_ACE works"
    >
      {india.locations.map((location) => (
        <path
          key={location.id}
          d={location.path}
          fill={HIGHLIGHTS[location.id] ? HIGHLIGHT_FILL : BASE_FILL}
          stroke={CREAM}
          strokeWidth={1.5}
        />
      ))}

      {Object.entries(HIGHLIGHTS).map(([id, { label, dot, labelPos }]) => (
        <g key={id}>
          <line
            x1={dot[0]}
            y1={dot[1]}
            x2={labelPos[0] + 6}
            y2={labelPos[1]}
            stroke={INK}
            strokeWidth={1}
            opacity={0.5}
          />
          <circle cx={dot[0]} cy={dot[1]} r={5} fill={INK} />
          <text
            x={labelPos[0]}
            y={labelPos[1]}
            textAnchor="end"
            dominantBaseline="middle"
            fill={INK}
            style={{
              fontFamily: "var(--font-manrope)",
              fontSize: 15,
              letterSpacing: "0.15em",
            }}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}
