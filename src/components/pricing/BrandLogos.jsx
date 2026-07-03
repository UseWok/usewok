const LOGOS = [
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/2997ccaf0_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/3e14443c1_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/d83060142_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/1f3d1813e_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/aeeba821a_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/b8feb4a78_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/2ca928cb2_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/b8ff5b72a_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/ed7a5ae1d_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/3ec1d6577_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/ef07e64c2_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/e2c96394e_image.png',
];

export default function BrandLogos() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', alignItems: 'center' }}>
      {LOGOS.map((url, i) => (
        <div key={i} style={{ flexBasis: 'calc((100% - 144px) / 7)', minWidth: 80, flexGrow: 0, flexShrink: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={url} alt="" style={{ maxHeight: 30, maxWidth: '100%', objectFit: 'contain', opacity: 0.65 }} />
        </div>
      ))}
    </div>
  );
}