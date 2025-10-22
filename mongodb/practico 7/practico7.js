// 1.  Insertar  5  nuevos usuarios en la colección users.  Para cada nuevo usuario creado,
// insertar al menos un comentario realizado por el usuario en la colección comments.

db.users.findOne();

// {
//   _id: ObjectId('59b99db4cfa9a34dcd7885b6'),
//   name: 'Ned Stark',
//   email: 'sean_bean@gameofthron.es',
//   password: '$2b$12$UREFwsRUoyF0CRqGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
// }

db.users.insertMany([
  {
    name: "user 1",
    email: "user1@gmail.com",
    password: "hashed_pw_user_1",
  },
  {
    name: "user 2",
    email: "user2@gmail.com",
    password: "hashed_pw_user_2",
  },
  {
    name: "user 3",
    email: "user3@gmail.com",
    password: "hashed_pw_user_3",
  },
  {
    name: "user 4",
    email: "user4@gmail.com",
    password: "hashed_pw_user_4",
  },
  {
    name: "user 5",
    email: "user5@gmail.com",
    password: "hashed_pw_user_5",
  },
]);

// {
//   acknowledged: true,
//   insertedIds: {
//     '0': ObjectId('68f3a6f25fbadab6ce544cb1'),
//     '1': ObjectId('68f3a6f25fbadab6ce544cb2'),
//     '2': ObjectId('68f3a6f25fbadab6ce544cb3'),
//     '3': ObjectId('68f3a6f25fbadab6ce544cb4'),
//     '4': ObjectId('68f3a6f25fbadab6ce544cb5')
//   }
// }

db.comments.findOne();

// {
//   _id: ObjectId('5a9427648b0beebeb69579cc'),
//   name: 'Andrea Le',
//   email: 'andrea_le@fakegmail.com',
//   movie_id: ObjectId('573a1390f29313caabcd418c'),
//   text: 'Rem officiis eaque repellendus amet eos doloribus. Porro dolor voluptatum voluptates neque culpa molestias. Voluptate unde nulla temporibus ullam.',
//   date: ISODate('2012-03-26T23:20:16.000Z')
// }

db.movies.findOne({}, { _id: 1 });

// { _id: ObjectId('573a1390f29313caabcd4132') }

db.comments.insertMany([
  {
    name: "user 1",
    email: "user1@gmail.com",
    movie_id: ObjectId("573a1390f29313caabcd4132"),
    text: "comentario",
    date: IsoDate(),
  },
  {
    name: "user 2",
    email: "user2@gmail.com",
    movie_id: ObjectId("573a1390f29313caabcd4132"),
    text: "comentario",
    date: IsoDate(),
  },
  {
    name: "user 3",
    email: "user3@gmail.com",
    movie_id: ObjectId("573a1390f29313caabcd4132"),
    text: "comentario",
    date: IsoDate(),
  },
  {
    name: "user 4",
    email: "user4@gmail.com",
    movie_id: ObjectId("573a1390f29313caabcd4132"),
    text: "comentario",
    date: IsoDate(),
  },
  {
    name: "user 5",
    email: "user5@gmail.com",
    movie_id: ObjectId("573a1390f29313caabcd4132"),
    text: "comentario",
    date: IsoDate(),
  },
]);

// {
//   acknowledged: true,
//   insertedIds: {
//     '0': ObjectId('68f3a7235fbadab6ce544cb6'),
//     '1': ObjectId('68f3a7235fbadab6ce544cb7'),
//     '2': ObjectId('68f3a7235fbadab6ce544cb8'),
//     '3': ObjectId('68f3a7235fbadab6ce544cb9'),
//     '4': ObjectId('68f3a7235fbadab6ce544cba')
//   }
// }

// 2.  Listar el título, año, actores (cast), directores y rating de las 10 películas con mayor
// rating (“imdb.rating”) de la década del 90. ¿Cuál es el valor del rating de la película que
// tiene mayor rating? (Hint: Chequear que el valor de “imdb.rating” sea de tipo “double”).

db.movies
  .find(
    { "imdb.rating": { $type: "double" }, year: { $gte: 1990, $lt: 2000 } },
    { title: 1, year: 1, directors: 1, "imdb.rating": 1 },
  )
  .sort({ "imdb.rating": -1 })
  .limit(10);

// 3.  Listar  el  nombre,  email,  texto  y  fecha  de  los  comentarios  que  la  película  con  id
// (movie_id) ObjectId("573a1399f29313caabcee886") recibió entre los años 2014 y 2016
// inclusive.  Listar  ordenados  por  fecha.  Escribir  una  nueva  consulta  (modificando  la
// anterior) para responder ¿Cuántos comentarios recibió?

db.comments.aggregate([
  { $match: { movie_id: ObjectId("573a1399f29313caabcee886") } },
  { $addFields: { year: { $year: "$date" } } },
  { $match: { year: { $gte: 2014, $lte: 2016 } } },
  { $sort: { year: -1 } },
  { $project: { _id: 0, name: 1, email: 1, text: 1, date: 1 } },
]);

