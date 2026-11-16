import { useRouter } from 'next/router';
import { ArtLab } from '../components/art-lab/ArtLab';
import { CardLookup } from '../components/art-lab/CardLookup';

/** Dev lab: `/art-lab` looks a card up (id or name); `/art-lab?id=CORE_122` frames its art and edits its Airtable CARDS row. See components/art-lab/ArtLab.tsx. */
const ArtLabPage = () => {
  const { query, isReady } = useRouter();
  const id = typeof query.id === 'string' ? query.id.toUpperCase() : '';
  if (!isReady) return null;
  if (!/^(CORE|PRIME|GAME)_\d+[a-z]*$/i.test(id))
    return (
      <main style={{ height: '100vh', overflowY: 'auto', padding: '20px 24px 96px' }}>
        <h1>Art lab</h1>
        <p style={{ opacity: 0.7 }}>Find a card by id or name to edit its art and its Airtable row.</p>
        <CardLookup />
      </main>
    );
  return <ArtLab id={id} />;
};
export default ArtLabPage;
