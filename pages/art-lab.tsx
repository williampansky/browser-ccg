import { useRouter } from 'next/router';
import { ArtLab } from '../components/art-lab/ArtLab';
import { CardLookup } from '../components/art-lab/CardLookup';
import { AssetGrid } from '../components/art-lab/AssetGrid';
import { Button } from '../components/ui';

/** Dev lab: `/art-lab` looks a card up (id or name); `/art-lab?id=CORE_122` frames its art and edits its Airtable CARDS row. See components/art-lab/ArtLab.tsx. */
const ArtLabPage = () => {
  const router = useRouter();
  const { query, isReady } = router;
  const assets = query.tab === 'assets';
  const id = typeof query.id === 'string' ? query.id.toUpperCase() : '';
  if (!isReady) return null;
  if (!/^(CORE|PRIME|GAME)_\d+[a-z]*$/i.test(id))
    return (
      <main style={{ height: '100vh', overflowY: 'auto', padding: '20px 24px 96px' }}>
        <h1>Art lab</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button variant={assets ? undefined : 'primary'} onClick={() => router.push({ pathname: '/art-lab' })}>Cards</Button>
          <Button variant={assets ? 'primary' : undefined} onClick={() => router.push({ pathname: '/art-lab', query: { tab: 'assets' } })}>Assets</Button>
        </div>
        {assets ? (
          <AssetGrid />
        ) : (
          <>
            <p style={{ opacity: 0.7 }}>Find a card by id or name to edit its art and its Airtable row.</p>
            <CardLookup />
          </>
        )}
      </main>
    );
  return <ArtLab id={id} />;
};
export default ArtLabPage;
