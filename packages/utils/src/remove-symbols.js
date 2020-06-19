function tryCatch(str) {
  try {
    return str.replace(/(%)/g, '');
  } catch (error) {
    console.error(error);
  }
}

export default function removeSymbols(string, key) {
  switch (key) {
    default:
      return tryCatch(string);
  }
}
