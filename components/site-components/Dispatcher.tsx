import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAddressBarSize, setCollection } from '../../features';
import { useAddressBarSize } from '../../hooks';

export function Dispatcher() {
  const dispatch = useDispatch();
  const addressBarSize = useAddressBarSize();

  const fetchCards = async () => {
    const response = await fetch('/api/cards');
    const data = await response.json();
    dispatch(setCollection(data));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    if (addressBarSize !== null || addressBarSize !== NaN) {
      dispatch(setAddressBarSize(56));
    }
  }, [addressBarSize]);

  return null;
}
