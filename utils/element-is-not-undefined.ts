export default function elementIsNotUndefined(element: any): boolean {
  if (element !== null && typeof element !== 'undefined') return true;
  return false;
}
