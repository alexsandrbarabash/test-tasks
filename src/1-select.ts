type User = {
  id: string;
  name: string;
  posts: Post[];
};

type Post = {
  id: string;
  text: string;
  user: User;
};

type Select<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? Select<U>
    : boolean | Select<T[K]>;
};

const userSelect: Select<User> = {
  id: true,
  name: true,
  posts: {
    id: true,
    text: true,
    user: {
      id: true,
    },
  },
};

const postSelect: Select<Post> = {
  id: true,
  text: true,
  user: {
    id: true,
    name: true,
  },
};
