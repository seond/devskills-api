'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Chapter as Entity } from './entity/chapter';
import { Skill, getOneById as getSkillById } from './skill';
import { Story, getOneById as getStoryById } from './story';
import { SkillChapter as SkillChapterEntity } from './entity/skillchapter';
import { Skill as SkillEntity } from './entity/skill';
import { Story as StoryEntity } from './entity/story';
import { ILink } from '../interface/link';

export class Chapter {
  id: ObjectID;
  owner: string;
  title: string;
  type: string;
  link: ILink;
  skills: Skill[];
  stories: Story[];
  dbObject: Entity;

  constructor(userId?: string, payload?: any) {
    if (userId && payload) {
      this.setPropertiesFromPayload(userId, payload);
    }
    this.dbObject = new Entity();
    this.skills = [];
    this.stories = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    this.owner = dbObject.owner;
    this.title = dbObject.title;
    this.type = dbObject.type;
    this.link = dbObject.link;
  }

  setPropertiesFromPayload(userId: string, payload: any) {
    this.owner = userId;
    this.title = payload.title;
    this.type = payload.type;
    this.link = payload.link;
  }

  addSkill(skill: Skill) {
    for (let i = 0; i < this.skills.length; i++) {
      if (this.skills[i].id.toString() == skill.id.toString()) {
        return;
      }
    }
    this.skills.push(skill);
  }

  addStory(story: Story) {
    for (let i = 0; i < this.stories.length; i++) {
      if (this.stories[i].id.toString() == story.id.toString()) {
        return;
      }
    }
    this.stories.push(story);
  }

  removeSkill(skill: Skill): boolean {
    for (let i = 0; i < this.skills.length; i++) {
      if (this.skills[i].id.toString() === skill.id.toString()) {
        this.skills.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      this.dbObject.owner = this.owner;
      this.dbObject.title = this.title;
      this.dbObject.type = this.type;
      this.dbObject.link = this.link;
      return Promise.all([conn, conn.manager.save(this.dbObject)]);
    }).then((values: any[]) => {
      let conn = values[0];
      let saved = values[1];

      return conn.manager.find(SkillChapterEntity, {
        chapterId: saved.id.toString()
      }).then((relations: SkillChapterEntity[]) => {
        let skillsToUpdate = [];
        for (let i = 0; i < this.skills.length; i++) {
          let j;
          for (j = 0; j < relations.length; j++) {
            if (this.skills[i].id.toString() === relations[j].skillId) {
              break;
            }
          }
          if (j === relations.length) {
            let link = new SkillChapterEntity();
            link.chapterId = saved.id.toString();
            link.skillId = this.skills[i].id.toString();
            skillsToUpdate.push(conn.manager.save(link));
          }
        }
        for (let i = 0; i < relations.length; i++){
          let j;
          for (j = 0; j < this.skills.length; j++) {
            if (relations[i].skillId === this.skills[j].id.toString()) {
              break;
            }
          }
          if (j === this.skills.length) {
            skillsToUpdate.push(conn.manager.delete(SkillChapterEntity, {
              chapterId: saved.id.toString(),
              skillId: relations[i].skillId
            }));
          }
        }
        return Promise.all(skillsToUpdate);
      }).then(() => {
        return saved;
      });
    });
  }

  delete(): Promise<Object> {
    return connection.then((conn: Connection) => {
      return conn.manager.delete(SkillChapterEntity, {
        chapterId: this.id.toString()
      }).then(() => conn);
    }).then((conn: Connection) => {
      return conn.manager.delete(Story, {
        chapterId: this.id.toString()
      }).then(() => conn);
    }).then((conn: Connection) => {
      return conn.manager.remove(this.dbObject);
    });
  }
}

export function getOneById(userId: string, id: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.findOne(Entity, id)]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObject = values[1];
      if (!dbObject && dbObject.owner !== userId) {
        return null;
      }

      let obj = new Chapter();
      obj.setPropertiesFromDbObject(dbObject);

      if (cascade) {
        let promise_skills: Promise<Object[]> = conn.manager.find(SkillChapterEntity, { chapterId: id })
          .then((relations: SkillChapterEntity[]) => {
            let promises: Promise<Object>[] = relations.map(relation => {
              return getSkillById(userId, relation.skillId);
            });
            return Promise.all(promises);
          });
        let promise_stories: Promise<Object[]> = conn.manager.find(StoryEntity, { chapterId: id });

        return Promise.all([promise_skills, promise_stories]).then((values: any) => {
          let skills = values[0];
          let stories = values[1];

          skills.forEach((skill: Skill) => {
            obj.skills.push(skill);
          });

          stories.forEach((story: Story) => {
            obj.stories.push(story);
          });

          return obj as any;
        });
      } else {
        return obj;
      }
    }).catch(error => {
      console.error(error);
    });
}

export function getAll(userId: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.find(Entity, { owner: userId })]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObjects = values[1];

      if (!dbObjects) {
        return null;
      }

      if (cascade) {
        let promise_skills = dbObjects.map(dbObject => {
          return conn.manager.find(SkillChapterEntity, { chapterId: dbObject.id.toString() })
            .then((relations: SkillChapterEntity[]) => {
              return Promise.all(relations.map(relation => {
                return getSkillById(userId, relation.skillId);
              }));
            });
        });
        let promise_stories = dbObjects.map(dbObject => {
          return conn.manager.find(StoryEntity, { chapterId: dbObject.id.toString() });
        });

        return Promise.all([...promise_skills, ...promise_stories]).then((cascaded) => {
          return dbObjects.map((dbObject, idx) => {
            let obj = new Chapter();
            obj.setPropertiesFromDbObject(dbObject);
            let skills = cascaded[idx];
            if (skills) {
              for (let i = 0; i < skills.length; i++) {
                obj.skills.push(skills[i]);
              }
            }

            let stories = cascaded[dbObjects.length + idx];
            if (stories) {
              for (let i = 0; i < stories.length; i++) {
                obj.stories.push(stories[i]);
              }
            }
            return obj;
          });
        });
      } else {
        return dbObjects.map(dbObject => {
          let obj = new Chapter();
          obj.setPropertiesFromDbObject(dbObject);
          return obj;
        });
      }
    });
}
