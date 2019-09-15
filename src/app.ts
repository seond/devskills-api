'use strict'

import "reflect-metadata";
import * as express from 'express';
import * as cors from 'cors';

import { router } from './route';
import { middleware as graphQL } from './graphql';


const app = express();
const port = 4000;

// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('view engine', 'ejs');
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('views', __dirname+'/views')
app.use(cors());
app.use(express.json());

app.use('/', router);

if (!process.env.DISABLE_GRAPHQL) {
  app.use('/graphql', graphQL);
}

app.listen(port, () => console.log(`Devskills API listening on port ${port}!`));
