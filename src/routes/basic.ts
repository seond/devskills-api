'use strict'

import { Response, Request, Router } from 'express';
import { Connection } from 'typeorm';
import { connection } from '../database';

import { Skill } from '../entity/Skill';
import { Story } from '../entity/Story';

const typeMap = {
  skill: Skill,
  story: Story
};

export function basicRouterFactory(entity: string): Router {
  const router = new Router();

  router.get('/', (_: any, res: Response) => {
    res.send('got ' + entity);
  });

  router.post('/', (req: Request, res: Response) => {
    const payload = req.body;

    if (!validatePayload(entity, payload)) {
      res.status(400).send();
    }

    connection.then((conn: Connection) => {
      const obj = getNewObject(entity);

      Object.keys(payload).forEach((key: string) => {
        obj[key] = payload[key];
      });

      conn.manager.save(obj).then((saved: any) => {
        res.status(202).json({
          data: saved
        });
      });
    });
  });

  router.get('/:objId', (req: Request, res: Response) => {
    connection.then((conn: Connection) => {
      conn.manager.findOne(typeMap[entity], req.params[`objId`]).then((obj: any) => {
        const data = {};
        data[entity] = obj;
        res.status(200).json(data);
      });
    });
  });

  return router;
};

function getNewObject(entity: string): any {
  switch (entity) {
    case 'skill':
      return new Skill();
    case 'story':
      return new Story();
  }
}

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
