// ─── Category-Specific Question Schemas ────────────────────────────────────────
// Each category has 3–5 targeted questions that capture what actually matters
// for that type of purchase. Add new categories here — no other file needs changing.

import type { CategoryQuestionSet, QuestionDefinition } from "@/lib/types/questions";

// ─── Reusable question fragments ───────────────────────────────────────────────

function budgetQ(
  id: string,
  min: number,
  max: number,
  step: number,
  stops: { value: number; label: string }[]
): QuestionDefinition {
  return {
    id,
    type: "range",
    prompt: "What's your budget?",
    preferenceKey: "budget",
    range: { min, max, step, minLabel: `$${min}`, maxLabel: `$${max}+`, stops, prefix: "$" },
  };
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

export const QUESTION_SCHEMAS: CategoryQuestionSet[] = [

  // ── Headphones ──────────────────────────────────────────────────────────────
  {
    category: "Headphones",
    questions: [
      {
        id: "headphones-connectivity",
        type: "binary",
        prompt: "Wireless or wired?",
        preferenceKey: "connectivity",
        options: [
          { id: "wireless", label: "Wireless", icon: "📶", description: "Bluetooth freedom" },
          { id: "wired", label: "Wired", icon: "🔌", description: "Zero latency, no charging" },
        ],
      },
      {
        id: "headphones-usecase",
        type: "single-select",
        prompt: "What are these mainly for?",
        preferenceKey: "useCase",
        options: [
          { id: "commuting", label: "Commuting / Travel", icon: "✈️", description: "Noise cancellation matters most" },
          { id: "wfh", label: "Work from Home", icon: "💻", description: "Comfort for long hours + mic" },
          { id: "gym", label: "Working Out", icon: "🏃", description: "Secure fit, sweat resistant" },
          { id: "gaming", label: "Gaming", icon: "🎮", description: "Surround sound & low latency" },
          { id: "studio", label: "Music / Studio", icon: "🎵", description: "Accurate sound reproduction" },
        ],
      },
      budgetQ("headphones-budget", 30, 500, 10, [
        { value: 30, label: "$30" },
        { value: 80, label: "$80" },
        { value: 150, label: "$150" },
        { value: 300, label: "$300" },
        { value: 500, label: "$500" },
      ]),
      {
        id: "headphones-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "anc", label: "Noise cancellation", icon: "🤫" },
          { id: "soundq", label: "Sound quality", icon: "🎼" },
          { id: "comfort", label: "All-day comfort", icon: "😌" },
          { id: "battery", label: "Battery life", icon: "🔋" },
          { id: "mic", label: "Microphone quality", icon: "🎤" },
          { id: "durability", label: "Durability", icon: "💪" },
        ],
      },
      {
        id: "headphones-formfactor",
        type: "single-select",
        prompt: "Preferred form factor?",
        preferenceKey: "formFactor",
        options: [
          { id: "over-ear", label: "Over-ear", icon: "🎧", description: "Best sound isolation & bass" },
          { id: "on-ear", label: "On-ear", icon: "🎧", description: "Lighter, more portable" },
          { id: "in-ear", label: "In-ear / Earbuds", icon: "🎵", description: "Most compact, easy carry" },
        ],
      },
    ],
  },

  // ── Camera ──────────────────────────────────────────────────────────────────
  {
    category: "Camera",
    questions: [
      {
        id: "camera-subject",
        type: "single-select",
        prompt: "What will you mainly shoot?",
        preferenceKey: "shootingType",
        options: [
          { id: "travel", label: "Travel & Everyday", icon: "🌍", description: "Versatile, easy to carry" },
          { id: "portrait", label: "People & Portraits", icon: "🧑‍🎨", description: "Bokeh, fast autofocus" },
          { id: "action", label: "Sports & Action", icon: "⚡", description: "Burst speed, tracking AF" },
          { id: "video", label: "Video & Vlogging", icon: "🎬", description: "4K/6K, stabilization, mic input" },
          { id: "landscape", label: "Landscape & Nature", icon: "🌄", description: "Resolution, dynamic range" },
        ],
      },
      {
        id: "camera-skill",
        type: "single-select",
        prompt: "Your experience level?",
        preferenceKey: "skillLevel",
        options: [
          { id: "beginner", label: "Beginner", icon: "🌱", description: "Auto modes, easy to learn" },
          { id: "intermediate", label: "Intermediate", icon: "📸", description: "Manual control, growing skills" },
          { id: "advanced", label: "Advanced / Pro", icon: "🏆", description: "Full manual, professional output" },
        ],
      },
      budgetQ("camera-budget", 300, 3000, 50, [
        { value: 300, label: "$300" },
        { value: 700, label: "$700" },
        { value: 1200, label: "$1,200" },
        { value: 2000, label: "$2,000" },
        { value: 3000, label: "$3,000" },
      ]),
      {
        id: "camera-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "image-quality", label: "Image / sensor quality", icon: "🖼️" },
          { id: "autofocus", label: "Fast autofocus", icon: "🎯" },
          { id: "video", label: "Video capability", icon: "🎥" },
          { id: "size", label: "Compact & portable", icon: "🎒" },
          { id: "lens-eco", label: "Lens ecosystem", icon: "🔭" },
          { id: "stabilization", label: "Built-in stabilization", icon: "🛡️" },
          { id: "weather", label: "Weather sealing", icon: "🌧️" },
        ],
      },
    ],
  },

  // ── TV ───────────────────────────────────────────────────────────────────────
  {
    category: "TV",
    questions: [
      {
        id: "tv-size",
        type: "range",
        prompt: "What screen size?",
        preferenceKey: "screenSize",
        range: {
          min: 43, max: 85, step: 1,
          minLabel: "43\"", maxLabel: "85\"",
          unit: "\"",
          stops: [
            { value: 43, label: "43\"" },
            { value: 55, label: "55\"" },
            { value: 65, label: "65\"" },
            { value: 75, label: "75\"" },
            { value: 85, label: "85\"" },
          ],
        },
      },
      {
        id: "tv-usecase",
        type: "single-select",
        prompt: "Primary use?",
        preferenceKey: "useCase",
        options: [
          { id: "movies", label: "Movies & Streaming", icon: "🎬", description: "HDR, OLED black levels" },
          { id: "gaming", label: "Gaming", icon: "🎮", description: "120Hz, VRR, low input lag" },
          { id: "sports", label: "Sports & Live TV", icon: "⚽", description: "Motion clarity, brightness" },
          { id: "mixed", label: "All-around / Mixed", icon: "📺", description: "Balanced performer" },
        ],
      },
      budgetQ("tv-budget", 300, 3000, 50, [
        { value: 300, label: "$300" },
        { value: 600, label: "$600" },
        { value: 1000, label: "$1k" },
        { value: 1500, label: "$1.5k" },
        { value: 3000, label: "$3k" },
      ]),
      {
        id: "tv-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "picture", label: "Picture quality / HDR", icon: "✨" },
          { id: "gaming-features", label: "Gaming features (120Hz, VRR)", icon: "🎮" },
          { id: "smart-os", label: "Smart TV apps (Netflix, etc.)", icon: "📱" },
          { id: "brightness", label: "Brightness (bright rooms)", icon: "☀️" },
          { id: "sound", label: "Built-in sound quality", icon: "🔊" },
          { id: "thin", label: "Thin / wall-mount friendly", icon: "🖼️" },
        ],
      },
    ],
  },

  // ── Monitor ──────────────────────────────────────────────────────────────────
  {
    category: "Monitor",
    questions: [
      {
        id: "monitor-usecase",
        type: "single-select",
        prompt: "What's this monitor for?",
        preferenceKey: "useCase",
        options: [
          { id: "gaming", label: "Gaming", icon: "🎮", description: "High refresh rate, low latency" },
          { id: "creative", label: "Photo / Video editing", icon: "🎨", description: "Color accuracy, high resolution" },
          { id: "coding", label: "Programming / Office", icon: "💻", description: "Screen real estate, comfort" },
          { id: "mixed", label: "General / Mixed use", icon: "🖥️", description: "Balanced for everything" },
        ],
      },
      budgetQ("monitor-budget", 150, 1200, 25, [
        { value: 150, label: "$150" },
        { value: 300, label: "$300" },
        { value: 500, label: "$500" },
        { value: 800, label: "$800" },
        { value: 1200, label: "$1,200" },
      ]),
      {
        id: "monitor-shape",
        type: "binary",
        prompt: "Ultrawide or standard?",
        preferenceKey: "aspectRatio",
        options: [
          { id: "standard", label: "Standard", icon: "⬜", description: "16:9 — universal, most content" },
          { id: "ultrawide", label: "Ultrawide", icon: "⬛", description: "21:9+ — more screen space" },
        ],
      },
      {
        id: "monitor-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "hz", label: "High refresh rate (144Hz+)", icon: "⚡" },
          { id: "color", label: "Color accuracy (IPS/OLED)", icon: "🎨" },
          { id: "4k", label: "4K resolution", icon: "🔍" },
          { id: "response", label: "Fast response time", icon: "🏎️" },
          { id: "usbc", label: "USB-C / hub", icon: "🔌" },
          { id: "ergonomics", label: "Adjustable stand", icon: "🔧" },
        ],
      },
    ],
  },

  // ── Smartphone ───────────────────────────────────────────────────────────────
  {
    category: "Smartphone",
    questions: [
      {
        id: "phone-ecosystem",
        type: "single-select",
        prompt: "iPhone or Android?",
        preferenceKey: "ecosystem",
        options: [
          { id: "ios", label: "iPhone / iOS", icon: "🍎", description: "Tight ecosystem, long support" },
          { id: "android", label: "Android", icon: "🤖", description: "More choice, customizable" },
          { id: "any", label: "No preference", icon: "🤷", description: "Recommend the best overall" },
        ],
      },
      {
        id: "phone-priority",
        type: "single-select",
        prompt: "What matters most to you?",
        preferenceKey: "topPriority",
        options: [
          { id: "camera", label: "Best camera", icon: "📸", description: "Low light, video, zoom" },
          { id: "battery", label: "Battery life", icon: "🔋", description: "All-day and then some" },
          { id: "performance", label: "Speed & gaming", icon: "⚡", description: "Fastest chip, smooth gaming" },
          { id: "value", label: "Best value", icon: "💰", description: "Most features per dollar" },
          { id: "compact", label: "Small & lightweight", icon: "🤏", description: "Easier to use one-handed" },
        ],
      },
      budgetQ("phone-budget", 200, 1300, 50, [
        { value: 200, label: "$200" },
        { value: 400, label: "$400" },
        { value: 600, label: "$600" },
        { value: 800, label: "$800" },
        { value: 1000, label: "$1k" },
        { value: 1300, label: "$1,300" },
      ]),
      {
        id: "phone-features",
        type: "multi-select",
        prompt: "Any must-have features?",
        subPrompt: "Pick up to 3",
        preferenceKey: "features",
        maxSelections: 3,
        options: [
          { id: "5g", label: "5G", icon: "📶" },
          { id: "wireless-charge", label: "Wireless charging", icon: "🔋" },
          { id: "water", label: "Water resistance (IP67+)", icon: "💧" },
          { id: "storage", label: "Expandable storage", icon: "💾" },
          { id: "foldable", label: "Foldable screen", icon: "📱" },
          { id: "stylus", label: "Stylus / S-Pen", icon: "✏️" },
        ],
      },
    ],
  },

  // ── GPU ───────────────────────────────────────────────────────────────────────
  {
    category: "GPU",
    questions: [
      {
        id: "gpu-usecase",
        type: "single-select",
        prompt: "What's the main use?",
        preferenceKey: "useCase",
        options: [
          { id: "gaming-1080", label: "Gaming at 1080p", icon: "🎮", description: "High fps, budget friendly" },
          { id: "gaming-1440", label: "Gaming at 1440p", icon: "🖥️", description: "Sweet spot performance" },
          { id: "gaming-4k", label: "Gaming at 4K", icon: "✨", description: "Top-tier, max settings" },
          { id: "creative", label: "Video editing / 3D", icon: "🎬", description: "VRAM & compute power" },
          { id: "ai", label: "AI / Machine learning", icon: "🤖", description: "CUDA/tensor cores, VRAM" },
        ],
      },
      budgetQ("gpu-budget", 150, 1400, 50, [
        { value: 150, label: "$150" },
        { value: 300, label: "$300" },
        { value: 500, label: "$500" },
        { value: 800, label: "$800" },
        { value: 1400, label: "$1,400" },
      ]),
      {
        id: "gpu-brand",
        type: "single-select",
        prompt: "Brand preference?",
        preferenceKey: "brand",
        options: [
          { id: "nvidia", label: "NVIDIA", icon: "💚", description: "DLSS, ray tracing, CUDA" },
          { id: "amd", label: "AMD", icon: "🔴", description: "FSR, open-source drivers" },
          { id: "any", label: "No preference", icon: "🤷", description: "Best value for my use case" },
        ],
      },
      {
        id: "gpu-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "ray-tracing", label: "Ray tracing", icon: "💡" },
          { id: "vram", label: "More VRAM (12GB+)", icon: "💾" },
          { id: "efficiency", label: "Power efficiency", icon: "🌿" },
          { id: "quiet", label: "Quiet cooling", icon: "🤫" },
          { id: "upscaling", label: "DLSS / FSR upscaling", icon: "🔭" },
          { id: "sfff", label: "Small form factor", icon: "📦" },
        ],
      },
    ],
  },

  // ── Laptop ───────────────────────────────────────────────────────────────────
  {
    category: "Laptop",
    questions: [
      {
        id: "laptop-usecase",
        type: "single-select",
        prompt: "What's this laptop for?",
        preferenceKey: "useCase",
        options: [
          { id: "student", label: "Student / School", icon: "📚", description: "Portable, long battery, affordable" },
          { id: "office", label: "Office / Business", icon: "💼", description: "Reliability, keyboard, display" },
          { id: "creative", label: "Creative work", icon: "🎨", description: "Photo/video editing, color accuracy" },
          { id: "gaming", label: "Gaming", icon: "🎮", description: "Dedicated GPU, high refresh" },
          { id: "dev", label: "Software development", icon: "💻", description: "RAM, fast storage, build speed" },
        ],
      },
      budgetQ("laptop-budget", 400, 3000, 50, [
        { value: 400, label: "$400" },
        { value: 700, label: "$700" },
        { value: 1200, label: "$1.2k" },
        { value: 1800, label: "$1.8k" },
        { value: 3000, label: "$3k" },
      ]),
      {
        id: "laptop-tradeoff",
        type: "binary",
        prompt: "What's more important?",
        preferenceKey: "tradeoff",
        options: [
          { id: "portability", label: "Portability", icon: "🎒", description: "Thin, light, all-day battery" },
          { id: "performance", label: "Performance", icon: "⚡", description: "Faster chip, better cooling" },
        ],
      },
      {
        id: "laptop-size",
        type: "single-select",
        prompt: "Preferred screen size?",
        preferenceKey: "screenSize",
        options: [
          { id: "13", label: "13\" — Ultraportable", icon: "🤏", description: "Under 3 lbs, fits anywhere" },
          { id: "14", label: "14\" — Balanced", icon: "⚖️", description: "Best portability + screen combo" },
          { id: "15", label: "15\" — Workhorse", icon: "💪", description: "More screen, numpad options" },
          { id: "16plus", label: "16\"+ — Desktop replacement", icon: "🖥️", description: "Max screen, stays at desk" },
        ],
      },
      {
        id: "laptop-musthaves",
        type: "multi-select",
        prompt: "Any must-haves?",
        subPrompt: "Pick up to 3",
        preferenceKey: "mustHaves",
        maxSelections: 3,
        options: [
          { id: "battery", label: "Long battery (10h+)", icon: "🔋" },
          { id: "oled", label: "OLED display", icon: "✨" },
          { id: "backlit", label: "Backlit keyboard", icon: "⌨️" },
          { id: "touchscreen", label: "Touchscreen", icon: "👆" },
          { id: "light", label: "Lightweight (<3 lbs)", icon: "🪶" },
          { id: "thunderbolt", label: "Thunderbolt / USB-C", icon: "⚡" },
        ],
      },
    ],
  },

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  {
    category: "Keyboard",
    questions: [
      {
        id: "keyboard-type",
        type: "binary",
        prompt: "Mechanical or low-profile?",
        preferenceKey: "switchCategory",
        options: [
          { id: "mechanical", label: "Mechanical", icon: "⌨️", description: "Tactile, satisfying, customizable" },
          { id: "membrane", label: "Low-profile / Membrane", icon: "💻", description: "Quieter, slimmer, laptop-like" },
        ],
      },
      {
        id: "keyboard-usecase",
        type: "single-select",
        prompt: "Primary use?",
        preferenceKey: "useCase",
        options: [
          { id: "gaming", label: "Gaming", icon: "🎮", description: "Anti-ghosting, fast actuation" },
          { id: "typing", label: "Typing / Office", icon: "📝", description: "Comfort, sound, ergonomics" },
          { id: "programming", label: "Programming", icon: "💻", description: "Precision, quiet, layout" },
          { id: "mixed", label: "Gaming + Typing", icon: "🔀", description: "Versatile all-rounder" },
        ],
      },
      {
        id: "keyboard-layout",
        type: "single-select",
        prompt: "Size / layout?",
        preferenceKey: "layout",
        options: [
          { id: "full", label: "Full size (100%)", icon: "⬛", description: "Numpad + all keys" },
          { id: "tkl", label: "TKL (80%)", icon: "🔲", description: "No numpad, more desk space" },
          { id: "75", label: "75%", icon: "◾", description: "Compact with arrows & nav keys" },
          { id: "65", label: "65% or 60%", icon: "▪️", description: "Ultra-compact, minimal" },
        ],
      },
      {
        id: "keyboard-features",
        type: "multi-select",
        prompt: "Important features?",
        subPrompt: "Pick up to 3",
        preferenceKey: "features",
        maxSelections: 3,
        options: [
          { id: "wireless", label: "Wireless / Bluetooth", icon: "📶" },
          { id: "rgb", label: "RGB lighting", icon: "🌈" },
          { id: "hotswap", label: "Hot-swappable switches", icon: "🔧" },
          { id: "quiet", label: "Quiet / silent switches", icon: "🤫" },
          { id: "macro", label: "Macro keys", icon: "⚡" },
          { id: "wrist-rest", label: "Included wrist rest", icon: "🖐️" },
        ],
      },
    ],
  },

  // ── Mouse ─────────────────────────────────────────────────────────────────────
  {
    category: "Mouse",
    questions: [
      {
        id: "mouse-usecase",
        type: "single-select",
        prompt: "Primary use?",
        preferenceKey: "useCase",
        options: [
          { id: "fps", label: "FPS / Competitive gaming", icon: "🎯", description: "Lightweight, precision sensor" },
          { id: "mmo", label: "MMO / Strategy gaming", icon: "🎮", description: "Many buttons, comfort" },
          { id: "office", label: "Office / Productivity", icon: "💼", description: "Ergonomics, scroll, silent" },
          { id: "creative", label: "Design / Creative", icon: "🎨", description: "Precision, adjustable DPI" },
        ],
      },
      {
        id: "mouse-connectivity",
        type: "binary",
        prompt: "Wireless or wired?",
        preferenceKey: "connectivity",
        options: [
          { id: "wireless", label: "Wireless", icon: "📶", description: "Clean desk, freedom of movement" },
          { id: "wired", label: "Wired", icon: "🔌", description: "Zero latency, no charging" },
        ],
      },
      {
        id: "mouse-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "lightweight", label: "Lightweight (<70g)", icon: "🪶" },
          { id: "ergonomic", label: "Ergonomic shape", icon: "🖐️" },
          { id: "buttons", label: "Extra buttons / programmable", icon: "⚡" },
          { id: "battery", label: "Long battery life", icon: "🔋" },
          { id: "silent", label: "Silent clicks", icon: "🤫" },
          { id: "big", label: "Large mouse (palm grip)", icon: "✋" },
        ],
      },
    ],
  },

  // ── Speaker ───────────────────────────────────────────────────────────────────
  {
    category: "Speaker",
    questions: [
      {
        id: "speaker-type",
        type: "single-select",
        prompt: "What type of speaker?",
        preferenceKey: "speakerType",
        options: [
          { id: "portable", label: "Portable Bluetooth", icon: "🎵", description: "Outdoor & on the go" },
          { id: "desktop", label: "Desktop / Computer", icon: "🖥️", description: "Near-field listening" },
          { id: "bookshelf", label: "Bookshelf / Hi-Fi", icon: "📻", description: "Room-filling audiophile sound" },
          { id: "soundbar", label: "Soundbar / Home theater", icon: "📺", description: "TV audio upgrade" },
        ],
      },
      budgetQ("speaker-budget", 30, 600, 10, [
        { value: 30, label: "$30" },
        { value: 80, label: "$80" },
        { value: 150, label: "$150" },
        { value: 300, label: "$300" },
        { value: 600, label: "$600" },
      ]),
      {
        id: "speaker-tradeoff",
        type: "binary",
        prompt: "What's the priority?",
        preferenceKey: "tradeoff",
        options: [
          { id: "portable", label: "Portability", icon: "🎒", description: "Easy to move, waterproof" },
          { id: "quality", label: "Sound quality", icon: "🎼", description: "Richer, more detailed audio" },
        ],
      },
      {
        id: "speaker-priorities",
        type: "multi-select",
        prompt: "What matters?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "bass", label: "Strong bass", icon: "🔊" },
          { id: "waterproof", label: "Waterproof (IPX7+)", icon: "💧" },
          { id: "battery", label: "Long battery (20h+)", icon: "🔋" },
          { id: "multi-room", label: "Multi-room pairing", icon: "🏠" },
          { id: "assistant", label: "Voice assistant built-in", icon: "🎙️" },
          { id: "stereo-pair", label: "Stereo pair support", icon: "🎶" },
        ],
      },
    ],
  },

  // ── Tablet ────────────────────────────────────────────────────────────────────
  {
    category: "Tablet",
    questions: [
      {
        id: "tablet-ecosystem",
        type: "single-select",
        prompt: "iPad or Android?",
        preferenceKey: "ecosystem",
        options: [
          { id: "ipad", label: "iPad", icon: "🍎", description: "Best apps, smooth, long support" },
          { id: "android", label: "Android", icon: "🤖", description: "More variety, file freedom" },
          { id: "any", label: "No preference", icon: "🤷", description: "Show me the best option" },
        ],
      },
      {
        id: "tablet-usecase",
        type: "single-select",
        prompt: "Main use?",
        preferenceKey: "useCase",
        options: [
          { id: "media", label: "Streaming & Reading", icon: "📺", description: "Netflix, books, casual use" },
          { id: "drawing", label: "Drawing / Note-taking", icon: "✏️", description: "Stylus support is key" },
          { id: "work", label: "Work / Productivity", icon: "💼", description: "Keyboard, multitasking" },
          { id: "kids", label: "For kids", icon: "👶", description: "Durable, parental controls" },
        ],
      },
      budgetQ("tablet-budget", 150, 1500, 50, [
        { value: 150, label: "$150" },
        { value: 350, label: "$350" },
        { value: 600, label: "$600" },
        { value: 900, label: "$900" },
        { value: 1500, label: "$1,500" },
      ]),
      {
        id: "tablet-features",
        type: "multi-select",
        prompt: "Must-have features?",
        subPrompt: "Pick up to 3",
        preferenceKey: "features",
        maxSelections: 3,
        options: [
          { id: "stylus", label: "Stylus / Apple Pencil", icon: "✏️" },
          { id: "keyboard", label: "Keyboard attachment", icon: "⌨️" },
          { id: "cellular", label: "Cellular / 5G", icon: "📶" },
          { id: "large", label: "Large screen (12\"+)", icon: "🖥️" },
          { id: "battery", label: "Long battery", icon: "🔋" },
          { id: "light", label: "Lightweight", icon: "🪶" },
        ],
      },
    ],
  },

  // ── Router ────────────────────────────────────────────────────────────────────
  {
    category: "Router",
    questions: [
      {
        id: "router-coverage",
        type: "single-select",
        prompt: "How big is your home?",
        preferenceKey: "coverage",
        options: [
          { id: "small", label: "Apartment / Small home", icon: "🏠", description: "Under 1,500 sq ft" },
          { id: "medium", label: "Medium home", icon: "🏡", description: "1,500–3,000 sq ft" },
          { id: "large", label: "Large home / Multi-floor", icon: "🏢", description: "3,000+ sq ft, dead zones" },
        ],
      },
      {
        id: "router-type",
        type: "binary",
        prompt: "Single router or mesh system?",
        preferenceKey: "routerType",
        options: [
          { id: "single", label: "Single router", icon: "📡", description: "Simpler, more powerful" },
          { id: "mesh", label: "Mesh system", icon: "🌐", description: "Covers every corner evenly" },
        ],
      },
      budgetQ("router-budget", 50, 600, 25, [
        { value: 50, label: "$50" },
        { value: 100, label: "$100" },
        { value: 200, label: "$200" },
        { value: 350, label: "$350" },
        { value: 600, label: "$600" },
      ]),
      {
        id: "router-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "speed", label: "Max Wi-Fi speed (Wi-Fi 7)", icon: "⚡" },
          { id: "range", label: "Long range / wall penetration", icon: "📡" },
          { id: "gaming", label: "Low latency for gaming", icon: "🎮" },
          { id: "devices", label: "Many devices (50+)", icon: "📱" },
          { id: "easy", label: "Easy setup / app control", icon: "📲" },
          { id: "security", label: "Built-in security features", icon: "🛡️" },
        ],
      },
    ],
  },

  // ── Smartwatch ────────────────────────────────────────────────────────────────
  {
    category: "Smartwatch",
    questions: [
      {
        id: "watch-ecosystem",
        type: "single-select",
        prompt: "Which phone do you use?",
        preferenceKey: "ecosystem",
        options: [
          { id: "iphone", label: "iPhone", icon: "🍎", description: "Apple Watch is the go-to" },
          { id: "android", label: "Android", icon: "🤖", description: "Galaxy, Pixel Watch, Garmin, etc." },
          { id: "any", label: "No preference", icon: "🤷", description: "Just show me the best" },
        ],
      },
      {
        id: "watch-focus",
        type: "binary",
        prompt: "Fitness tracker or smartwatch?",
        preferenceKey: "focus",
        options: [
          { id: "fitness", label: "Fitness / Health", icon: "🏃", description: "GPS, HR, sleep, workouts" },
          { id: "smart", label: "Smart notifications", icon: "📲", description: "Apps, calls, replies, maps" },
        ],
      },
      budgetQ("watch-budget", 100, 800, 25, [
        { value: 100, label: "$100" },
        { value: 200, label: "$200" },
        { value: 350, label: "$350" },
        { value: 500, label: "$500" },
        { value: 800, label: "$800" },
      ]),
      {
        id: "watch-priorities",
        type: "multi-select",
        prompt: "Important features?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "battery", label: "Long battery (7+ days)", icon: "🔋" },
          { id: "gps", label: "Built-in GPS", icon: "📍" },
          { id: "aod", label: "Always-on display", icon: "👁️" },
          { id: "rugged", label: "Rugged / water resistant", icon: "🛡️" },
          { id: "ecg", label: "ECG / blood oxygen", icon: "❤️" },
          { id: "design", label: "Premium design", icon: "💎" },
        ],
      },
    ],
  },

  // ── Gaming Console ────────────────────────────────────────────────────────────
  {
    category: "GamingConsole",
    questions: [
      {
        id: "console-type",
        type: "single-select",
        prompt: "How do you want to play?",
        preferenceKey: "playStyle",
        options: [
          { id: "tv", label: "On the TV (couch gaming)", icon: "📺", description: "PS5, Xbox Series X" },
          { id: "handheld", label: "Handheld / portable", icon: "🎮", description: "Steam Deck, Switch" },
          { id: "both", label: "Both TV + portable", icon: "🔀", description: "Nintendo Switch style" },
          { id: "pc-gaming", label: "PC gaming", icon: "🖥️", description: "Best graphics, mods, upgrades" },
        ],
      },
      {
        id: "console-games",
        type: "single-select",
        prompt: "What type of games?",
        preferenceKey: "gamePreference",
        options: [
          { id: "exclusives-sony", label: "PlayStation exclusives", icon: "🎮", description: "God of War, Spider-Man, etc." },
          { id: "exclusives-xbox", label: "Xbox / Game Pass", icon: "🟢", description: "Halo, Forza + 100s of games" },
          { id: "nintendo", label: "Nintendo games", icon: "🍄", description: "Mario, Zelda, Pokémon" },
          { id: "multiplatform", label: "Multiplatform games", icon: "🌍", description: "Call of Duty, FIFA, GTA" },
          { id: "indie", label: "Indie & PC titles", icon: "🕹️", description: "Steam library, unique games" },
        ],
      },
      budgetQ("console-budget", 200, 700, 50, [
        { value: 200, label: "$200" },
        { value: 350, label: "$350" },
        { value: 500, label: "$500" },
        { value: 700, label: "$700" },
      ]),
    ],
  },

  // ── CPU / Processor ───────────────────────────────────────────────────────────
  {
    category: "CPU",
    questions: [
      {
        id: "cpu-usecase",
        type: "single-select",
        prompt: "What's this CPU for?",
        preferenceKey: "useCase",
        options: [
          { id: "gaming", label: "Gaming", icon: "🎮", description: "High fps, low latency" },
          { id: "workstation", label: "Video editing / 3D / AI", icon: "🎬", description: "Multi-core, heavy workloads" },
          { id: "everyday", label: "Everyday / Office", icon: "💼", description: "Web browsing, Office apps" },
          { id: "dev", label: "Software development", icon: "💻", description: "Compiling, VMs, multitasking" },
        ],
      },
      {
        id: "cpu-brand",
        type: "binary",
        prompt: "AMD or Intel?",
        preferenceKey: "brand",
        options: [
          { id: "amd", label: "AMD Ryzen", icon: "🔴", description: "Often better value & efficiency" },
          { id: "intel", label: "Intel Core", icon: "🔵", description: "Strong single-core, gaming" },
        ],
      },
      budgetQ("cpu-budget", 100, 800, 25, [
        { value: 100, label: "$100" },
        { value: 200, label: "$200" },
        { value: 350, label: "$350" },
        { value: 500, label: "$500" },
        { value: 800, label: "$800" },
      ]),
      {
        id: "cpu-priorities",
        type: "multi-select",
        prompt: "What matters most?",
        subPrompt: "Pick up to 3",
        preferenceKey: "priorities",
        maxSelections: 3,
        options: [
          { id: "single-core", label: "Single-core speed (gaming)", icon: "⚡" },
          { id: "multi-core", label: "Multi-core (rendering/editing)", icon: "🔄" },
          { id: "igpu", label: "Integrated graphics", icon: "🖥️" },
          { id: "tdp", label: "Low power / cool running", icon: "🌿" },
          { id: "platform", label: "Upgrade path (same socket)", icon: "🔧" },
          { id: "overclocking", label: "Overclocking support", icon: "🚀" },
        ],
      },
    ],
  },
];

