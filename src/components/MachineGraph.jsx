/**
 * MachineGraph.jsx
 * Pure SVG automata diagram renderer.
 * No React Flow — complete control over every visual element.
 */
import { useRef, useState, useCallback } from 'react';

// ── Visual constants ──────────────────────────────────────────────────────────
const R       = 42;   // state circle radius
const INNER_R = 31;   // inner ring radius for final states (gap of 11px from outer)
const VW      = 960;
const VH      = 480;

// ── HIGH-CONTRAST color palette ───────────────────────────────────────────────
const COLOR = {
  // Machine type colors
  MOORE:       '#818cf8',   // bright indigo
  MEALY:       '#c084fc',   // bright purple

  // Final state — UNMISTAKABLE gold/yellow double-ring
  FINAL_RING:  '#fbbf24',   // bold amber/gold — can't miss it
  FINAL_FILL:  '#1a1500',   // very dark gold tint fill
  FINAL_GLOW:  '#fbbf24',   // glow color

  // Highlighted (simulation active state)
  HI_RING:     '#22d3ee',   // bright cyan
  HI_FILL:     '#001a1f',   // very dark cyan tint
  HI_GLOW:     '#22d3ee',

  // Normal state
  NODE_FILL:   '#141e33',   // dark navy — NOT the same as canvas bg
  NODE_RING:   '#3b4f7a',   // medium blue-gray border

  // Text
  TEXT:        '#f8fafc',
  STATE_LABEL: '#a5b4fc',   // bright indigo for state names
  OUTPUT:      '#ffffff',   // pure white for output value

  // Edges
  LABEL_BG:    '#080f20',   // near-black for label boxes
  DIM:         '#475569',
};

// ── Layout ────────────────────────────────────────────────────────────────────
function computeLayout(states) {
  const n   = states.length;
  const pos = {};
  if (n === 0) return pos;
  if (n === 1) { pos[states[0]] = { x: VW / 2, y: VH / 2 }; return pos; }

  if (n <= 6) {
    // Horizontal row — leave room for initial-arrow on left and labels on right
    const maxSpacing = 160;
    const usableW    = Math.min((n - 1) * maxSpacing, VW - 220);
    const spacing    = usableW / (n - 1);
    const startX     = VW / 2 - usableW / 2;
    states.forEach((s, i) => { pos[s] = { x: startX + i * spacing, y: VH / 2 }; });
  } else {
    // Circle layout for many states
    const cx = VW / 2, cy = VH / 2;
    const r  = Math.min(VW, VH) / 2 - 95;
    states.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      pos[s] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }
  return pos;
}

// Point on circle rim in direction of (toX, toY)
function rim(cx, cy, toX, toY, radius) {
  const dx = toX - cx, dy = toY - cy;
  const d  = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: cx + (dx / d) * radius, y: cy + (dy / d) * radius };
}

// ── SVG marker defs ───────────────────────────────────────────────────────────
function Arrowhead({ id, color }) {
  return (
    <marker id={id} markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 9 3, 0 6" fill={color} />
    </marker>
  );
}

// ── Self-loop ─────────────────────────────────────────────────────────────────
// Draws a cubic-bezier loop that exits top-left of the state, arches high
// above, then re-enters top-right — exactly like a hand-drawn automaton.
function SelfLoop({ stateId, cx, cy, label, color }) {
  const markId = `sl-${stateId}`;

  // Exit / entry: 42° from vertical (top-left / top-right of the circle)
  const ang  = (42 * Math.PI) / 180;
  const sx   = cx - R * Math.sin(ang);   const sy = cy - R * Math.cos(ang);
  const ex   = cx + R * Math.sin(ang);   const ey = cy - R * Math.cos(ang);

  // Control points arching well above the circle
  const lift = R + 70;  // how high above centre
  const wide = 58;      // half-width of the arch
  const c1x  = cx - wide,  c1y = cy - lift;
  const c2x  = cx + wide,  c2y = cy - lift;

  const d = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;

  // Label sits above the loop apex
  const labelY = cy - lift - 20;
  const labelX = cx;
  const lw     = Math.max(32, label.length * 9.5 + 22);

  return (
    <g>
      <defs><Arrowhead id={markId} color={color} /></defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        markerEnd={`url(#${markId})`}
      />
      {/* Label background + text */}
      <rect x={labelX - lw / 2} y={labelY - 11} width={lw} height={22} rx={6}
        fill={COLOR.LABEL_BG} fillOpacity={0.97}
        stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      <text
        x={labelX} y={labelY + 6}
        textAnchor="middle"
        fill={color}
        fontSize="13"
        fontWeight="700"
        fontFamily="'Courier New', monospace">
        {label}
      </text>
    </g>
  );
}

