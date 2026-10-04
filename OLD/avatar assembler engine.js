/**
 * tsumiki Avatar Assembler Engine
 * Seated seiza avatar renderer for Room, Portrait, and Character Creation views.
 */

export const PALETTES = {
  skin: {
    'skin-1': '#FDF0E6', // Light porcelain
    'skin-2': '#F4D3B2', // Warm peach
    'skin-3': '#C68B59', // Medium honey
    'skin-4': '#8D5B36', // Deep bronze
    'skin-5': '#4A2E1B'  // Deep espresso
  },
  hair: {
    'black': '#23201D',
    'dark brown': '#3D2B1F',
    'chestnut': '#6B4226',
    'auburn': '#8C3820',
    'blond': '#E0B050',
    'grey': '#8A8580',
    'indigo': '#324158'
  }
};

const DEFAULT_CHARACTER = {
  base: {
    skin: 'skin-1',
    body: 'body-medium',
    hair: 'bob',
    hairColor: 'dark brown',
    eyes: 'eyes-calm'
  },
  wear: {
    top: 'top-kinari',
    bottom: 'bottom-sumi',
    head: null,
    face: null,
    neck: null
  }
};

// Layer Stacking Order (Back to Front)
const LAYER_ORDER = [
  'hair-back',
  'bottom',
  'body',
  'top',
  'hands',
  'neck',
  'head',
  'eyes',
  'hair-front',
  'face',
  'head-acc'
];

/**
 * Renders the assembled SVG avatar string
 * @param {number} x - Horizontal placement
 * @param {number} y - Base floor contact placement
 * @param {number} scale - Rendering scale multiplier (1.0 = 200x220 canvas)
 * @param {Object} character - Character configuration object
 */
export function drawAvatar(x = 0, y = 0, scale = 1, character = DEFAULT_CHARACTER) {
  const config = {
    base: { ...DEFAULT_CHARACTER.base, ...(character?.base || {}) },
    wear: { ...DEFAULT_CHARACTER.wear, ...(character?.wear || {}) }
  };

  const skinHex = PALETTES.skin[config.base.skin] || PALETTES.skin['skin-1'];
  const hairHex = PALETTES.hair[config.base.hairColor] || PALETTES.hair['dark brown'];

  // Map requested layers
  const activeLayers = [];

  // 1. Hair Back
  if (['long', 'ponytail'].includes(config.base.hair)) {
    activeLayers.push({ id: 'hair-back', svg: SVG_ASSETS.hair[`${config.base.hair}-back`] });
  }

  // 2. Bottom
  if (config.wear.bottom && SVG_ASSETS.bottom[config.wear.bottom]) {
    activeLayers.push({ id: 'bottom', svg: SVG_ASSETS.bottom[config.wear.bottom] });
  }

  // 3. Body Torso
  const bodyId = config.base.body || 'body-medium';
  activeLayers.push({ id: 'body', svg: SVG_ASSETS.body[bodyId] || SVG_ASSETS.body['body-medium'] });

  // 4. Top
  if (config.wear.top && SVG_ASSETS.top[config.wear.top]) {
    activeLayers.push({ id: 'top', svg: SVG_ASSETS.top[config.wear.top] });
  }

  // 5. Hands (resting in lap)
  activeLayers.push({ id: 'hands', svg: SVG_ASSETS.body['hands'] });

  // 6. Neck
  if (config.wear.neck && SVG_ASSETS.neck[config.wear.neck]) {
    activeLayers.push({ id: 'neck', svg: SVG_ASSETS.neck[config.wear.neck] });
  }

  // 7. Head Base
  activeLayers.push({ id: 'head', svg: SVG_ASSETS.body['head-base'] });

  // 8. Eyes
  const eyeId = config.base.eyes || 'eyes-calm';
  activeLayers.push({ id: 'eyes', svg: SVG_ASSETS.eyes[eyeId] || SVG_ASSETS.eyes['eyes-calm'] });

  // 9. Hair Front
  if (SVG_ASSETS.hair[config.base.hair]) {
    activeLayers.push({ id: 'hair-front', svg: SVG_ASSETS.hair[config.base.hair] });
  }

  // 10. Face Accessory
  if (config.wear.face && SVG_ASSETS.face[config.wear.face]) {
    activeLayers.push({ id: 'face', svg: SVG_ASSETS.face[config.wear.face] });
  }

  // 11. Head Accessory
  if (config.wear.head && SVG_ASSETS.head[config.wear.head]) {
    activeLayers.push({ id: 'head-acc', svg: SVG_ASSETS.head[config.wear.head] });
  }

  // Assemble and apply runtime recolouring
  const rawLayers = activeLayers.map(layer => layer.svg).join('\n');
  const recoloured = rawLayers
    .replace(/#FF00FF/g, skinHex)
    .replace(/#00FFFF/g, hairHex);

  const width = 200 * scale;
  const height = 220 * scale;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 200 220" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
      <g id="tsumiki-avatar-root">
        ${recoloured}
      </g>
    </svg>
  `.trim();
}