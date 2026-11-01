import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X, Check, RotateCcw, Download, Sparkles, Sliders, ChevronDown
} from 'lucide-react';
import {
  brushTip, stampDab, drawBrushPreview, resetBrushDef, updateBrushDef,
  type BrushDef
} from './brushes';
import { Button } from '@/components/ui/button';
import { editableBrushCopy } from './brush-edit';
import { exportBrushToApb } from './brush-translator';

// Custom SVG Icons matching Procreate Pocket Brush Studio reference screenshot
function StrokePathIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15c2-4 4-6 7-3s5 5 9 1" />
    </svg>
  );
}

function StabilizationIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M12 7v5l3 3" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TaperIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 19.5c4-3 9-8 16-15-2 6-7 11-16 15Z" />
    </svg>
  );
}

function ShapeIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.6 4.3 4.5-1-1.3 4.4 4.2 1.8-3.4 3 2.7 3.7-4.4.8.4 4.5-4.2-1.7-2.3 3.9-2.3-3.9-4.2 1.7.4-4.5-4.4-.8 2.7-3.7-3.4-3 4.2-1.8-1.3-4.4 4.5 1L12 2Z" />
    </svg>
  );
}

function GrainIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="10" y="3" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="17" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="10" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="10" y="10" width="5" height="5" rx="1" />
      <rect x="17" y="10" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="3" y="17" width="5" height="5" rx="1" />
      <rect x="10" y="17" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="17" y="17" width="5" height="5" rx="1" />
    </svg>
  );
}

function RenderingIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="8" y="4" width="8" height="3.5" rx="1" />
      <rect x="5.5" y="9.5" width="13" height="3.5" rx="1" />
      <rect x="3" y="15" width="18" height="3.5" rx="1" />
    </svg>
  );
}

function WetMixIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c-3.5 5.5-7 9.8-7 13.5a7 7 0 0 0 14 0c0-3.7-3.5-8-7-13.5Z" />
    </svg>
  );
}

function ColorDynamicsIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="17" cy="7" r="2.5" opacity="0.8" />
      <circle cx="19" cy="12" r="2.5" opacity="0.6" />
      <circle cx="17" cy="17" r="2.5" opacity="0.4" />
      <circle cx="12" cy="19" r="2.5" opacity="0.3" />
      <circle cx="7" cy="17" r="2.5" opacity="0.5" />
      <circle cx="5" cy="12" r="2.5" opacity="0.7" />
      <circle cx="7" cy="7" r="2.5" opacity="0.9" />
    </svg>
  );
}

function DynamicsIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 17a9 9 0 1 1 16 0" />
      <path d="M12 12l4-4" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function StylusIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.5 3.5l1 1a1.5 1.5 0 0 1 0 2.1l-10 10-3.5.5.5-3.5 10-10a1.5 1.5 0 0 1 2-.1Z" />
      <path d="M4 21c1.5 0 2.5-.5 3-1.5s0-2-1.5-2-2.5.5-3 1.5.5 2 1.5 2Z" opacity="0.7" />
    </svg>
  );
}

function PropertiesIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3" y="6" width="18" height="2" rx="1" />
      <circle cx="8" cy="7" r="3" />
      <rect x="3" y="16" width="18" height="2" rx="1" />
      <circle cx="16" cy="17" r="3" />
    </svg>
  );
}

function MaterialsIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    </svg>
  );
}

function AboutIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
      <line x1="12" y1="11" x2="12" y2="16" strokeWidth="2.4" />
    </svg>
  );
}

