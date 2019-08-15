'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Skill as Entity } from './entity/skill';
import { Story, getOneById as getStoryById } from './story';
import { SkillStory } from './entity/skillstory';

export class Skill {
  id: ObjectID;
  name: string;
  stories: Story[];
  dbObject: Entity;

  constructor(payload?: any) {
    if (payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
    this.stories = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    if (dbObject.name) {
      this.name = dbObject.name;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if (payload.name) {
      this.name = payload.name;
    }
  }

  addStory(story: Story) {
    for (let i = 0; i < this.stories.length; i++) {
      if (this.stories[i].id.toString() === story.id.toString()) {
        return;
      }
    }
    this.stories.push(story);
    story.addSkill(this);
  }

  save(): Promise<Object> {
    let _conn;
    return connection.then((conn: Connection) => {
      _conn = conn;
      if (this.id) {
        // Delete all the relations and start over. Very primitive way, just, just, just for now.
        // Later, it will modify how it is already stored.
        return conn.manager.delete(SkillStory, {
          skillId: this.id.toString()
        }).then((rt) => {
          const links = this.stories.map((story: Story) => {
            const link = new SkillStory();
            link.skillId = this.id.toString();
            link.storyId = story.id.toString();
            return link;
          });
          return conn.manager.save(links);
        });
      }
    }).then(() => {
      this.dbObject.name = this.name; // It's here for now but will be moved
      return _conn.manager.save(this.dbObject);
    });
  }

  delete(): Promise<Object> {
    return connection.then((conn: Connection) => {
      return conn.manager.delete(SkillStory, {
        skillId: this.id.toString()
      }).then(() => conn);
    }).then((conn: Connection) => {
      return conn.manager.remove(this.dbObject);
    });
  }
}

export function getOneById(id: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.findOne(Entity, id)]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObject = values[1];
      let obj = new Skill();
      obj.setPropertiesFromDbObject(dbObject);

      if (cascade) {
        return conn.manager.find(SkillStory, { skillId: id })
          .then((relations: SkillStory[]) => {
            let promises = relations.map(relation => {
              return getStoryById(relation.storyId);
            });
            return Promise.all(promises);
          }).then((stories: Story[]) => {
            stories.forEach((story: Story) => {
              obj.stories.push(story);
            });
            return obj;
          });
      } else {
        return obj;
      }
    });
}

export function getAll(cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.find(Entity)]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObjects = values[1];

      if (!dbObjects) {
        return null;
      }

      if (cascade) {
        let promises = dbObjects.map(dbObject => {
          return conn.manager.find(SkillStory, { skillId: dbObject.id.toString() })
            .then((relations: SkillStory[]) => {
              return Promise.all([dbObject, ...(relations.map(relation => {
                return getStoryById(relation.storyId);
              }))]);
            });
        });

        return Promise.all(promises).then((cascaded) => {
          return cascaded.map((items: any[]) => {
            let obj = new Skill();
            obj.setPropertiesFromDbObject(items[0]);
            for (let i = 1; i < items.length; i++) {
              obj.stories.push(items[i]);
            }
            return obj;
          });
        });
      } else {
        return dbObjects.map(dbObject => {
          let obj = new Skill();
          obj.setPropertiesFromDbObject(dbObject);
          return obj;
        });
      }
    });
}

export function getExistingOrCreateNewByName(name: String): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.find('skill', { name })]))
    .then((values: any[]) => {
      let conn = values[0];
      let result = values[1];

      if (result && result.length > 0) {
        return result;
      }

      let obj = new Skill({
        name
      });
      return obj.save();
    });
}