import { useMemo, useState } from 'react';
import { loadHsCards } from '../engine';
import { createMinion } from '../engine/rules/minion';
import { MinionFace } from '../components/play-board/MinionFace';
import minionStyles from '../components/play-board/board-minion.module.scss';
import { SpriteEffect } from '../components/play-board/SpriteEffect';

/** Dev preview for sprite effects (not linked from the site). */
const { cards } = loadHsCards();

const FxPage = () => {
  const [shots, setShots] = useState(0);
  // Real engine minions (CORE, with art): a plain one and a Guard.
  const minions = useMemo(() => {
    const pool = cards.filter((c) => c.source === 'core' && !c.isToken && c.type === 'minion' && c.name);
    const picks = [pool.find((c) => !c.mechanics.includes('BULWARK')), pool.find((c) => c.mechanics.includes('BULWARK'))].filter((c): c is NonNullable<typeof c> => !!c);
    return picks.map((card, i) => ({ card, m: createMinion(card, i + 1, 0, i + 1) }));
  }, []);
  const box = { position: 'relative', width: 260, height: 260, background: '#223', borderRadius: 8 } as const;
  return (
    <div style={{ padding: 24, color: '#eee', fontFamily: 'sans-serif' }}>
      <h1>Sprite effects</h1>
      <p>Light Pillar: looping at 192 px, scaled up, and a one-shot you can replay.</p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={box}><SpriteEffect loop /></div>
        <div style={box}><SpriteEffect loop size={260} /></div>
        <div style={{ ...box, width: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {minions.map(({ card, m }) => (
            <div key={m.instanceId} className={minionStyles.slot} style={{ ['--m-h' as string]: '150px' }}>
              <MinionFace card={card} m={m} turn={1} sick={false} />
              {shots > 0 && <SpriteEffect key={shots} size={260} />}
            </div>
          ))}
          <button style={{ position: 'absolute', bottom: 8, left: 8 }} onClick={() => setShots((n) => n + 1)}>
            Play once
          </button>
        </div>
      </div>
    </div>
  );
};

export default FxPage;
