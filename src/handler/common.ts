'use strict'

import { Skill, getOneById as getSkillById } from '../model/skill';
import { Story, getOneById as getStoryById } from '../model/story';
import { Skill as SkillEntity } from '../model/entity/skill';
import { Story as StoryEntity } from '../model/entity/story';

const typeMap = {
  skill: SkillEntity,
  story: StoryEntity
};

export function createEntity(entity: string, payload: Object): Promise<Object> {
  const obj = getNewObject(entity, payload);
  return obj.save();
}

export function getOneById(entity: string, objId: string): Promise<Object> {
  switch (entity) {
    case 'skill':
      return getSkillById(objId);
    case 'story':
      return getStoryById(objId);
  }
}

function getNewObject(entity: string, payload: any): any {
  switch (entity) {
    case 'skill':
      return new Skill(payload);
    case 'story':
      return new Story(payload);
  }
}
