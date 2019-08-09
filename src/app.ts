'use strict'

import "reflect-metadata";
import * as express from 'express';

import { router } from './route';
import { middleware as graphQL } from './graphql';


const app = express();
const port = 4000;

app.use(express.json())

app.get('/', (_: any, res: express.Response) => {
  res.send('Hello World!');
});

app.use('/api', router);
app.use('/graphql', graphQL);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
