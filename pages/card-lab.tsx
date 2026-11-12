import { useMemo } from 'react';
import { loadHsCards } from '../engine';
import { CardFace } from '../components/play-board/CardFace';

const { cards } = loadHsCards();

/** PROTOTYPE page: the painted PNG card frame (top) against the code-drawn SVG/CSS frame (bottom), same cards, same layout. */
const CardLab = () => {
  const samples = useMemo(() => {
    const real = cards.filter((c) => c.source !== 'entourage' && c.name);
    const byRarity = ['FREE', 'COMMON', 'REMARKABLE', 'SUPERIOR', 'MYTHIC'].map((r) => real.find((c) => c.rarity === r && c.type === 'minion'));
    const other = ['spell', 'weapon', 'item'].map((t) => real.find((c) => c.type === t && c.rarity === 'COMMON'));
    return [...byRarity, ...other].filter((c): c is NonNullable<typeof c> => !!c);
  }, []);
  const row = (vector: boolean) => (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', margin: '14px 0 34px' }}>
      {samples.map((c) => (
        <div key={c.id} style={{ textAlign: 'center' }}>
          <CardFace card={c} width={210} vector={vector} />
          <div style={{ marginTop: 6, fontSize: 12, color: '#9aa3b8' }}>
            {c.name} · {c.rarity?.toLowerCase()} {c.type}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <main style={{ padding: 24, color: '#e8eaf2', background: '#14161c', minHeight: '100vh' }}>
      <h1 style={{ margin: 0 }}>Card frame lab</h1>
      <p style={{ color: '#9aa3b8', maxWidth: 780 }}>
        Top: the current painted PNG frames (about 680 KB per rarity). Bottom: the same cards with the frame, rarity gem, type emblem and stat badges drawn
        in code as inline SVG (a few KB in all). Art, text, cost and stat positions are identical.
      </p>
      <h2>Painted (PNG)</h2>
      {row(false)}
      <h2>Drawn in code (SVG/CSS)</h2>
      {row(true)}
    </main>
  );
};

export default CardLab;
