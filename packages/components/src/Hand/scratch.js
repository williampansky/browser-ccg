// const [items, setItems] = useState([]);
// const previousItems = usePrevious(items);
// const [hoveringCard, setHoveringCard] = useState(null);

// const handleItemsCallback = useCallback(
//   incomingItems => {
//     const result = isEqual(sortBy(incomingItems), sortBy(previousItems));
//     !result && setItems(incomingItems);
//   },
//   [previousItems]
// );

// useEffect(() => {
//   console.log(hoveringCard);
// }, [hoveringCard]);
