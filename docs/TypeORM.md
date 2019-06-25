# TypeORM

[TOC]

## Find Options

### [Basic Find Options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#basic-options)

All repository and manager `find` methods accept special options you can use to query data you need without using `QueryBuilder`:

#### `select`

indicates which properties of the main object must be selected

```
userRepository.find({ select: ["firstName", "lastName"] });
```

#### `relations`

relations needs to be loaded with the main entity. Sub-relations can also be loaded (shorthand for join and leftJoinAndSelect)

```
userRepository.find({ relations: ["profile", "photos", "videos"] });
userRepository.find({ relations: ["profile", "photos", "videos", "videos.video_attributes"] });
```

#### `join`

joins needs to be performed for the entity. Extended version of "relations".

```
userRepository.find({
    join: {
        alias: "user",
        leftJoinAndSelect: {
            profile: "user.profile",
            photo: "user.photos",
            video: "user.videos"
        }
    }
});
```

#### `where`

Simple conditions by which entity should be queried.

```
userRepository.find({ where: { firstName: "Timber", lastName: "Saw" } });
```

Querying a column from an embedded entity should be done with respect to the hierarchy in which it was defined. Example:

```
userRepository.find({ where: { name: { first: "Timber", last: "Saw" } } });
```

Querying with OR operator:

```
userRepository.find({
  where: [
    { firstName: "Timber", lastName: "Saw" },
    { firstName: "Stan", lastName: "Lee" }
  ]
});
```

will execute following query:

```
SELECT * FROM "user" WHERE ("firstName" = 'Timber' AND "lastName" = 'Saw') OR ("firstName" = 'Stan' AND "lastName" = 'Lee')
```

#### `order`

selection order.

```
userRepository.find({
    order: {
        name: "ASC",
        id: "DESC"
    }
});
```

`find` methods which return multiple entities (`find`, `findAndCount`, `findByIds`) also accept following options:

#### `skip`

offset (paginated) from where entities should be taken.

```javascript
userRepository.find({
  skip: 5
});
```

#### `take`

limit (paginated) - max number of entities that should be taken.

```javascript
userRepository.find({
  take: 10
});
```

\*\* If you are using typeorm with MSSQL, and want to use `take` or `limit`, you need to use order as well or you will receive the following error: `'Invalid usage of the option NEXT in the FETCH statement.'`

```javascript
userRepository.find({
  order: {
    columnName: "ASC"
  },
  skip: 0,
  take: 10
});
```

#### `cache`