db.comments.aggregate([
  { $match: { movie_id: ObjectId("573a1399f29313caabcee886") } },
  { $addFields: { year: { $year: "$date" } } },
  { $match: { year: { $gte: 2014, $lte: 2016 } } },
  { $sort: { year: -1 } },
  { $count: "total" },
]);

// 4.  Listar el nombre, id de la película, texto y fecha de los 3 comentarios más recientes
// realizados por el usuario con email patricia_good@fakegmail.com.

db.comments.aggregate([
  { $match: { email: "patricia_good@fakegmail.com" } },
  {
    $lookup: {
      from: "movies",
      localField: "movie_id",
      foreignField: "_id",
      as: "movies",
    },
  },
  { $project: { "movies.title": 1, movie_id: 1, text: 1, date: 1 } },
  { $sort: { date: -1 } },
  { $limit: 3 },
]);

// 5.  Listar el título, idiomas (languages), géneros, fecha de lanzamiento (released) y número
// de votos (“imdb.votes”) de las películas de géneros Drama y Action (la película puede
// tener otros géneros adicionales), que solo están disponibles en un único idioma y por
// último tengan un rating (“imdb.rating”) mayor a 9 o bien tengan una duración (runtime)
// de  al menos 180 minutos. Listar ordenados por fecha de lanzamiento y número de
// votos.

db.movies.aggregate([
  {
    $match: {
      genres: { $all: ["Drama", "Action"] }, // `all` para que tenga todos los del array, para que tenga al menos uno `in`
      "imdb.votes": { $type: "int" },
      languages: { $size: 1 },
    },
  },
  {
    $match: {
      $or: [{ "imdb.rating": { $gte: 9 } }, { runtime: { $gte: 180 } }],
    },
  },
  {
    $sort: {
      date: -1,
      "imdb.votes": -1,
    },
  },
  {
    $project: {
      _id: 0,
      title: 1,
      languages: 1,
      released: 1,
      genres: 1,
      "imdb.votes": 1,
    },
  },
]);

// 6.  Listar  el  id  del  teatro  (theaterId),  estado  (“location.address.state”),  ciudad
// (“location.address.city”), y coordenadas (“location.geo.coordinates”) de los teatros que
// se encuentran en algunos de los estados "CA", "NY", "TX" y el nombre de la ciudades
// comienza con una ‘F’. Listar ordenados por estado y ciudad.

db.theaters.aggregate([
  {
    $match: {
      "location.address.state": { $in: ["CA", "NY", "TX"] },
      "location.address.city": { $regex: /^F/ },
    },
  },
  {
    $project: {
      _id: 0,
      theaterId: 1,
      "location.address.state": 1,
      "location.address.city": 1,
      "location.geo.coordinates": 1,
    },
  },
  { $sort: { "location.address.state": 1, "location.address.city": 1 } },
]);

// 7.  Actualizar los valores de los campos texto (text) y fecha (date) del comentario cuyo id es
// ObjectId("5b72236520a3277c015b3b73")  a  "mi  mejor  comentario"  y  fecha  actual
// respectivamente.

db.comments.findOne({ _id: ObjectId("5b72236520a3277c015b3b73") });

// {
//   _id: ObjectId('5b72236520a3277c015b3b73'),
//   name: 'foobar',
//   email: 'foobar@baz.com',
//   movie_id: ObjectId('573a13eff29313caabdd82f3'),
//   text: 'nope',
//   date: ISODate('2018-08-13T20:33:41.869Z')
// }

db.comments.updateOne(
  { _id: ObjectId("5b72236520a3277c015b3b73") },
  { $set: { text: "mi mejor comentario", date: ISODate() } },
);

// 8.  Actualizar  el  valor  de  la  contraseña  del  usuario  cuyo  email  es
// joel.macdonel@fakegmail.com  a  "some  password".  La  misma  consulta  debe  poder
// insertar un nuevo usuario en caso que el usuario no exista. Ejecute la consulta dos
// veces. ¿Qué operación se realiza en cada caso?  (Hint: usar upserts).

db.users.updateOne(
  { email: "joel.macdonel@fakegmail.com" },
  { $set: { password: "some password" } },
  { upsert: true },
);

// La primera ejecucion (crea)

// {
//   acknowledged: true,
//   insertedId: ObjectId('68f82c2b378b105e96f6dad6'),
//   matchedCount: 0,
//   modifiedCount: 0,
//   upsertedCount: 1
// }

// La segunda ejecucion (actualiza)

// {
//   acknowledged: true,
//   insertedId: null,
//   matchedCount: 1,
//   modifiedCount: 0,
//   upsertedCount: 0
// }

// 9.  Remover  todos  los  comentarios  realizados  por  el  usuario  cuyo  email  es
// victor_patel@fakegmail.com durante el año 1980.

db.comments.aggregate([
  {
    $match: {
      email: "victor_patel@fakegmail.com",
    },
  },
  { $addFields: { year: { $year: "$date" } } },
  { $match: { year: 1980 } },
  { $count: "total" },
]);

// [ { total: 21 } ]

db.comments.deleteMany({
  email: "victor_patel@fakegmail.com",
  date: { $gte: new Date("1980-01-01"), $lt: new Date("1981-01-01") },
});

// { acknowledged: true, deletedCount: 21 }
