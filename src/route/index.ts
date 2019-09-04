'use strict'

import { Response, Request, Router } from 'express';
import { basicRouterFactory } from './basic';
import { getOneById } from '../handler/common';

import { Skill } from '../model/skill';
import { Chapter } from '../model/chapter';

export const router = new Router();

const skillRouter = basicRouterFactory('skill');
router.use('/skill', skillRouter);

const storyRouter = basicRouterFactory('story');
router.use('/story', storyRouter);

const chapterRouter = basicRouterFactory('chapter');
// Tie an existing chapter to skill
chapterRouter.put('/:chapterId/skill/:skillId', (req: Request, res: Response) => {
  getOneById('chapter', req.user.userId, req.params.chapterId).then((chapter: Chapter) => {
    return getOneById('skill', req.user.userId, req.params.skillId).then((skill: Skill) => {
      chapter.addSkill(skill);
      return chapter.save();
    });
  }).then((obj: Chapter) => {
    res.status(202).json(obj);
  });
});
router.use('/chapter', chapterRouter);
