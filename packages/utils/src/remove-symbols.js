export default function removeSymbols(string, key) {
  switch (key) {
    default:
      return string.replace(/(%)/g, '');
  }
}