// ─── Fallback schema for unknown / generic categories ──────────────────────────

export const FALLBACK_QUESTIONS: CategoryQuestionSet = {
  category: "General",
  questions: [
    {
      id: "general-priority",
      type: "single-select",
      prompt: "What matters most?",
      preferenceKey: "topPriority",
      options: [
        { id: "value", label: "Best value", icon: "💰", description: "Maximum bang for buck" },
        { id: "quality", label: "Top quality", icon: "🏆", description: "Best in class, no compromises" },
        { id: "durability", label: "Built to last", icon: "💪", description: "Long-term reliability" },
        { id: "latest", label: "Latest technology", icon: "✨", description: "Newest features & specs" },
      ],
    },
    budgetQ("general-budget", 50, 1000, 25, [
      { value: 50, label: "$50" },
      { value: 100, label: "$100" },
      { value: 250, label: "$250" },
      { value: 500, label: "$500" },
      { value: 1000, label: "$1k" },
    ]),
    {
      id: "general-priorities",
      type: "multi-select",
      prompt: "Other priorities?",
      subPrompt: "Pick up to 3",
      preferenceKey: "priorities",
      maxSelections: 3,
      options: [
        { id: "brand", label: "Reputable brand", icon: "🏅" },
        { id: "reviews", label: "Strong user reviews", icon: "⭐" },
        { id: "warranty", label: "Good warranty", icon: "🛡️" },
        { id: "portable", label: "Portable / compact", icon: "🎒" },
        { id: "aesthetics", label: "Looks great", icon: "✨" },
        { id: "eco", label: "Eco-friendly", icon: "🌿" },
      ],
    },
  ],
};
