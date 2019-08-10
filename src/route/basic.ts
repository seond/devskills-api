'use strict'

import { Response, Request, Router } from 'express';
import { createEntity, getAll, getOneById, updateEntityById } from '../handler/common';

import { pluckDbObject } from '../common/helpers';

// basicRouterFactory creates a router for a given entity
// which creates a new object/gets all objects/gets one object with a given ID and does all basic data actions
// This module works only for pre-considered entities.
export function basicRouterFactory(entity: string): Router {
  const router = new Router();

  router.get('/', (_: any, res: Response) => {
    getAll(entity).then(pluckDbObject).then((objs: Object[]) => {
      const data = {};
      data[entity] = objs;
      res.status(200).json(data);
    })
  });

  router.post('/', (req: Request, res: Response) => {
    const payload = req.body;

    if (!validatePayload(entity, payload)) {
      res.status(400).send();
    }

    createEntity(entity, payload).then(pluckDbObject).then((saved: Object) => {
      res.status(202).json({
        data: saved
      });
    });
  });

  router.get('/:objId', (req: Request, res: Response) => {
    getOneById(entity, req.params['objId']).then(pluckDbObject).then((obj: Object) => {
      const data = {};
      data[entity] = obj;
      res.status(200).json(data);
    }).catch(err => {
      console.error(err);
      res.status(404);
    });
  });

  router.put('/:objId', (req: Request, res: Response) => {
    const payload = req.body;

    if (!validatePayload(entity, payload)) {
      res.status(400).send();
    }

    updateEntityById(entity, req.params['objId'], payload).then(pluckDbObject).then((saved: Object) => {
      res.status(200).json({
        data: saved
      });
    });
  });

  return router;
};

// TODO : use json validation
function validatePayload(entity: string, payload: any): Boolean {
  switch (entity) {
    case 'skill':
      if (!payload.name) {
        return false;
      }
      break;
    case 'story':
      if (!payload.sentence) {
        return false;
      }
      break;
  }
  return true;
}
