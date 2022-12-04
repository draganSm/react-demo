import { NextApiRequest, NextApiResponse } from 'next';

import { searchAirports } from '../../../../../models/airport';
import { PAGE_SIZE } from '../../../../../utils/const';

const findAllAirportsPaging = (req: NextApiRequest, res: NextApiResponse) => {
  setTimeout(async () => {
    const { page, search } = req.query;
    const pageIndex = +page || 0;
    const flatSearch = Array.isArray(search) ? search[0] : search;

    const result = await searchAirports(flatSearch);

    res
      .status(200)
      .json(result.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE));
  }, 1500);
};

export default findAllAirportsPaging;
