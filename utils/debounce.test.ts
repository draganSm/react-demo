import debounce from './debounce';

// I quick article I've wrote about fake timers can be found here:
// https://medium.com/@dragansmiljanic/jests-timer-mocks-deep-dive-part-1-a2e879ae6ec2
jest.useFakeTimers();

describe('debounce', () => {
  it('delay execution', async () => {
    const fn = jest.fn();
    debounce(fn, 500)();
    jest.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalled();
  });

  it('can be retriggered', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced();
    jest.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();
    debounced();
    jest.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();
  });

  it('accepts arguments', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced(1, 2);
    jest.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalledWith([1, 2]);
  });

  it('evaluates result', async () => {
    const fn = jest.fn().mockReturnValue('hello world');
    const debounced = debounce(fn, 500);
    const result = debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(result).resolves.toBe('hello world');
  });
});
