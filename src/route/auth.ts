'use strict';

import * as fetch from 'node-fetch';
import * as qs from 'qs';
import { Response, Request, Router } from 'express';
import { AUTH } from '../common/config';

export const router = new Router();

router.get('/', (req: Request, res: Response) => {
  res.render('landing.ejs', {
    cfg: {
      AUTH_HOST: AUTH.url
    }
  });
});

router.get('/auth/callback', (req: Request, res: Response) => {
  fetch(`${AUTH.url}/auth/token`, {
    method: 'post',
    body: qs.stringify({
      grant_type: 'authorization_code',
      client_id: AUTH.clientId,
      client_secret: AUTH.clientSecret,
      code: req.query.code
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
  }).then(res => res.json())
    .then(json => {
      res.render('authorized.ejs', {
        cfg: {
          access_token: json.access_token
        }
      });
    });
});
