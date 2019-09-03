'use strict'

import { Skill, getOneById as getSkillById, getAll as getSkills } from '../model/skill';
import { Story, getOneById as getStoryById, getAll as getStories } from '../model/story';
import { Skill as SkillEntity } from '../model/entity/skill';
import { Story as StoryEntity } from '../model/entity/story';

const typeMap = {
  skill: SkillEntity,
  story: StoryEntity
};

export function createEntity(entity: string, userId: string, payload: Object): Promise<Object> {
  const obj = getNewObject(entity, userId, payload);
  return obj.save();
}

export function updateEntityById(entity: string, userId: string, objId: string, payload: Object): Promise<Object> {
  return getOneById(entity, userId, objId).then((obj: Skill | Story) => {
    obj.setPropertiesFromPayload(userId, payload);
    return obj.save();
  });
}

export function getAll(entity: string, userId: string, cascade: boolean = false): Promise<Object> {
  switch (entity) {
    case 'skill':
      return getSkills(userId, cascade);
    case 'story':
      return getStories(userId, cascade);
  }
}

export function getOneById(entity: string, userId: string, objId: string, cascade: boolean = false): Promise<Object> {
  switch (entity) {
    case 'skill':
      return getSkillById(userId, objId, cascade);
    case 'story':
      return getStoryById(userId, objId, cascade);
  }
}

function getNewObject(entity: string, userId: string, payload: any): any {
  switch (entity) {
    case 'skill':
      return new Skill(userId, payload);
    case 'story':
      return new Story(userId, payload);
  }
}

export function deleteEntityById(entity: string, userId: string, objId: string): Promise<Object> {
  return getOneById(entity, userId, objId).then((obj: Skill | Story) => {
    return obj.delete();
  });
}