- Enables or disables query result caching. See [caching](https://github.com/typeorm/typeorm/blob/master/docs/caching.md) for more information and options.

```javascript
userRepository.find({
  cache: true
});
```

#### `lock`

Enables locking mechanism for query. Can be used only in `findOne` method. `lock` is an object which can be defined as:

```javascript
{ mode: "optimistic", version: number|Date }
```

or

```javascript
{
  mode: "pessimistic_read" | "pessimistic_write" | "dirty_read";
}
```

for example:

```javascript
userRepository.findOne(1, {
  lock: { mode: "optimistic", version: 1 }
});
```

Complete example of find options:

```javascript
userRepository.find({
  select: ["firstName", "lastName"],
  relations: ["profile", "photos", "videos"],
  where: {
    firstName: "Timber",
    lastName: "Saw"
  },
  order: {
    name: "ASC",
    id: "DESC"
  },
  skip: 5,
  take: 10,
  cache: true
});
```

### [Advanced Find Options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#advanced-options)

#### `Not`

```javascript
import { Not } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: Not("About #1")
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" != 'About #1'
```

#### `LessThan`

```javascript
import { LessThan } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: LessThan(10)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" < 10
```

#### `LessThanOrEqual`

```javascript
import { LessThanOrEqual } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: LessThanOrEqual(10)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" <= 10
```

#### `MoreThan`

```javascript
import { MoreThan } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: MoreThan(10)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" > 10
```

#### `MoreThanOrEqual`

```javascript
import { MoreThan } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: MoreThan(10)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" > 10
```

#### `Equal`

```javascript
import { Equal } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: Equal("About #2")
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" = 'About #2'
```

#### `Like`

```javascript
import { Like } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: Like("%out #%")
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" LIKE '%out #%'
```

#### `Between`

```javascript
import { Between } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: Between(1, 10)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" BETWEEN 1 AND 10
```

#### `In`

```javascript
import { In } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: In(["About #2", "About #3"])
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" IN ('About #2','About #3')
```

#### `Any`

```javascript
import { Any } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: Any(["About #2", "About #3"])
});
```

will execute following query (Postgres notation):

```javascript
SELECT * FROM "post" WHERE "title" = ANY(['About #2','About #3'])
```

#### `IsNull`

```javascript
import { IsNull } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  title: IsNull()
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" IS NULL
```

#### `Raw`

```javascript
import { Raw } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: Raw("dislikes - 4")
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "likes" = "dislikes" - 4
```

In the simplest case, a raw query is inserted immediately after the equal symbol. But you can also completely rewrite the comparison logic using the function.

```javascript
import { Raw } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  currentDate: Raw(alias => `${alias} > NOW()`)
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "currentDate" > NOW()
```

Note: beware with Raw operator. It executes pure SQL from supplied expression and should not contain a user input, otherwise it will lead to SQL-injection.

Also you can combine these operators with Not operator:

```javascript
import { Not, MoreThan, Equal } from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
  likes: Not(MoreThan(10)),
  title: Not(Equal("About #2"))
});
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE NOT("likes" > 10) AND NOT("title" = 'About #2')
```



## [Many-to-one / one-to-many relations](https://github.com/typeorm/typeorm/blob/master/docs/many-to-one-one-to-many-relations.md#many-to-one--one-to-many-relations)

Many-to-one / one-to-many is a relation where A contains multiple instances of B, but B contains only one instance of A.
Let's take for example `User` and `Photo` entities.
User can have multiple photos, but each photo is owned by only one single user.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(type => User, user => user.photos)
  user: User;
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Photo } from "./Photo";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
```

Here we added `@OneToMany` to the `photos` property and specified the target relation type to be `Photo`.
You can omit `@JoinColumn` in a `@ManyToOne` / `@OneToMany` relation.
`@OneToMany` cannot exist without `@ManyToOne`.
If you want to use `@OneToMany`, `@ManyToOne` is required.
Where you set `@ManyToOne` - its related entity will have "relation id" and foreign key.

This example will produce following tables:

```shell
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| url         | varchar(255) |                            |
| userId      | int(11)      |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

Example how to save such relation:

```typescript
const photo1 = new Photo();
photo1.url = "me.jpg";
await connection.manager.save(photo1);

const photo2 = new Photo();
photo2.url = "me-and-bears.jpg";
await connection.manager.save(photo2);

const user = new User();
user.name = "John";
user.photos = [photo1, photo2];
await connection.manager.save(user);
```

or alternative you can do:

```typescript
const user = new User();
user.name = "Leo";
await connection.manager.save(user);

const photo1 = new Photo();
photo1.url = "me.jpg";
photo1.user = user;
await connection.manager.save(photo1);

const photo2 = new Photo();
photo2.url = "me-and-bears.jpg";
photo2.user = user;
await connection.manager.save(photo2);
```

With cascades enabled you can save this relation with only one `save` call.

To load a user with photos inside you must specify the relation in `FindOptions`:

```typescript
const userRepository = connection.getRepository(User);
const users = await userRepository.find({ relations: ["photos"] });

// or from inverse side

const photoRepository = connection.getRepository(Photo);
const photos = await photoRepository.find({ relations: ["user"] });
```

Or using `QueryBuilder` you can join them:

```typescript
const users = await connection
  .getRepository(User)
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.photos", "photo")
  .getMany();

// or from inverse side

const photos = await connection
  .getRepository(Photo)
  .createQueryBuilder("photo")
  .leftJoinAndSelect("photo.user", "user")
  .getMany();
```

With eager loading enabled on a relation you don't have to specify relation or join it - it will ALWAYS be loaded automatically.

## [Relations FAQ](https://github.com/typeorm/typeorm/blob/master/docs/relations-faq.md#how-to-load-relations-in-entities)

