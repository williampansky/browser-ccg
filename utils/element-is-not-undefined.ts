export default function elementIsNotUndefined(element: HTMLElement): boolean {
  if (element !== null && typeof element !== 'undefined') return true;
  return false;
}
