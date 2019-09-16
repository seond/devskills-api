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

chapterRouter.post('/:chapterId/skill/:skillId', (req: Request, res: Response) => {
  getOneById('chapter', req.user.userId, req.params.chapterId, true).then((chapter: Chapter) => {
    return getOneById('skill', req.user.userId, req.params.skillId).then((skill: Skill) => {
      chapter.addSkill(skill);
      return chapter.save();
    });
  }).then((obj: Chapter) => {
    res.status(202).json(obj);
  });
});

chapterRouter.delete('/:chapterId/skill/:skillId', (req: Request, res: Response) => {
  getOneById('chapter', req.user.userId, req.params.chapterId, true).then((chapter: Chapter) => {
    return getOneById('skill', req.user.userId, req.params.skillId).then((skill: Skill) => {
      chapter.removeSkill(skill);
      return chapter.save();
    });
  }).then((obj: Chapter) => {
    res.status(200).json(obj);
  });
});

chapterRouter.post('/:chapterId/story', (req: Request, res: Response) => {
  getOneById('chapter', req.user.userId, req.params.chapterId, true).then((chapter: Chapter) => {
    const payload = req.body;
    payload.chapter = chapter;
    return createEntity('story', req.user.userId, payload).then((story: Story) => {
      return story;
    });
  }).then((obj: Story) => {
    res.status(202).json(obj);
  });
});

chapterRouter.delete('/:chapterId/story/:storyId', (req: Request, res: Response) => {
  getOneById('story', req.user.userId, req.params.storyId).then((story: Story) => {
    return story.delete();
  }).then((obj: Story) => {
    res.status(200).json(obj);
  });
});

router.use('/chapter', chapterRouter);
