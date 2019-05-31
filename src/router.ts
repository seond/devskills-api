'use strict'

import { Response, Request, Router } from 'express';
import { Connection } from 'typeorm';
import { connection } from './database';

import { Skill } from './entity/Skill';
import { Story } from './entity/Story';

const router = new Router();

const typeMap = {
  skill: Skill,
  story: Story
};

['skill', 'story'].forEach((entity: string) => {
  const rtr = new Router();

  rtr.get('/', (_: any, res: Response) => {
    res.send('got ' + entity);
  });

  rtr.post('/', (req: Request, res: Response) => {
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

  rtr.get('/:objId', (req: Request, res: Response) => {
    connection.then((conn: Connection) => {
      // TODO: make it work! not working with this dynamically picked type
      // Using repository should be a solution
      conn.manager.findOne(typeMap[entity], req.params[`${entity}Id`]).then((obj: any) => {
        res.status(200).json({
          data: obj
        });
      });
    });
  });

  router.use(`/${entity}`, rtr);
});

export default router;

function getNewObject(entity: string): any {
  switch (entity) {
    case 'skill':
      return new Skill();
    case 'story':
      return new Story();
  }
}

function validatePayload(entity: string, payload: any): Boolean {
  if (!payload.name) {
    return false;
  }
  return true;
}
