import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Container, Layout } from '../../components/site-components';
import { gameConfig, siteConfig } from '../../app.config';
import type { Zone } from '../../types';

interface ZoneModal extends Zone {
  imgSrc: string;
}

export default function TheZonesPage() {
  const page = siteConfig.pages.zones;
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneModal, setZoneModal] = useState<ZoneModal | undefined>(undefined);

  const fetchZones = async () => {
    const response = await fetch('/api/zones');
    const data = await response.json();
    setZones(data);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const inspectZone = (z: Zone) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setZoneModal({
        ...z,
        imgSrc: `/images/zones/${z?.id.replace('ZONE_', '')}.jpg`,
      } as ZoneModal);
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
                  key={z.id}
                  className='grid-item'
                  onClickCapture={inspectZone(z)}
                >
                  <div className='zone'>
                    <div className='zone__center'>
                      <div className='zone__info'>
                        <div className='zone__name'>{z.name}</div>
                        <div className='zone__text'>{z?.effectText}</div>
                      </div>
                      {gameConfig.zonesConfig.zoneImages && (
                        <div className='center__image'>
                          <Image
                            alt=''
                            role='presentation'
                            layout='intrinsic'
                            height={1000}
                            width={1000}
                            src={`/images/zones/${z.id.replace(
                              'ZONE_',
                              ''
                            )}.jpg`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </Container>

        <div
          className={[
            'zones__modal',
            zoneModal ? 'zones__modal--active' : '',
          ].join(' ')}
          onClick={() => setZoneModal(undefined)}
        >
          <div className='modal__inner'>
            {zoneModal && (
              <>
                <div className='inner__header'>
                  <h2>{zoneModal.name}</h2>
                  <p>{zoneModal.effectText}</p>
                </div>
                <div className='inner__image'>
                  <Image
                    alt=''
                    role='presentation'
                    layout='intrinsic'
                    height={1000}
                    width={1000}
                    src={zoneModal.imgSrc}
                  />
                </div>
                <div className='inner__footer'>
                  {zoneModal?.artistName && (
                    <p>
                      <small>Artist: {zoneModal?.artistName}</small>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
