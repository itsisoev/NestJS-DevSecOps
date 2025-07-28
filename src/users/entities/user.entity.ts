import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  githubId: string;

  @Column()
  username: string;

  @Column({ type: 'json', nullable: true })
  emails?: { value: string }[];

  @Column({ type: 'json', nullable: true })
  photos?: { value: string }[];

  @Column({ nullable: true })
  githubAccessToken: string;
}
