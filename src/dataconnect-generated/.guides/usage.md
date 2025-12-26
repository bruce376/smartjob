# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, getMovies, addMovieToList, getListsForUser } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation GetMovies: 
const { data } = await GetMovies(dataConnect);

// Operation AddMovieToList:  For variables, look at type AddMovieToListVars in ../index.d.ts
const { data } = await AddMovieToList(dataConnect, addMovieToListVars);

// Operation GetListsForUser: 
const { data } = await GetListsForUser(dataConnect);


```