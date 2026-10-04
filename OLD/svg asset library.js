export const SVG_ASSETS = {
  body: {
    'head-base': `
      <g id="head-base">
        <!-- Ears -->
        <path d="M 68 62 C 64 62 64 70 68 72 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <path d="M 132 62 C 136 62 136 70 132 72 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <!-- Face Outline -->
        <path d="M 70 52 C 70 30 130 30 130 52 C 130 80 118 95 100 95 C 82 95 70 80 70 52 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2" stroke-linejoin="round"/>
        <!-- Neck -->
        <path d="M 92 88 L 92 104 L 108 104 L 108 88 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'body-medium': `
      <g id="body-medium">
        <!-- Seated Lower Body (Folded legs seiza) -->
        <path d="M 45 185 C 45 155 70 145 100 145 C 130 145 155 155 155 185 C 155 198 135 200 100 200 C 65 200 45 198 45 185 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <!-- Torso Base -->
        <path d="M 72 102 L 128 102 L 134 150 L 66 150 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'body-narrow': `
      <g id="body-narrow">
        <path d="M 52 185 C 52 157 74 147 100 147 C 126 147 148 157 148 185 C 148 198 130 200 100 200 C 70 200 52 198 52 185 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <path d="M 77 102 L 123 102 L 128 150 L 72 150 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'body-broad': `
      <g id="body-broad">
        <path d="M 38 185 C 38 153 66 143 100 143 C 134 143 162 153 162 185 C 162 198 140 200 100 200 C 60 200 38 198 38 185 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <path d="M 66 102 L 134 102 L 140 150 L 60 150 Z" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'hands': `
      <g id="hands">
        <!-- Rested in lap -->
        <ellipse cx="91" cy="146" rx="8" ry="6" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
        <ellipse cx="109" cy="146" rx="8" ry="6" fill="#FF00FF" stroke="#4A4238" stroke-width="2"/>
      </g>`
  },

  eyes: {
    'eyes-calm': `
      <g id="eyes-calm" stroke="#4A4238" stroke-width="2.5" stroke-linecap="round" fill="none">
        <path d="M 80 64 Q 85 68 90 64"/>
        <path d="M 110 64 Q 115 68 120 64"/>
      </g>`,
    'eyes-open': `
      <g id="eyes-open">
        <ellipse cx="85" cy="63" rx="4" ry="5" fill="#4A4238"/>
        <ellipse cx="115" cy="63" rx="4" ry="5" fill="#4A4238"/>
        <circle cx="83.5" cy="61.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="113.5" cy="61.5" r="1.5" fill="#FFFFFF"/>
      </g>`,
    'eyes-smile': `
      <g id="eyes-smile" stroke="#4A4238" stroke-width="2.5" stroke-linecap="round" fill="none">
        <path d="M 80 65 Q 85 59 90 65"/>
        <path d="M 110 65 Q 115 59 120 65"/>
      </g>`
  },

  hair: {
    'short': `
      <g id="hair-short" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 68 55 C 68 32 80 26 100 26 C 120 26 132 32 132 55 C 132 58 126 48 100 48 C 74 48 68 58 68 55 Z"/>
      </g>`,
    'cropped': `
      <g id="hair-cropped" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 68 52 C 68 28 82 24 100 24 C 118 24 132 28 132 52 C 124 45 112 44 100 44 C 88 44 76 45 68 52 Z"/>
      </g>`,
    'bob': `
      <g id="hair-bob" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 66 60 C 64 30 78 24 100 24 C 122 24 136 30 134 60 C 136 78 126 80 125 72 C 122 50 112 45 100 45 C 88 45 78 50 75 72 C 74 80 64 78 66 60 Z"/>
      </g>`,
    'long': `
      <g id="hair-long-front" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 68 50 C 68 26 82 22 100 22 C 118 22 132 26 132 50 C 124 44 112 42 100 42 C 88 42 76 44 68 50 Z"/>
        <path d="M 68 50 C 66 70 70 95 73 110 C 76 90 75 60 76 52 Z"/>
        <path d="M 132 50 C 134 70 130 95 127 110 C 124 90 125 60 124 52 Z"/>
      </g>`,
    'long-back': `
      <g id="hair-long-back" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 62 50 C 60 100 65 155 75 160 C 85 165 115 165 125 160 C 135 155 140 100 138 50 Z"/>
      </g>`,
    'ponytail': `
      <g id="hair-ponytail-front" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <path d="M 68 50 C 68 26 82 24 100 24 C 118 24 132 26 132 50 C 122 44 112 42 100 42 C 88 42 78 44 68 50 Z"/>
      </g>`,
    'ponytail-back': `
      <g id="hair-ponytail-back" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <!-- High ponytail gathering & drop -->
        <path d="M 124 35 C 145 35 165 65 155 115 C 145 120 135 90 126 48 Z"/>
      </g>`,
    'bun': `
      <g id="hair-bun" fill="#00FFFF" stroke="#4A4238" stroke-width="2">
        <circle cx="100" cy="20" r="14"/>
        <path d="M 68 52 C 68 28 82 25 100 25 C 118 25 132 28 132 52 C 124 45 112 43 100 43 C 88 43 76 45 68 52 Z"/>
      </g>`
  },

  top: {
    'top-kinari': `
      <g id="top-kinari">
        <!-- Undyed shirt -->
        <path d="M 70 102 L 130 102 L 136 150 L 64 150 Z" fill="#F7F4EB" stroke="#4A4238" stroke-width="2"/>
        <path d="M 90 102 L 100 120 L 110 102" fill="none" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'top-ai': `
      <g id="top-ai">
        <!-- Indigo Haori -->
        <path d="M 66 102 L 134 102 L 140 152 L 60 152 Z" fill="#2B3A4E" stroke="#4A4238" stroke-width="2"/>
        <path d="M 86 102 L 96 152 M 114 102 L 104 152" fill="none" stroke="#EAE6DF" stroke-width="3"/>
      </g>`,
    'top-matcha': `
      <g id="top-matcha">
        <path d="M 68 102 L 132 102 L 137 150 L 63 150 Z" fill="#8A9A86" stroke="#4A4238" stroke-width="2"/>
        <path d="M 92 102 L 100 115 L 108 102" fill="none" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'top-sakura': `
      <g id="top-sakura">
        <path d="M 68 102 L 132 102 L 137 150 L 63 150 Z" fill="#E8B4B8" stroke="#4A4238" stroke-width="2"/>
        <path d="M 92 102 L 100 115 L 108 102" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      </g>`,
    'top-parka': `
      <g id="top-parka">
        <!-- Hoodie -->
        <path d="M 66 102 L 134 102 L 138 150 L 62 150 Z" fill="#5A6B7C" stroke="#4A4238" stroke-width="2"/>
        <!-- Hood collar fold & drawstrings -->
        <path d="M 82 102 C 82 118 118 118 118 102" fill="none" stroke="#4A4238" stroke-width="2"/>
        <path d="M 94 114 L 94 130 M 106 114 L 106 130" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      </g>`,
    'top-yukata': `
      <g id="top-yukata">
        <path d="M 68 102 L 132 102 L 137 150 L 63 150 Z" fill="#3D5A80" stroke="#4A4238" stroke-width="2"/>
        <path d="M 72 110 L 128 140 M 72 130 L 110 150" stroke="#98C1D9" stroke-width="1.5" opacity="0.6"/>
        <path d="M 86 102 L 108 132 L 114 102" fill="none" stroke="#E0FBFC" stroke-width="2"/>
      </g>`
  },

  bottom: {
    'bottom-sumi': `
      <g id="bottom-sumi">
        <path d="M 43 185 C 43 153 68 143 100 143 C 132 143 157 153 157 185 C 157 199 135 201 100 201 C 65 201 43 199 43 185 Z" fill="#343A40" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'bottom-kinari': `
      <g id="bottom-kinari">
        <path d="M 43 185 C 43 153 68 143 100 143 C 132 143 157 153 157 185 C 157 199 135 201 100 201 C 65 201 43 199 43 185 Z" fill="#EAE5D9" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'bottom-skirt': `
      <g id="bottom-skirt">
        <path d="M 40 186 C 40 150 65 142 100 142 C 135 142 160 150 160 186 C 160 201 138 202 100 202 C 62 202 40 201 40 186 Z" fill="#723D46" stroke="#4A4238" stroke-width="2"/>
      </g>`,
    'bottom-hakama': `
      <g id="bottom-hakama">
        <path d="M 38 186 C 38 148 65 140 100 140 C 135 140 162 148 162 186 C 162 202 140 203 100 203 C 60 203 38 202 38 186 Z" fill="#1F2421" stroke="#4A4238" stroke-width="2"/>
        <path d="M 80 142 L 70 200 M 100 140 L 100 203 M 120 142 L 130 200" stroke="#343A40" stroke-width="1.5"/>
      </g>`
  },

  head: {
    'head-hachimaki': `
      <g id="head-hachimaki">
        <path d="M 68 45 Q 100 40 132 45 L 133 52 Q 100 47 67 52 Z" fill="#B23B23" stroke="#4A4238" stroke-width="2"/>
        <!-- Tie knot side -->
        <path d="M 130 47 L 142 52 L 138 62 L 128 50 Z" fill="#B23B23" stroke="#4A4238" stroke-width="1.5"/>
      </g>`,
    'head-kanzashi': `
      <g id="head-kanzashi">
        <path d="M 115 40 L 140 25" stroke="#D4AC0D" stroke-width="3" stroke-linecap="round"/>
        <circle cx="117" cy="39" r="5" fill="#C0392B" stroke="#4A4238" stroke-width="1.5"/>
      </g>`,
    'head-beret': `
      <g id="head-beret">
        <path d="M 62 38 C 65 15 125 12 138 30 C 142 36 120 44 72 43 C 62 42 58 40 62 38 Z" fill="#3F4E4F" stroke="#4A4238" stroke-width="2"/>
        <path d="M 100 16 L 100 12" stroke="#3F4E4F" stroke-width="2.5" stroke-linecap="round"/>
      </g>`
  },

  face: {
    'face-megane': `
      <g id="face-megane" fill="none" stroke="#4A4238" stroke-width="2">
        <circle cx="84" cy="63" r="10"/>
        <circle cx="116" cy="63" r="10"/>
        <line x1="94" y1="63" x2="106" y2="63"/>
        <line x1="74" y1="63" x2="68" y2="61"/>
        <line x1="126" y1="63" x2="132" y2="61"/>
      </g>`
  },

  neck: {
    'neck-muffler': `
      <g id="neck-muffler">
        <path d="M 80 88 C 80 80 120 80 120 88 C 124 100 76 100 80 88 Z" fill="#C87D55" stroke="#4A4238" stroke-width="2"/>
        <path d="M 102 94 L 112 125 L 124 123 L 114 92 Z" fill="#C87D55" stroke="#4A4238" stroke-width="2"/>
      </g>`
  }
};