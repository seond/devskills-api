'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Skill as Entity } from './entity/skill';
import { Story } from './story';
import { SkillStory } from './entity/skillstory';

export class Skill {
  id: ObjectID;
  name: string;
  stories: Story[];
  dbObject: Entity;

  constructor(payload?: any) {
    if(payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
    this.stories = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    if(dbObject.name) {
      this.name = dbObject.name;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if(payload.name) {
      this.name = payload.name;
    }
  }

  addStory(story: Story) {
    for(let i = 0; i < this.stories.length; i++) {
      if(this.stories[i].id == story.id) {
        return;
      }
    }
    this.stories.push(story);
    story.addSkill(this);
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      // Delete all the relations and start over. Very primitive way, just, just, just for now.
      // Later, it will modify how it is already stored.
      return conn.manager.delete(SkillStory, {
        skillId: this.id.toString()
      }).then(() => {
        const links = this.stories.map((story: Story) => {
          const link = new SkillStory();
          link.skillId = this.id.toString();
          link.storyId = story.id.toString();
          return link;
        });
        return conn.manager.save(links);
      }).then(() => {
        this.dbObject.name = this.name; // It's here for now but will be moved
        return conn.manager.save(this.dbObject);
      });
    });
  }
}

export function getOneById(id: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.findOne(Entity, id))
    .then((dbObject: Entity) => {
      let obj = new Skill();
      obj.setPropertiesFromDbObject(dbObject);
      return obj;
    });
}
