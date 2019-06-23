'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Story as Entity } from './entity/story';
import { Skill } from './skill';
import { SkillStory } from './entity/skillstory';

export class Story {
  id: ObjectID;
  sentence: string;
  skills: Skill[];
  dbObject: Entity;

  constructor(payload?: any) {
    if(payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
    this.skills = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    if(dbObject.sentence) {
      this.sentence = dbObject.sentence;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if(payload.sentence) {
      this.sentence = payload.sentence;
    }
  }

  addSkill(skill: Skill) {
    for(let i = 0; i < this.skills.length; i++) {
      if(this.skills[i].id == skill.id) {
        return;
      }
    }
    this.skills.push(skill);
    skill.addStory(this);
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      // Delete all the relations and start over. Very primitive way, just, just, just for now.
      // Later, it will modify how it is already stored.
      return conn.manager.delete(SkillStory, {
        storyId: this.id.toString()
      }).then(() => {
        const links = this.skills.map((skill: Skill) => {
          const link = new SkillStory();
          link.storyId = this.id.toString();
          link.skillId = skill.id.toString();
          return link;
        });
        return conn.manager.save(links);
      }).then(() => {
        this.dbObject.sentence = this.sentence; // It's here for now but will be moved
        return conn.manager.save(this.dbObject);
      });
    });
  }
}

export function getOneById(id: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.findOne(Entity, id))
    .then((dbObject: Entity) => {
      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);
      return obj;
    });
}
