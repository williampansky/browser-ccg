import type { Card } from '../../../../types';
import { Card as CardComponent, Minion } from '../../../game-components';

export interface CardDetailModalProps {
  data?: Card;
  onModalDismiss?: () => void;
}

export const CardDetailModal = ({
  data,
  onModalDismiss,
}: CardDetailModalProps) => {
  return (
    <div
      className={[
        'card-detail__modal',
        data ? 'card-detail__modal--active' : '',
      ].join(' ')}
      onClick={onModalDismiss}
    >
      <div className='modal__inner'>
        {data && (
          <div className='inner__content'>
            {data?.flavorText && (
              <div className='content__flavor'>
                <blockquote>"{data?.flavorText}"</blockquote>
              </div>
            )}

            <div className='content__card'>
              <CardComponent {...data} canPlay={true} />
              
              {data?.type === 'MINION' && (
                <div className='content__minion'>
                  <Minion {...data} />
                </div>
              )}
            </div>

            {data?.artistName && (
              <div className='content__artist'>
                <p className='text__value'>
                  {data?.artistName}
                </p>
                <p className='text__value'>
                  {data?.artistUrl && <small>{data?.artistUrl}</small>}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
