import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import type { Card } from '../../../../types';

import { getMechanicObject, replaceAllConstants } from '../../../../utils';
import { Card as CardComponent, Minion } from '../../../game-components';

interface Props {
  data?: Card;
  onModalDismiss?: () => void;
}

export const CardDetailModal = ({ data, onModalDismiss }: Props) => {
  const abSize = useSelector(({ addressBarSize }: RootState) => addressBarSize);

  return (
    <div
      className={[
        'card-detail__modal',
        data ? 'card-detail__modal--active' : '',
      ].join(' ')}
      onClick={onModalDismiss}
      style={{
        height: `calc(100vh - ${abSize}px)`,
        maxHeight: `calc(100vh - ${abSize}px)`,
        minHeight: `calc(100vh - ${abSize}px)`,
      }}
    >
      {data ? (
        <div className='modal__dialog'>
          {/* ========================================== */}
          {/* CARD */}
          <div className='content__card bccg-animation-slide-bottom-small'>
            <CardComponent {...data} canPlay={true} />

            {data?.type === 'MINION' && (
              <div className='content__minion bccg-animation-scale-up'>
                <Minion {...data} />
              </div>
            )}

            {data?.elite === false && (
              <div className='card2 bccg-animation-slide-bottom-small'>
                <CardComponent {...data} canPlay={true} />
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* INFO */}
          <div className='content__info magictime vanishIn'>
            {/* <h2 className='info__name'>{data.name}</h2> */}

            {/* {data?.flavorText && (
                <p className='info__flavor text__value'>"{data?.flavorText}"</p>
              )} */}

            {data?.mechanics?.length !== 0 && (
              <ul className='mechanics'>
                {data?.mechanics?.map((m, i) => {
                  const { name, description } = getMechanicObject(m);
                  return (
                    <li className='mechanic' key={i}>
                      <p className='mechanic__name text__value'>{name}</p>
                      <p className='mechanic__description'>
                        <small>{replaceAllConstants(description)}</small>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            {data?.artistName || data?.artistUrl ? (
              <>
                <hr />
                <ul className='mechanics'>
                  {data?.artistName && (
                    <li className='mechanic'>
                      <p className='mechanic__name text__value'>Artist</p>
                      <p className='mechanic__description'>
                        <small>{data?.artistName}</small>
                        {data?.artistUrl && (
                          <>
                            <span>: </span>
                            <small>{data?.artistUrl}</small>
                          </>
                        )}
                      </p>
                    </li>
                  )}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
