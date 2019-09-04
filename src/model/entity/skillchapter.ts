import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity()
export class SkillChapter {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    skillId: string;

    @Column()
    chapterId: string;
}