- [How to create self referencing relation](https://github.com/typeorm/typeorm/blob/master/docs/relations-faq.md#how-to-create-self-referencing-relation)
- [How to use relation id without joining relation](https://github.com/typeorm/typeorm/blob/master/docs/relations-faq.md#how-to-use-relation-id-without-joining-relation)
- [How to load relations in entities](https://github.com/typeorm/typeorm/blob/master/docs/relations-faq.md#how-to-load-relations-in-entities)
- [Avoid relation property initializers](https://github.com/typeorm/typeorm/blob/master/docs/relations-faq.md#avoid-relation-property-initializers)

### How to create self referencing relation

Self-referencing relations are relations which have a relation to themself. This is useful when you are storing entities in a tree-like structures. Also "adjacency list" pattern is implemented used self-referenced relations. For example, you want to create categories tree in your application. Categories can nest categories, nested categories can nest other categories, etc. Self-referencing relations come handy here. Basically self-referencing relations are just regular relations that targets entity itself. Example:

```js
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";

@Entity()
export class Category {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column()
    text: string;
    
    @ManyToOne(type => Category, category => category.childCategories)
    parentCategory: Category;
    
    @OneToMany(type => Category, category => category.parentCategory)
    childCategories: Category[];
    
}
```

### How to use relation id without joining relation

Sometimes you want to have in your object id of the related object without loading it. For example:

```js
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Profile {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    gender: string;
    
    @Column()
    photo: string;
    
}
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {Profile} from "./Profile";

@Entity()
export class User {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @OneToOne(type => Profile)
    @JoinColumn()
    profile: Profile;
    
}
```

When you load a user without `profile` joined you won't have any information about profile in your user object, even profile id:

```js
User {
  id: 1,
  name: "Umed"
}
```

But sometimes you want to know what is the "profile id" of this user without loading the whole profile for this user. To do this you just need to add another property to your entity with `@Column` named exactly as the column created by your relation. Example:

```js
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {Profile} from "./Profile";

@Entity()
export class User {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column({ nullable: true })
    profileId: number;
    
    @OneToOne(type => Profile)
    @JoinColumn()
    profile: Profile;
    
}
```

That's all. Next time you load a user object it will contain a profile id:

```js
User {
  id: 1,
  name: "Umed",
  profileId: 1
}
```

### How to load relations in entities

The easiest way to load your entity relations is to use `relations` option in `FindOptions`:

```js
const users = await connection.getRepository(User).find({ relations: ["profile", "photos", "videos"] });
```

Alternative and more flexible way is to use `QueryBuilder`:

```js
const user = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.profile", "profile")
    .leftJoinAndSelect("user.photos", "photo")
    .leftJoinAndSelect("user.videos", "video")
    .getMany();
```

Using `QueryBuilder` you can do `innerJoinAndSelect` instead of `leftJoinAndSelect` (to learn the difference between `LEFT JOIN` and `INNER JOIN` refer to your SQL documentation), you can join relation data by a condition, make ordering, etc.

Learn more about [`QueryBuilder`](https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md).

### Avoid relation property initializers

Sometimes it is useful to initialize your relation properties, for example:

```js
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import {Category} from "./Category";

@Entity()
export class Question {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column()
    text: string;
    
    @ManyToMany(type => Category, category => category.questions)
    @JoinTable()
    categories: Category[] = []; // see = [] initialization here
    
}
```

However in TypeORM entities it may cause problems. To understand the problem, let's first try to load a Question entity WITHOUT the initializer set. When you load a question it will return an object like this:

```js
Question {
    id: 1,
    title: "Question about ..."
}
```

Now when you save this object `categories` inside it won't be touched - because it is unset.

But if you have initializer, the loaded object will look like as follow:

```js
Question {
    id: 1,
    title: "Question about ...",
    categories: []
}
```

When you save the object it will check if there are any categories in the database bind to the question - and it will detach all of them. Why? Because relation equal to `[]` or any items inside it will be considered like something was removed from it, there is no other way to check if an object was removed from entity or not.

Therefore, saving an object like this will bring you problems - it will remove all previously set categories.

How to avoid this behaviour? Simply don't initialize arrays in your entities. Same rule applies to a constructor - don't initialize it in a constructor as well.