import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { ILink } from '../../interface/link';

@Entity()
export class Chapter {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    owner: string;

    @Column()
    title: string;

    @Column()
    type: string;

    @Column()
    link: ILink;
}
