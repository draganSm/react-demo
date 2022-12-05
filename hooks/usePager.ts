import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const usePager = <T>(
  initialPage: number,
  initialData: T[],
  urlFactory: (pageIndex: number) => string,
  handlePageLoaded: () => void
): {
  items: T[];
  loading: boolean;
  lastPageLoaded: boolean;
  startNewQuery: () => void;
  loadNextPage: () => void;
} => {
  const [lastPageIndex, setLastPageIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [lastPageLoaded, setLastPageLoaded] = useState(false);
  

  const startNewQuery = useCallback(() => {
    setLoading(true);
    setPageIndex(0);
    setLastPageLoaded(false);
    setLastPageIndex(-1);
  }, []);

  const loadNextPage = useCallback(() => {
    setPageIndex(pageIndex + 1);
    setLoading(true);
  }, [pageIndex]);

  useEffect(() => {
    (async () => {
      const append = lastPageIndex != -1;
      if (pageIndex !== lastPageIndex) {
        setLastPageIndex(pageIndex);
        try {
          const url = urlFactory(pageIndex);
          let response = await axios.get<T[]>(url);
          let newPage = response.data;
          if (newPage.length) {
            setItems(append ? items.concat(newPage) : newPage);
          } else {
            // reg#001
            if (pageIndex === 0) {
              setItems([]);
            }
            setLastPageLoaded(true);
          }
          setLoading(false);
          setTimeout(() => {
            handlePageLoaded();
          }, 0);
        } catch (e) {
          // TODO: add error message
        }
      }
    })();
  }, [handlePageLoaded, items, pageIndex, urlFactory, lastPageIndex]);
  return { items, loading, lastPageLoaded, startNewQuery, loadNextPage };
};

export default usePager;
