const debounce = <O = void>(
  func: (...args: any) => O,
  delay = 500
): ((...args: any) => Promise<O>) => {
  let timer: ReturnType<typeof setTimeout>; // Node.js returns object, browser returns id (number)

  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timer); // clearTimeout ignores invalid timer handle id
      timer = setTimeout(() => {
        resolve(func(...args));
      }, delay);
    });
  };
};

export default debounce;
