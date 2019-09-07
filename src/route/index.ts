'use strict'

import { Response, Request, Router } from 'express';
import { basicRouterFactory } from './basic';
import { createEntity, getOneById } from '../handler/common';

import { Skill } from '../model/skill';
import { Story } from '../model/story';
import { Chapter } from '../model/chapter';

export const router = new Router();

const skillRouter = basicRouterFactory('skill');
router.use('/skill', skillRouter);

const storyRouter = basicRouterFactory('story');
router.use('/story', storyRouter);

const chapterRouter = basicRouterFactory('chapter');

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

chapterRouter.post('/:chapterId/story', (req: Request, res: Response) => {
  getOneById('chapter', req.user.userId, req.params.chapterId).then((chapter: Chapter) => {
    const payload = req.body;
    payload.chapterId = chapter.id.toString();
    return createEntity('story', req.user.userId, payload).then((story: Story) => {
      return story;
    });
  }).then((obj: Story) => {
    res.status(202).json(obj);
  });
});
router.use('/chapter', chapterRouter);
