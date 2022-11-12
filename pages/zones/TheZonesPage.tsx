import { useEffect, useState } from 'react';
import { Container, Layout } from '../../components/site-components';
import { siteConfig } from '../../app.config';
import type { Zone } from '../../types';

export default function TheZonesPage() {
  const page = siteConfig.pages.zones;
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneModal, setZoneModal] = useState<Zone | undefined>(undefined);

  const fetchZones = async () => {
    const response = await fetch('/api/zones');
    const data = await response.json();
    setZones(data);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const inspectCard = (z: Zone) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setZoneModal(z);
    };
  };

  return (
    <Layout title={page.name} description={page.description}>
      <div className={`${page.name.toLocaleLowerCase()}__page`}>
      <Container>
          <h1>{page.headline}</h1>
          <div className='grid'>
            {zones.map((z: Zone) => {
              return z ? (
                <div
                  key={z.uuid}
                  className='grid-item'
                  onClickCapture={inspectCard(z)}
                >
                  {z.name}
                  {/* <CardComponent {...z} canPlay={true} /> */}
                </div>
              ) : null;
            })}
          </div>
        </Container>

        <div
          className={[
            'zone__modal',
            zoneModal ? 'zone__modal--active' : '',
          ].join(' ')}
          onClick={() => setZoneModal(undefined)}
        >
          <div className='modal__inner'>
            {/* {zoneModal && <CardComponent {...zoneModal} canPlay={true} />} */}
          </div>
        </div>
      </div>
    </Layout>
  );
}
