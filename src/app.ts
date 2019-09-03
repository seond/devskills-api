'use strict'

import "reflect-metadata";
import * as express from 'express';
import * as cors from 'cors';

import { router } from './route';
import { middleware as graphQL } from './graphql';


const app = express();
const port = 4000;

app.use(cors())
app.use(express.json());

app.use('/api', router);

if (!process.env.DISABLE_GRAPHQL) {
  app.use('/graphql', graphQL);
}

app.listen(port, () => console.log(`Devskills API listening on port ${port}!`));
