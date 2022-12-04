import { NextApiRequest, NextApiResponse } from 'next';

import { allAirports } from '../../../models/airport';

 const findAll = async (req: NextApiRequest, res: NextApiResponse) => {
  const airports = await allAirports();

  res.status(200).json(airports);
};

export default findAll;

