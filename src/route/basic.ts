'use strict'

import { Response, Request, Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createEntity, deleteEntityById, getAll, getOneById, updateEntityById } from '../handler/common';

import { pluckDbObject } from '../common/helpers';

// basicRouterFactory creates a router for a given entity
// which creates a new object/gets all objects/gets one object with a given ID and does all basic data actions
// This module works only for pre-considered entities.
export function basicRouterFactory(entity: string, router?: Router): Router {
  if (!router) {
    router = new Router();
  }
  router.use(authenticate);

  router.get('/', (req: Request, res: Response) => {
    getAll(entity, req.user.userId, true).then(pluckDbObject).then((objs: Object[]) => {
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

    createEntity(entity, req.user.userId, payload).then(pluckDbObject).then((saved: Object) => {
      res.status(202).json({
        data: saved
      });
    });
  });

  router.get('/:objId', (req: Request, res: Response) => {
    getOneById(entity, req.user.userId, req.params['objId'], true).then(pluckDbObject).then((obj: Object) => {
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

    updateEntityById(entity, req.user.userId, req.params['objId'], payload).then(pluckDbObject).then((saved: Object) => {
      res.status(204).json({
        data: saved
      });
    });
  });

  router.delete('/:objId', (req: Request, res: Response) => {
    deleteEntityById(entity, req.user.userId, req.params['objId']).then(() => {
      res.status(200).send();
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
    case 'chapter':
      if (!payload.title || !payload.type) {
        return false;
      }
  }
  return true;
}
