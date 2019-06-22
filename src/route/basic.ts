'use strict'

import { Response, Request, Router } from 'express';
import { createEntity, getOneById } from '../handler/common';

// basicRouterFactory creates a router for a given entity
// which creates a new object/gets all objects/gets one object with a given ID and does all basic data actions
// This module works only for pre-considered entities.
export function basicRouterFactory(entity: string): Router {
  const router = new Router();

  router.get('/', (_: any, res: Response) => {
    res.send('got all ' + entity);
  });

  router.post('/', (req: Request, res: Response) => {
    const payload = req.body;

    if (!validatePayload(entity, payload)) {
      res.status(400).send();
    }

    createEntity(entity, payload).then((saved: Object) => {
      res.status(202).json({
        data: saved
      });
    });
  });

  router.get('/:objId', (req: Request, res: Response) => {
    console.log('what');
    getOneById(entity, req.params[`objId`]).then((obj: Object) => {
      const data = {};
      data[entity] = obj;
      res.status(200).json(data);
    }).catch(err => {
      console.error(err);
      res.status(404);
    });
  });

  return router;
};

// function getNewObject(entity: string): any {
//   switch (entity) {
//     case 'skill':
//       return new Skill();
//     case 'story':
//       return new Story();
//   }
// }

function validatePayload(entity: string, payload: any): Boolean {
  switch (entity) {
    case 'skill':
      if (!payload.name) {
        return false;
      }
      break;
    case 'story':
      break;
  }
  return true;
}
