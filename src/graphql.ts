
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import { createEntity, deleteEntityById, getOneById, getAll } from './handler/common';

const schema = buildSchema(`
  type Query {
    hello: String
    skills(userId: String!): [Skill!]!
    skill(userId: String!, id: ID!): Skill
    stories(userId: String!): [Story!]!
    story(userId: String!, id: ID!): Story
  }

  type Skill {
    id: ID!
    owner: String
    name: String
    stories: [Story!]
  }

  type Story {
    id: ID!
    owner: String
    sentence: String
    skills: [Skill!]
  }

  input SkillInput {
    name: String
  }

  input StoryInput {
    sentence: String
  }

  type Mutation {
    createSkill(userId: String, input: SkillInput): Skill
    createStory(userId: String, input: StoryInput): Story
    deleteSkillById(userId: String, id: ID): Boolean
    deleteStoryById(userId: String, id: ID): Boolean
  }
`);

const root = {
  hello: () => {
    return 'Hello world';
  },
  skills: args => {
    return getAll('skill', args.userId, true);
  },
  stories: args => {
    return getAll('story', args.userId, true);
  },
  skill: args => {
    return getOneById('skill', args.userId, args.id, true);
  },
  story: args => {
    return getOneById('story', args.userId, args.id, true);
  },
  Skill: {
    id: parent => parent.id,
    owner: parent => parent.owner,
    name: parent => parent.name,
    stories: parent => parent.stories
  },
  Story: {
    id: parent => parent.id,
    owner: parent => parent.owner,
    sentence: parent => parent.sentence,
    skills: parent => parent.skills
  },
  createSkill: (userId, {input}) => {
    return createEntity('skill', userId, input);
  },
  createStory: (userId, {input}) => {
    return createEntity('story', userId, input);
  },
  deleteSkillById: args => {
    return deleteEntityById('skill', args.userId, args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });;
  },
  deleteStoryById: args => {
    return deleteEntityById('story', args.userId, args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
};

export const middleware = graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
});