// ── Transition edge between two different states ───────────────────────────────
function TransitionEdge({ from, to, positions, label, color, offsetDir }) {
  const p1 = positions[from];
  const p2 = positions[to];
  if (!p1 || !p2) return null;

  const markId = `e-${from}-${to}`;

  const dx   = p2.x - p1.x,  dy   = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const mx   = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;

  // Perpendicular unit vector
  const px = -dy / dist,  py = dx / dist;

  // Offset: 0 for one-way, ±50 for bidirectional
  const off  = offsetDir === null ? 15 : offsetDir ? 52 : -52;
  const ctrlX = mx + px * off;
  const ctrlY = my + py * off;

  // Points where the arrow exits/enters the circle rims
  const exitPt  = rim(p1.x, p1.y, ctrlX, ctrlY, R + 1);
  const entryPt = rim(p2.x, p2.y, ctrlX, ctrlY, R + 1);

  const d = `M ${exitPt.x} ${exitPt.y} Q ${ctrlX} ${ctrlY} ${entryPt.x} ${entryPt.y}`;

  // Bezier midpoint for label (t=0.5)
  const lx = 0.25 * exitPt.x + 0.5 * ctrlX + 0.25 * entryPt.x;
  const ly = 0.25 * exitPt.y + 0.5 * ctrlY + 0.25 * entryPt.y;
  const lw = Math.max(32, label.length * 9 + 22);

  return (
    <g>
      <defs><Arrowhead id={markId} color={color} /></defs>
      {/* Wide transparent hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth="12" />
      {/* Visible edge */}
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" markerEnd={`url(#${markId})`} />
      {/* Label */}
      <rect x={lx - lw / 2} y={ly - 11} width={lw} height={22}
        rx={6} fill={COLOR.LABEL_BG} fillOpacity={0.97} stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      <text x={lx} y={ly + 6}
        textAnchor="middle" fill={color}
        fontSize="12" fontWeight="700" fontFamily="'Courier New', monospace">
        {label}
      </text>
    </g>
  );
}

