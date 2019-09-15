'use strict';

import * as basicAuth from 'basic-auth';
import { Request, Response } from 'express';

export const authenticate = (auth) => {
  return (req: Request, res: Response, next: Function) => {
    const user = basicAuth(req);

    if (user && user.name === auth.user && user.pass === auth.secret) {
      req.user = {
        userId: auth.ownerId
      };
      return next();
    }

    return res.sendStatus(401);
  }
}
