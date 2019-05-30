'use strict'

import { Response, Router } from 'express';
import { Connection } from 'typeorm';
import { connection } from './database';

import { Skill } from './entity/Skill';

const router = new Router();

router.route('/skill')
  .get((_: any, res: Response) => {
    res.send('got skill');
  })
  .post((_: any, res: Response) => {
    connection.then((conn: Connection) => {
      const skill: Skill = new Skill();

      skill.name = "Talking";

      conn.manager.save(skill).then(() => {
        res.send('Skill added.');
      });
    })
  });

export default router;
