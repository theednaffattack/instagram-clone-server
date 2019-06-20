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

** If you are using typeorm with MSSQL, and want to use `take` or `limit`, you need to use order as well or you will receive the following error: `'Invalid usage of the option NEXT in the FETCH statement.'`

```javascript
userRepository.find({ 
    order: { 
        columnName: 'ASC' 
        }, 
    skip: 0, 
    take: 10 
})
```

#### `cache`

- Enables or disables query result caching. See [caching](https://github.com/typeorm/typeorm/blob/master/docs/caching.md) for more information and options.

```javascript
userRepository.find({
    cache: true
})
```

#### `lock`

Enables locking mechanism for query. Can be used only in `findOne` method. `lock` is an object which can be defined as:

```javascript
{ mode: "optimistic", version: number|Date }
```

or

```javascript
{ mode: "pessimistic_read"|"pessimistic_write"|"dirty_read" }
```

for example:

```javascript
userRepository.findOne(1, {
    lock: { mode: "optimistic", version: 1 }
})
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
import {Not} from "typeorm";

const loadedPosts = await connection.getRepository(Post).find({
    title: Not("About #1")
})
```

will execute following query:

```javascript
SELECT * FROM "post" WHERE "title" != 'About #1'
```

#### `LessThan`

```javascript
import {LessThan} from "typeorm";

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
import {LessThanOrEqual} from "typeorm";

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
import {MoreThan} from "typeorm";

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
import {MoreThan} from "typeorm";

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
import {Equal} from "typeorm";

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
import {Like} from "typeorm";

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
import {Between} from "typeorm";

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
import {In} from "typeorm";

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
import {Any} from "typeorm";

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
import {IsNull} from "typeorm";

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
import {Raw} from "typeorm";

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
