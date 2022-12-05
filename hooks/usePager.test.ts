import axios from 'axios';
import { renderHook, act } from '@testing-library/react';
import usePager from './usePager';

jest.mock('axios');

const axiosResponseFactory = <T>(response: T[]) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: response });
    }, 0);
  });

const axiosResponseFailureFactory = <E = Error>(error: E) =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(error);
    }, 0);
  });

describe('usePager', () => {
  it('init', async () => {
    let initialPage = 0;
    let initialData = [];
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();
    const { result } = renderHook(() =>
      usePager(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    const { items, loading, lastPageLoaded } = result.current;

    expect(items).toEqual([]);
    expect(loading).toBe(false);
    expect(lastPageLoaded).toBe(false);
    expect(urlFactory).not.toHaveBeenCalled();
    expect(handlePageLoaded).not.toHaveBeenCalled();
  });

  it('fetch next page', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(
      axiosResponseFactory(['C', 'D'])
    );
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    await act(async () => {
      result.current.loadNextPage(); // async fn in useEffect
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    expect(result.current.items).toEqual(['A', 'B', 'C', 'D']);
    expect(result.current.loading).toBe(false);
    expect(result.current.lastPageLoaded).toBe(false);

    expect(urlFactory).toHaveBeenCalledTimes(1);
    expect(urlFactory).toHaveBeenCalledWith(1);
    expect(handlePageLoaded).not.toHaveBeenCalled();

    await act(async () => {
      jest.runOnlyPendingTimers(); // async post-fetch call
    });

    // handlePageLoaded is executed async - otherwise scroll to bottom couldn't work
    expect(handlePageLoaded).toHaveBeenCalled();
  });

  it('fetch last page', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(
      axiosResponseFactory(['C', 'D'])
    );
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    // fetch 2st page
    await act(async () => {
      result.current.loadNextPage(); // async fn in useEffect
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async post-fetch call
    });

    (axios.get as jest.Mock).mockResolvedValueOnce(axiosResponseFactory([]));

    expect(result.current.lastPageLoaded).toBe(false);

    // try to fetch 3rd page
    await act(async () => {
      result.current.loadNextPage(); // async fn in useEffect
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async post-fetch call
    });

    expect(result.current.lastPageLoaded).toBe(true);
  });

  it('start new query', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(
      axiosResponseFactory(['C', 'D'])
    );
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    // fetch 2st page
    await act(async () => {
      result.current.startNewQuery(); // async fn in useEffect
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual(['C', 'D']);
  });

  // steps to reproduce:
  // - enter 'germannn'
  // expected:
  // - empty list
  // actual:
  // - previous list is kept
  it('reg#001 fix', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(axiosResponseFactory([]));
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    // fetch 2st page
    await act(async () => {
      result.current.startNewQuery(); // async fn in useEffect
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.lastPageLoaded).toBe(true);
  });

  it('reg#001 fix - replace content', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(
      axiosResponseFactory(['C', 'D'])
    );
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    // fetch 2st page
    await act(async () => {
      result.current.startNewQuery(); // async fn in useEffect
    });

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    expect(result.current.items).toEqual(['C', 'D']);
    expect(result.current.lastPageLoaded).toBe(false);
  });

  // steps to reproduce:
  // - disable traffic to /api/airports/*
  // - change query or request new page
  // - items skeleton animation will appear
  // expected:
  // - the loading animation is finished after some short time
  // actual:
  // - the animation remains on the screen
  it('reg#002', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockResolvedValueOnce(
      axiosResponseFailureFactory(Error('error'))
    );
    let urlFactory = jest.fn();
    let handlePageLoaded = jest.fn();

    let initialPage = 0;
    let initialData = ['A', 'B']; // "prefetched" by SSR

    const { result } = renderHook(() =>
      usePager<string>(initialPage, initialData, urlFactory, handlePageLoaded)
    );

    await act(async () => {
      result.current.loadNextPage(); // async fn in useEffect
    });

    expect(result.current.error).toBe(false);

    await act(async () => {
      jest.runOnlyPendingTimers(); // async axios call
    });

    expect(result.current.items).toEqual(['A', 'B']);
    expect(result.current.loading).toBe(false);
    expect(result.current.lastPageLoaded).toBe(false);
    expect(result.current.error).toBe(true);
  });
});