// ── State circle ───────────────────────────────────────────────────────────────
function StateCircle({ state, pos, isInitial, isFinal, isHighlighted, output, color }) {
  if (!pos) return null;
  const { x, y } = pos;

  // Choose visual style based on state type
  const outerRingColor = isHighlighted ? COLOR.HI_RING
                       : isFinal       ? COLOR.FINAL_RING
                       : isInitial     ? color
                       : COLOR.NODE_RING;
  const outerRingSW    = isHighlighted ? 4 : isFinal ? 4 : 2.5;
  const nodeFill       = isHighlighted ? COLOR.HI_FILL
                       : isFinal       ? COLOR.FINAL_FILL
                       : COLOR.NODE_FILL;
  const labelColor     = isHighlighted ? COLOR.HI_RING
                       : isFinal       ? COLOR.FINAL_RING
                       : color;

  return (
    <g>
      {/* ── Initial state: horizontal entry arrow ── */}
      {isInitial && (
        <g>
          <defs>
            <marker id={`init-${state}`} markerWidth="10" markerHeight="7"
              refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          </defs>
          <line
            x1={x - R - 55} y1={y} x2={x - R - 1} y2={y}
            stroke={color} strokeWidth="3"
            markerEnd={`url(#init-${state})`}
          />
        </g>
      )}

      {/* ── Glow ring (final = gold, highlighted = cyan) ── */}
      {(isFinal || isHighlighted) && (
        <circle cx={x} cy={y}
          r={R + (isHighlighted ? 16 : 13)}
          fill={isHighlighted ? COLOR.HI_GLOW : COLOR.FINAL_GLOW}
          fillOpacity={isHighlighted ? 0.22 : 0.20}
        />
      )}

      {/* ── Outer circle body ── */}
      <circle cx={x} cy={y} r={R}
        fill={nodeFill}
        stroke={outerRingColor}
        strokeWidth={outerRingSW}
      />

      {/* ── DOUBLE RING for final states ──
           Two concentric gold circles inside the outer circle.
           Made thick and bold so they're always visible. */}
      {isFinal && (
        <>
          {/* Inner gold ring — thick and bright */}
          <circle cx={x} cy={y} r={INNER_R}
            fill="none"
            stroke={COLOR.FINAL_RING}
            strokeWidth="3"
          />
          {/* Second white outline ring just inside it */}
          <circle cx={x} cy={y} r={INNER_R - 3}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        </>
      )}

      {/* ── State label text ── */}
      {output !== undefined ? (
        /* Moore: state name / output */
        <>
          <text x={x} y={y - 8}
            textAnchor="middle"
            fill={labelColor}
            fontSize="12" fontWeight="800" fontFamily="'Inter', sans-serif">
            {state}
          </text>
          <line x1={x - 16} y1={y + 0} x2={x + 16} y2={y + 0}
            stroke={COLOR.DIM} strokeWidth="1" />
          <text x={x} y={y + 17}
            textAnchor="middle"
            fill={COLOR.OUTPUT}
            fontSize="15" fontWeight="700" fontFamily="'Courier New', monospace">
            {output}
          </text>
        </>
      ) : (
        /* Mealy: state name only */
        <text x={x} y={y + 5}
          textAnchor="middle"
          fill={labelColor}
          fontSize="14" fontWeight="800" fontFamily="'Inter', sans-serif">
          {state}
        </text>
      )}
    </g>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MachineGraph({
  machine,
  machineType   = 'MOORE',
  highlightedState = null,
  readOnly      = true,
}) {
  const color = machineType === 'MOORE' ? COLOR.MOORE : COLOR.MEALY;

  // ── Empty state ──
  if (!machine || !machine.states || machine.states.length === 0) {
    return (
      <div style={{
        height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.45)', borderRadius: 16,
        border: '2px dashed rgba(99,102,241,0.25)',
      }}>
        <div style={{ textAlign: 'center', color: '#475569' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>◯</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No machine to display</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Build a machine to see its state diagram</p>
        </div>
      </div>
    );
  }

  const {
    states,
    inputAlphabet = [],
    initialState,
    finalStates   = [],
    outputs       = {},
    transitions   = {},
  } = machine;

  const positions = computeLayout(states);

  // ── Build edge map (merge same source→dest into one label) ──
  const edgeMap = {};
  for (const from of states) {
    for (const sym of inputAlphabet) {
      let to, lbl;
      if (machineType === 'MOORE') {
        to  = transitions[from]?.[sym];
        lbl = sym;
      } else {
        const t = transitions[from]?.[sym];
        if (!t) continue;
        to  = t.nextState;
        lbl = `${sym}/${t.output}`;
      }
      if (!to) continue;
      const key = `${from}|||${to}`;
      if (!edgeMap[key]) edgeMap[key] = { from, to, labels: [] };
      edgeMap[key].labels.push(lbl);
    }
  }

  const selfEdges    = [];
  const normalEdges  = [];

  Object.entries(edgeMap).forEach(([key, { from, to, labels }]) => {
    const label = labels.join(', ');
    if (from === to) {
      selfEdges.push({ stateId: from, label });
    } else {
      const reverseKey = `${to}|||${from}`;
      const hasBidi    = !!edgeMap[reverseKey];
      // For bidirectional pairs: give each a distinct curve direction
      // Use lexicographic key ordering so both directions agree
      const offsetDir  = !hasBidi ? null : (key < reverseKey ? true : false);
      normalEdges.push({ from, to, label, offsetDir });
    }
  });

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      border: '2px solid rgba(99,102,241,0.28)',
      background: 'rgba(10,15,35,0.72)',
    }}>
      {/* Legend */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 10,
        background: 'rgba(10,15,35,0.88)', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#94a3b8',
        backdropFilter: 'blur(6px)', pointerEvents: 'none',
      }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Legend</div>
        <LegendRow color={color} label="State">
          <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="none" stroke={color} strokeWidth="2"/></svg>
        </LegendRow>
        <LegendRow label="Final state">
          <svg width="26" height="26">
            <circle cx="13" cy="13" r="11" fill="#1a1500" stroke="#fbbf24" strokeWidth="3"/>
            <circle cx="13" cy="13" r="7" fill="none" stroke="#fbbf24" strokeWidth="2.5"/>
          </svg>
        </LegendRow>
        <LegendRow color={color} label="Transition">
          <svg width="24" height="14" style={{ overflow: 'visible' }}>
            <line x1="0" y1="7" x2="16" y2="7" stroke={color} strokeWidth="2"/>
            <polygon points="16,4 24,7 16,10" fill={color}/>
          </svg>
        </LegendRow>
        <LegendRow color={color} label="Self-loop">
          <svg width="22" height="18" style={{ overflow: 'visible' }}>
            <path d="M 4 14 C 1 2, 21 2, 18 14" fill="none" stroke={color} strokeWidth="2"/>
            <polygon points="18,11 18,17 22,14" fill={color}/>
          </svg>
        </LegendRow>
        {readOnly && (
          <div style={{ color: '#475569', fontSize: 10, marginTop: 6,
            borderTop: '1px solid #1e293b', paddingTop: 5 }}>
            👁 View only
          </div>
        )}
      </div>

      {/* SVG diagram */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: 440, display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle dot-grid background */}
        <defs>
          <pattern id="grid-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="1.1" fill="rgba(129,140,248,0.15)" />
          </pattern>
        </defs>
        <rect width={VW} height={VH} fill="url(#grid-dots)" />

        {/* ── Transition edges (drawn before nodes so arrows don't cover circles) ── */}
        {normalEdges.map((e, i) => (
          <TransitionEdge key={i} {...e} positions={positions} color={color} />
        ))}

        {/* ── Self-loops ── */}
        {selfEdges.map(e => positions[e.stateId] && (
          <SelfLoop
            key={e.stateId}
            stateId={e.stateId}
            cx={positions[e.stateId].x}
            cy={positions[e.stateId].y}
            label={e.label}
            color={color}
          />
        ))}

        {/* ── State circles (rendered last = on top) ── */}
        {states.map(s => (
          <StateCircle
            key={s}
            state={s}
            pos={positions[s]}
            isInitial={s === initialState}
            isFinal={Array.isArray(finalStates) && finalStates.includes(s)}
            isHighlighted={s === highlightedState}
            output={machineType === 'MOORE' ? (outputs[s] ?? '') : undefined}
            color={color}
          />
        ))}
      </svg>
    </div>
  );
}

// Small helper for legend rows
function LegendRow({ children, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
      <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <span>{label}</span>
    </div>
  );
}
