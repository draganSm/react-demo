import { ChangeEventHandler, FC, useCallback } from 'react';
import debounce from '../utils/debounce';

type SearchProps = {
  onChange: (value: string) => void;
  value: string;
};

const Search: FC<SearchProps> = ({ onChange, value }) => {
  const handleOnChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const { value } = event.target;
    onChange(value);
  }, [onChange]);

  return (
    <div className="mt-1 relative shadow-sm">
      <input
        defaultValue={value}
        type="text"
        name="query"
        id="query"
        className="focus:ring-blue-600 focus:border-blue-600 block w-full sm:text-sm border-gray-300 text-gray-800 rounded bg-gray-50 p-3"
        placeholder="Search by name, IATA, city, or country"
        onChange={debounce(handleOnChange)}
      />
    </div>
  );
};

export default Search;
