export default function exists(element) {
  let exists;

  if (element !== null && typeof element !== 'undefined') exists = true;
  else exists = false;

  return exists;
}
