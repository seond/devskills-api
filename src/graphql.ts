
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import { getOneById as getSkillById, getAll as getSkills } from './model/skill';
import { getOneById as getStoryById, getAll as getStories } from './model/story';

const schema = buildSchema(`
  type Query {
    hello: String
    skills: [Skill!]!
    skill(id: ID!): Skill
    stories: [Story!]!
    story(id: ID!): Story
  }

  type Skill {
    id: ID!
    name: String
    stories: [Story!]
  }

  type Story {
    id: ID!
    sentence: String
    skills: [Skill!]
  }
`);

const root = {
  hello: () => {
    return 'Hello world';
  },
  skills: () => {
    return getSkills(true);
  },
  stories: () => {
    return getStories(true);
  },
  skill: (args) => {
    return getSkillById(args.id, true);
  },
  story: (args) => {
    return getStoryById(args.id, true);
  },
  Skill: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
    stories: (parent) => parent.stories
  },
  Story: {
    id: (parent) => parent.id,
    sentence: (parent) => parent.sentence,
    skills: (parent) => parent.skills
  }
};

export const middleware = graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
});
