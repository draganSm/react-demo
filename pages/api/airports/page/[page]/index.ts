import { NextApiRequest, NextApiResponse } from 'next';

import { allAirports, searchAirports } from '../../../../../models/airport';
import { PAGE_SIZE } from '../../../../../utils/const';

const findAllAirportsPaging = (req: NextApiRequest, res: NextApiResponse) => {
  setTimeout(async () => {
    const { page } = req.query;
    const pageIndex = +page || 0;

    const all = await allAirports();

    res
      .status(200)
      .json(all.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE));
  }, 1500);
};

export default findAllAirportsPaging;
