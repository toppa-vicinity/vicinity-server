import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { ChatRoom } from "./ChatRoom";

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field() // added to expose the field, which other wise we cannot query
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  chatRoom!: ChatRoom;

  @Field()
  @Column()
  sender!: number;

  @Column()
  content!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
