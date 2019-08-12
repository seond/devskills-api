'use strict'

import { Skill, getOneById as getSkillById, getAll as getSkills } from '../model/skill';
import { Story, getOneById as getStoryById, getAll as getStories } from '../model/story';
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

export function updateEntityById(entity: string, objId: string, payload: Object): Promise<Object> {
  return getOneById(entity, objId).then((obj: Skill | Story) => {
    obj.setPropertiesFromPayload(payload);
    return obj.save();
  });
}

export function getAll(entity: string, cascade: boolean = false): Promise<Object> {
  switch (entity) {
    case 'skill':
      return getSkills(cascade);
    case 'story':
      return getStories(cascade);
  }
}

export function getOneById(entity: string, objId: string, cascade: boolean = false): Promise<Object> {
  switch (entity) {
    case 'skill':
      return getSkillById(objId, cascade);
    case 'story':
      return getStoryById(objId, cascade);
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

export function deleteEntityById(entity: string, objId: string): Promise<Object> {
  return getOneById(entity, objId).then((obj: Skill | Story) => {
    return obj.delete();
  });
}
