'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Story as Entity } from './entity/story';
import { Skill, getOneById as getSkillById } from './skill';
import { SkillStory } from './entity/skillstory';

import { pluckDbObject } from '../common/helpers';

export class Story {
  id: ObjectID;
  sentence: string;
  skills: Skill[];
  dbObject: Entity;

  constructor(payload?: any) {
    if (payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
    this.skills = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    if (dbObject.sentence) {
      this.sentence = dbObject.sentence;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if (payload.sentence) {
      this.sentence = payload.sentence;
    }
  }

  addSkill(skill: Skill) {
    for (let i = 0; i < this.skills.length; i++) {
      if (this.skills[i].id.toString() == skill.id.toString()) {
        return;
      }
    }
    this.skills.push(skill);
    skill.addStory(this);
  }

  save(): Promise<Object> {
    let _conn;
    return connection.then((conn: Connection) => {
      _conn = conn;
      if (this.id) {
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
        });
      }
    }).then(() => {
      this.dbObject.sentence = this.sentence; // It's here for now but will be moved
      return _conn.manager.save(this.dbObject);
    });
  }
}

export function getOneById(id: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.findOne(Entity, id)]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObject = values[1];
      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);

      if (cascade) {
        return conn.manager.find(SkillStory, { storyId: id })
          .then((relations: SkillStory[]) => {
            let promises = relations.map(relation => {
              return getSkillById(relation.skillId);
            });
            return Promise.all(promises);
          }).then((skills: Skill[]) => {
            skills.forEach((skill: Skill) => {
              obj.skills.push(skill);
            });
            return obj;
          });
      } else {
        return obj;
      }
    }).then(pluckDbObject);
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
          return conn.manager.find(SkillStory, { storyId: dbObject.id.toString() })
            .then((relations: SkillStory[]) => {
              return Promise.all([dbObject, ...(relations.map(relation => {
                return getSkillById(relation.skillId);
              }))]);
            });
        });

        return Promise.all(promises).then((cascaded) => {
          return cascaded.map((items: any[]) => {
            let obj = new Story();
            obj.setPropertiesFromDbObject(items[0]);
            for (let i = 1; i < items.length; i++) {
              obj.skills.push(items[i]);
            }
            return obj;
          });
        });
      } else {
        return dbObjects.map(dbObject => {
          let obj = new Story();
          obj.setPropertiesFromDbObject(dbObject);
          return obj;
        });
      }
    })
    .then(pluckDbObject);
}
