'use strict'

import { Router } from 'express';
import { basicRouterFactory } from './basic';

export const router = new Router();

const skillRouter = basicRouterFactory('skill');
// Register additional skill routes
router.use('/skill', skillRouter);

const storyRouter = basicRouterFactory('story');
// Register additional story routes
router.use('/story', storyRouter);