const CATEGORIES = [
  { id: 'stroke', name: 'Stroke properties', label: 'Stroke path', icon: StrokePathIcon },
  { id: 'stabilization', name: 'Stabilization', label: 'Stabilization', icon: StabilizationIcon },
  { id: 'taper', name: 'Taper', label: 'Taper', icon: TaperIcon },
  { id: 'shape', name: 'Shape', label: 'Shape', icon: ShapeIcon },
  { id: 'grain', name: 'Grain', label: 'Grain', icon: GrainIcon },
  { id: 'rendering', name: 'Rendering', label: 'Rendering', icon: RenderingIcon },
  { id: 'wetmix', name: 'Wet Mix', label: 'Wet Mix', icon: WetMixIcon },
  { id: 'colordynamics', name: 'Color dynamics', label: 'Color dynamics', icon: ColorDynamicsIcon },
  { id: 'dynamics', name: 'Dynamics', label: 'Dynamics', icon: DynamicsIcon },
  { id: 'pencil', name: 'Stylus', label: 'Stylus', icon: StylusIcon },
  { id: 'properties', name: 'Properties', label: 'Properties', icon: PropertiesIcon },
  { id: 'materials', name: 'Materials', label: 'Materials', icon: MaterialsIcon },
  { id: 'about', name: 'About this brush', label: 'About this brush', icon: AboutIcon },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

const PAD_COLORS = [
  '#000000', '#ffffff', '#ff3b30', '#ff9500', '#34c759', '#00c7be', '#007aff', '#af52de'
];

export function BrushStudio({
  brush,
  onSave,
  onClose,
}: {
  brush: BrushDef;
  onSave: (updated: BrushDef) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<CategoryId>('stroke');
  const [b, setB] = useState<BrushDef>({ ...brush });
  const [padColor, setPadColor] = useState('#000000');
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [touchMode, setTouchMode] = useState(true);

  // Drawing Pad Canvas
  const padCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokeTravelled = useRef(0);

  // Top stroke preview canvas in sidebar
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const update = useCallback((patch: Partial<BrushDef>) => {
    setB((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
  }, []);

  // Update stroke preview thumbnail
  useEffect(() => {
    if (previewCanvasRef.current) {
      drawBrushPreview(previewCanvasRef.current, b, '#1c1c1e');
    }
  }, [b]);

  // Clear Drawing Pad
  const clearPad = useCallback(() => {
    const cvs = padCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
  }, []);

  // Resize Pad Canvas on mount
  useEffect(() => {
    const cvs = padCanvasRef.current;
    if (!cvs) return;
    const rect = cvs.parentElement?.getBoundingClientRect();
    if (rect) {
      cvs.width = Math.round(rect.width * window.devicePixelRatio);
      cvs.height = Math.round(rect.height * window.devicePixelRatio);
      const ctx = cvs.getContext('2d');
      ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  // Drawing Pad Pointer Handlers
  const handlePadPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cvs = padCanvasRef.current;
    if (!cvs) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const rect = cvs.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPoint.current = { x, y };
    strokeTravelled.current = 0;

    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const tip = brushTip(b, padColor);
    const pressure = touchMode && e.pointerType === 'touch' ? 0.8 : (e.pressure || 0.6);
    const size = b.maxSize * (b.previewSize || 0.5);
    stampDab(ctx, tip, b, { x, y, pressure, travelled: 0 }, size);
  };

  const handlePadPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const cvs = padCanvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const tip = brushTip(b, padColor);
    const p1 = lastPoint.current;
    const dist = Math.hypot(x - p1.x, y - p1.y);
    const size = b.maxSize * (b.previewSize || 0.5);
    const step = Math.max(1, size * (b.spacing || 0.05));
    const pressure = touchMode && e.pointerType === 'touch' ? 0.8 : (e.pressure || 0.6);

    const steps = Math.ceil(dist / step);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const curX = p1.x + (x - p1.x) * t;
      const curY = p1.y + (y - p1.y) * t;
      const dStep = dist / steps;
      strokeTravelled.current += dStep;
      stampDab(ctx, tip, b, {
        x: curX,
        y: curY,
        pressure,
        travelled: strokeTravelled.current,
        dx: x - p1.x,
        dy: y - p1.y,
      }, size);
    }
    lastPoint.current = { x, y };
  };

  const handlePadPointerUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const currentCat = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0];

  // Helper for rendering Procreate-styled slider row
  const renderSlider = (
    label: string,
    val: number,
    min: number,
    max: number,
    onChange: (n: number) => void,
    format: (v: number) => string = (v) => `${Math.round(v)}%`
  ) => {
    return (
      <div className="flex flex-col gap-1.5 py-2.5">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-foreground dark:text-foreground">{label}</span>
          <span className="text-foreground dark:text-foreground font-mono text-xs font-semibold">
            {format(val)}
          </span>
        </div>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={max > 10 ? 1 : 0.01}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-secondary dark:bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>
    );
  };

  // Helper for rendering toggle row
  const renderToggle = (label: string, on: boolean, onChange: (v: boolean) => void) => (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-sm font-medium text-foreground dark:text-foreground">{label}</span>
      <Button variant="paint" size="paint"
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 ${
          on ? 'bg-secondary' : 'bg-secondary dark:bg-secondary'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-secondary shadow-md transform transition-transform ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </Button>
    </div>
  );

  return (
    <div className="ap-brush-studio fixed inset-0 z-[100] bg-secondary dark:bg-background flex flex-row overflow-hidden select-none font-sans text-foreground dark:text-foreground animate-in fade-in duration-200">
      {/* ---------------- Left Vertical Navigation Bar ---------------- */}
      <div className="ap-brush-glass w-16 md:w-20 bg-secondary dark:bg-secondary border-r border-border dark:border-border flex flex-col items-center py-3 overflow-y-auto no-scrollbar shrink-0 z-10">
        {/* Top Stroke Preview Tile with left indicator bar */}
        <div className="ap-brush-control relative mb-3 flex items-center justify-center">
          <div className="w-12 h-14 bg-secondary dark:bg-secondary rounded-xl shadow-sm border border-border dark:border-border overflow-hidden relative flex items-center justify-center p-1">
            <canvas ref={previewCanvasRef} width={80} height={36} className="w-full h-auto object-contain" />
          </div>
          {/* Blue vertical marker */}
          <div className="absolute -left-2 top-2 bottom-2 w-1 bg-secondary rounded-r-full" />
        </div>

        {/* 13 Category Icon Buttons */}
        <div className="flex flex-col gap-2.5 items-center w-full px-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeTab === cat.id;
            return (
              <Button variant="paint" size="paint"
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                title={cat.label}
                aria-label={cat.label}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                  active
                    ? 'bg-secondary text-foreground shadow-sm ring-2 ring-ring'
                    : 'text-foreground dark:text-foreground hover:bg-secondary dark:hover:bg-secondary'
                }`}
              >
                <Icon size={20} />
              </Button>
            );
          })}
        </div>
      </div>

      {/* ---------------- Main Area: Drawing Pad + Settings Panel ---------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* UPPER HALF: Interactive Drawing Pad */}
        <div className="h-[42%] md:h-[46%] w-full bg-secondary dark:bg-secondary relative border-b border-border dark:border-border touch-none">
          <canvas
            ref={padCanvasRef}
            onPointerDown={handlePadPointerDown}
            onPointerMove={handlePadPointerMove}
            onPointerUp={handlePadPointerUp}
            onPointerCancel={handlePadPointerUp}
            className="w-full h-full cursor-crosshair"
          />

          {/* Floating Pill Header Controls (top right) */}
          <div className="ap-brush-glass absolute top-4 right-4 bg-secondary dark:bg-secondary backdrop-blur-md shadow-md rounded-full px-2.5 py-1.5 flex items-center gap-2 border border-border dark:border-border z-20">
            {/* Squiggle button: opens Drawing Pad Settings */}
            <Button variant="paint" size="paint"
              type="button"
              onClick={() => setShowSettingsSheet((v) => !v)}
              className="p-1.5 hover:bg-secondary dark:hover:bg-secondary rounded-full text-foreground dark:text-foreground transition-colors"
              title="Drawing pad settings"
              aria-label="Drawing pad settings"
            >
              <StrokePathIcon size={18} />
            </Button>

            {/* Clear Pad button */}
            <Button variant="paint" size="paint"
              type="button"
              onClick={clearPad}
              className="p-1.5 hover:bg-secondary dark:hover:bg-secondary rounded-full text-foreground dark:text-foreground transition-colors"
              title="Clear drawing pad"
              aria-label="Clear drawing pad"
            >
              <X size={18} />
            </Button>

            {/* Blue circular Checkmark button: saves and exits */}
            <Button variant="paint" size="paint"
              type="button"
              onClick={() => {
                const saved = editableBrushCopy(b);
                onSave(saved);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary text-foreground flex items-center justify-center shadow-sm active:scale-95 transition-all"
              title="Done editing brush"
              aria-label="Done"
            >
              <Check size={18} strokeWidth={2.6} />
            </Button>
          </div>
        </div>

        {/* LOWER HALF: Settings for Active Category */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-secondary dark:bg-secondary">
          <div className="max-w-md mx-auto">
            {/* Top Brush Head & Stroke Preview Card on top of adjusters */}
            <div className="ap-brush-glass mb-4 p-3 rounded-lg bg-secondary dark:bg-secondary backdrop-blur-xl border border-border dark:border-border shadow-sm flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-secondary dark:bg-secondary border border-border dark:border-border flex items-center justify-center p-1 shrink-0 overflow-hidden">
                <canvas
                  ref={(c) => {
                    if (!c) return;
                    const ctx = c.getContext('2d');
                    if (!ctx) return;
                    ctx.clearRect(0, 0, 48, 48);
                    const tip = brushTip(b, padColor, 40);
                    ctx.drawImage(tip, 4, 4, 40, 40);
                  }}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  title="Brush head dab preview"
                />
              </div>
              <div className="flex-1 min-w-0">
                <b className="block text-sm font-bold text-foreground dark:text-foreground truncate">{b.name}</b>
                <span className="text-xs text-foreground dark:text-foreground font-medium">{b.category || 'General'} • {Math.round(b.maxSize)}px</span>
              </div>
              <div className="w-24 h-10 rounded-lg bg-secondary dark:bg-secondary overflow-hidden flex items-center justify-center p-0.5">
                <canvas
                  ref={(c) => {
                    if (c) drawBrushPreview(c, b, padColor);
                  }}
                  width={96}
                  height={40}
                  className="w-full h-full object-contain"
                  title="Stroke preview"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-foreground mb-4">
              {currentCat.name}
            </h2>

            {/* 1. Stroke properties */}
            {activeTab === 'stroke' && (
              <div className="space-y-1">
                {renderSlider('Spacing', (b.spacing || 0.05) * 100, 1, 100, (v) => update({ spacing: v / 100 }), (v) => `${Math.round(v)}%`)}
                {renderSlider('Spacing Jitter', (b.spacingJitter || 0) * 100, 0, 100, (v) => update({ spacingJitter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Jitter Lateral', (b.jitterLateral || 0) * 100, 0, 100, (v) => update({ jitterLateral: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Jitter Linear', (b.jitterLinear || 0) * 100, 0, 100, (v) => update({ jitterLinear: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Fall off', (b.falloff || 0) * 100, 0, 100, (v) => update({ falloff: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('StreamLine', b.streamline ?? 30, 0, 100, (v) => update({ streamline: v }))}
              </div>
            )}

            {/* 2. Stabilization */}
            {activeTab === 'stabilization' && (
              <div className="space-y-1">
                {renderSlider('StreamLine Amount', b.streamline ?? 30, 0, 100, (v) => update({ streamline: v }))}
                {renderSlider('Stabilization', b.stabilization ?? 0, 0, 100, (v) => update({ stabilization: v }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Motion Filtering', b.motionFiltering ?? 0, 0, 100, (v) => update({ motionFiltering: v }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 3. Taper */}
            {activeTab === 'taper' && (
              <div className="space-y-1">
                {renderSlider('Pressure Taper', (b.pressureTaper || 0) * 100, 0, 100, (v) => update({ pressureTaper: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Touch Taper', (b.touchTaper || 0) * 100, 0, 100, (v) => update({ touchTaper: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Size', (b.taperSize ?? 0.5) * 100, 0, 100, (v) => update({ taperSize: v / 100 }))}
                {renderSlider('Opacity', (b.taperOpacity ?? 0.8) * 100, 0, 100, (v) => update({ taperOpacity: v / 100 }))}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm font-medium">Tip</span>
                  <div className="flex bg-secondary dark:bg-secondary p-0.5 rounded-lg">
                    <Button variant="paint" size="paint"
                      type="button"
                      onClick={() => update({ taperTip: 'round' })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        b.taperTip !== 'sharp' ? 'bg-secondary dark:bg-secondary shadow-sm' : ''
                      }`}
                    >
                      Round
                    </Button>
                    <Button variant="paint" size="paint"
                      type="button"
                      onClick={() => update({ taperTip: 'sharp' })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        b.taperTip === 'sharp' ? 'bg-secondary dark:bg-secondary shadow-sm' : ''
                      }`}
                    >
                      Sharp
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Shape */}
            {activeTab === 'shape' && (
              <div className="space-y-1">
                {renderSlider('Scatter', (b.shapeScatter ?? b.scatter ?? 0) * 100, 0, 100, (v) => update({ shapeScatter: v / 100, scatter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Rotation', b.angle ?? 0, -180, 180, (v) => update({ angle: v, shapeRotation: v }), (v) => `${Math.round(v)}°`)}
                {renderSlider('Count', b.shapeCount ?? 1, 1, 16, (v) => update({ shapeCount: Math.round(v) }), (v) => `${Math.round(v)}`)}
                {renderSlider('Count Jitter', (b.shapeCountJitter ?? 0) * 100, 0, 100, (v) => update({ shapeCountJitter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderToggle('Follow stroke', Boolean(b.shapeFollowStroke), (v) => update({ shapeFollowStroke: v }))}
                {renderToggle('Randomized', Boolean(b.rotateRandom || b.shapeRandomized), (v) => update({ rotateRandom: v, shapeRandomized: v }))}
              </div>
            )}

            {/* 5. Grain */}
            {activeTab === 'grain' && (
              <div className="space-y-1">
                {renderSlider('Grain', (b.grain ?? 0) * 100, 0, 100, (v) => update({ grain: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Scale', (b.grainScale ?? 1) * 100, 10, 200, (v) => update({ grainScale: v / 100 }))}
                {renderSlider('Zoom', (b.grainZoom ?? 0.5) * 100, 0, 100, (v) => update({ grainZoom: v / 100 }))}
                {renderSlider('Depth', (b.grainDepth ?? 0.5) * 100, 0, 100, (v) => update({ grainDepth: v / 100 }))}
              </div>
            )}

            {/* 6. Rendering */}
            {activeTab === 'rendering' && (
              <div className="space-y-1">
                <div className="py-2.5">
                  <span className="text-sm font-medium block mb-2">Rendering Mode</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['light-glaze', 'glaze', 'blending', 'intense-blending'] as const).map((m) => (
                      <Button variant="paint" size="paint"
                        key={m}
                        type="button"
                        onClick={() => update({ renderMode: m })}
                        className={`py-2 px-3 rounded-lg border text-center font-medium capitalize ${
                          b.renderMode === m
                            ? 'bg-secondary text-foreground border-border'
                            : 'bg-secondary dark:bg-secondary border-border dark:border-border'
                        }`}
                      >
                        {m.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
                {renderSlider('Flow', (b.flow ?? 0.9) * 100, 1, 100, (v) => update({ flow: v / 100 }))}
                {renderSlider('Wet Edges', (b.wetEdges ?? 0) * 100, 0, 100, (v) => update({ wetEdges: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Burnt Edges', (b.burntEdges ?? 0) * 100, 0, 100, (v) => update({ burntEdges: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 7. Wet Mix */}
            {activeTab === 'wetmix' && (
              <div className="space-y-1">
                {renderSlider('Dilution', (b.dilution ?? 0) * 100, 0, 100, (v) => update({ dilution: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Charge', (b.charge ?? 1) * 100, 0, 100, (v) => update({ charge: v / 100 }))}
                {renderSlider('Attack', (b.attack ?? 0.8) * 100, 0, 100, (v) => update({ attack: v / 100 }))}
                {renderSlider('Pull', (b.pull ?? b.smudge ?? 0.5) * 100, 0, 100, (v) => update({ pull: v / 100, smudge: v / 100 }))}
                {renderSlider('Grade', (b.grade ?? 0.5) * 100, 0, 100, (v) => update({ grade: v / 100 }))}
              </div>
            )}

            {/* 8. Color dynamics */}
            {activeTab === 'colordynamics' && (
              <div className="space-y-1">
                {renderSlider('Stamp Color Jitter', (b.stampColorJitter ?? 0) * 100, 0, 100, (v) => update({ stampColorJitter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Stroke Color Jitter', (b.strokeColorJitter ?? 0) * 100, 0, 100, (v) => update({ strokeColorJitter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Color Pressure', (b.colorPressure ?? 0) * 100, 0, 100, (v) => update({ colorPressure: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 9. Dynamics */}
            {activeTab === 'dynamics' && (
              <div className="space-y-1">
                {renderSlider('Speed Size', (b.speedSize ?? 0) * 100, -100, 100, (v) => update({ speedSize: v / 100 }))}
                {renderSlider('Speed Opacity', (b.speedOpacity ?? 0) * 100, -100, 100, (v) => update({ speedOpacity: v / 100 }))}
                {renderSlider('Jitter Size', (b.jitter ?? 0) * 100, 0, 100, (v) => update({ jitter: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Jitter Opacity', (b.jitterOpacity ?? 0) * 100, 0, 100, (v) => update({ jitterOpacity: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 10. Apple Pencil / Stylus */}
            {activeTab === 'pencil' && (
              <div className="space-y-1">
                {renderSlider('Pressure Size', (b.sizePressure ?? 0.6) * 100, 0, 100, (v) => update({ sizePressure: v / 100 }))}
                {renderSlider('Pressure Opacity', (b.opacityPressure ?? 0) * 100, 0, 100, (v) => update({ opacityPressure: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Pressure Bleed', (b.pressureBleed ?? 0) * 100, 0, 100, (v) => update({ pressureBleed: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Tilt Angle', b.tiltAngle ?? 0, 0, 90, (v) => update({ tiltAngle: v }), (v) => `${Math.round(v)}°`)}
                {renderSlider('Tilt Size', (b.tiltSize ?? 0) * 100, 0, 200, (v) => update({ tiltSize: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 11. Properties */}
            {activeTab === 'properties' && (
              <div className="space-y-1">
                {renderToggle('Stamp preview', Boolean(b.useStampPreview), (v) => update({ useStampPreview: v }))}
                {renderToggle('Orient to screen', Boolean(b.orientToScreen), (v) => update({ orientToScreen: v }))}
                {renderSlider('Preview size', (b.previewSize ?? 0.5) * 100, 10, 100, (v) => update({ previewSize: v / 100 }))}
                {renderSlider('Maximum Size', b.maxSize, 10, 500, (v) => update({ maxSize: v }), (v) => `${Math.round(v)}px`)}
                {renderSlider('Minimum Size', b.minSize ?? 2, 1, 50, (v) => update({ minSize: v }), (v) => `${Math.round(v)}px`)}
                {renderSlider('Maximum Opacity', (b.maxOpacity ?? 1) * 100, 10, 100, (v) => update({ maxOpacity: v / 100 }))}
                {renderSlider('Minimum Opacity', (b.minOpacity ?? 0) * 100, 0, 50, (v) => update({ minOpacity: v / 100 }))}
              </div>
            )}

            {/* 12. Materials */}
            {activeTab === 'materials' && (
              <div className="space-y-1">
                {renderSlider('Metallic', (b.metallic ?? 0) * 100, 0, 100, (v) => update({ metallic: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
                {renderSlider('Roughness', (b.roughness ?? 0) * 100, 0, 100, (v) => update({ roughness: v / 100 }), (v) => v === 0 ? 'None' : `${Math.round(v)}%`)}
              </div>
            )}

            {/* 13. About this brush */}
            {activeTab === 'about' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                    Brush Name
                  </label>
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary dark:bg-secondary border border-border dark:border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                    Made By
                  </label>
                  <input
                    type="text"
                    value={b.author || ''}
                    placeholder="Artist / Creator"
                    onChange={(e) => update({ author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary dark:bg-secondary border border-border dark:border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button variant="paint" size="paint"
                    type="button"
                    onClick={() => exportBrushToApb(b)}
                    className="w-full py-3 px-4 rounded-xl bg-secondary text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary active:scale-98 transition-all shadow-sm"
                  >
                    <Download size={18} />
                    Export as .apb file
                  </Button>

                  <Button variant="paint" size="paint"
                    type="button"
                    onClick={() => {
                      const restored = resetBrushDef(b.id);
                      if (restored) setB(restored);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-secondary dark:bg-secondary text-foreground dark:text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary dark:hover:bg-secondary active:scale-98 transition-all"
                  >
                    <RotateCcw size={18} />
                    Reset to default settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Drawing Pad Settings Bottom Sheet (Reference Screenshot 3) ---------------- */}
      {showSettingsSheet && (
        <div className="ap-brush-studio fixed inset-0 z-[100] flex items-end justify-center bg-secondary backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-secondary dark:bg-secondary rounded-t-3xl p-6 shadow-2xl border-t border-border dark:border-border flex flex-col gap-5 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-secondary dark:bg-secondary rounded-full mx-auto -mt-2" />

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Drawing Pad Settings</h3>
              <Button variant="paint" size="paint"
                type="button"
                onClick={() => setShowSettingsSheet(false)}
                className="p-1 rounded-full text-foreground hover:bg-secondary dark:hover:bg-secondary"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Preview size slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Preview size</span>
                <span className="text-foreground font-mono text-xs">
                  {Math.round((b.previewSize || 0.5) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round((b.previewSize || 0.5) * 100)}
                onChange={(e) => update({ previewSize: Number(e.target.value) / 100 })}
                className="w-full h-1 bg-secondary dark:bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Color swatches */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Drawing Pad Color
              </span>
              <div className="flex items-center justify-between gap-2 py-1">
                {PAD_COLORS.map((c) => (
                  <Button variant="paint" size="paint"
                    key={c}
                    type="button"
                    onClick={() => setPadColor(c)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
                      padColor === c ? 'border-border scale-110 shadow-md' : 'border-border dark:border-border'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="paint" size="paint"
                type="button"
                onClick={() => setTouchMode((v) => !v)}
                className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                  touchMode
                    ? 'bg-secondary text-foreground dark:bg-secondary font-semibold'
                    : 'bg-secondary dark:bg-secondary text-foreground dark:text-foreground'
                }`}
              >
                Touch Simulation: {touchMode ? 'Active (Pressure curve)' : 'Stylus Only'}
              </Button>

              <Button variant="paint" size="paint"
                type="button"
                onClick={() => {
                  clearPad();
                  setShowSettingsSheet(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-secondary dark:bg-secondary hover:bg-secondary dark:hover:bg-secondary font-medium text-sm text-foreground dark:text-foreground transition-colors"
              >
                Clear drawing pad
              </Button>

              <Button variant="paint" size="paint"
                type="button"
                onClick={() => {
                  const restored = resetBrushDef(b.id);
                  if (restored) setB(restored);
                  clearPad();
                }}
                className="w-full py-3 px-4 rounded-xl bg-secondary dark:bg-secondary text-foreground dark:text-foreground font-medium text-sm hover:bg-secondary dark:hover:bg-secondary transition-colors"
              >
                Reset all brush settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
