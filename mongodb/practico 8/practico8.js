`use mflix`;

// 1.  Cantidad de cines (theaters) por estado.

db.theaters.aggregate([
  {
    $group: {
      _id: "$location.address.state",
      count: { $count: {} },
    },
  },
]);

// segun chatgpt deberia ser asi ya que count es un pipeline stage, no un acumulador
// y si hoy funciona, quizas en otra version deje de funcionar pues probablemente
// un parser reemplace `$count: {}` por `$sum: 1`.
db.theaters.aggregate([
  {
    $group: {
      _id: "$location.address.state",
      theaters_count: { $sum: 1 },
    },
  },
]);

// 2.  Cantidad de estados con al menos dos cines (theaters) registrados.

db.theaters.aggregate([
  {
    $group: {
      _id: "$location.address.state",
      theaters_count: { $sum: 1 },
    },
  },
  { $match: { theaters_count: { $gte: 2 } } },
  { $count: "estados con al menos 2 cines" },
]);

// 3.  Cantidad de películas dirigidas por "Louis Lumière". Se puede responder sin pipeline de
// agregación, realizar ambas queries.

db.movies.aggregate([
  { $match: { directors: { $in: ["Louis Lumière"] } } },
  { $count: "Cantidad de películas dirigidas por Louis Lumière" },
]);

// esto funciona pero segun chatgpt esta deprecado
db.movies
  .find({ directors: { $in: ["Louis Lumière"] } })
  .count("Cantidad de películas dirigidas por Louis Lumière");

// este es el estandar desde MongoDB 4.0
db.movies.countDocuments({ directors: { $in: ["Louis Lumière"] } });

// 4.  Cantidad de películas estrenadas en los años 50 (desde 1950 hasta 1959). Se puede
// responder sin pipeline de agregación, realizar ambas queries.

db.movies.aggregate([
  { $match: { year: { $gte: 1950, $lt: 1960 } } },
  { $count: "Cantidad de películas estrenadas en los años 50" },
]);

db.movies.countDocuments({ year: { $gte: 1950, $lt: 1960 } });

// 5.  Listar los 10 géneros con mayor cantidad de películas (tener en cuenta que las películas
// pueden tener más de un género). Devolver el género y la cantidad de películas. Hint:
// unwind puede ser de utilidad

db.movies.aggregate([
  { $unwind: "$genres" },
  {
    $group: {
      _id: "$genres",
      movies_count: { $sum: 1 },
    },
  },
  { $sort: { movies_count: -1 } },
  { $limit: 10 },
]);

// 6.  Top 10 de usuarios con mayor cantidad de comentarios, mostrando Nombre, Email y
// Cantidad de Comentarios.

db.comments.aggregate([
  {
    $group: {
      _id: "$email",
      comments_count: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id", // luego de agrupar, _id es el email
      foreignField: "email",
      as: "users",
    },
  },
  { $sort: { comments_count: -1 } },
  { $limit: 10 },
  { $unwind: "$users" },
  // { $project: {_id: 0, "users.name": 1, "users.email": 1, comments_count: 1} }
  {
    $project: {
      _id: 0,
      name: "$users.name",
      email: "$users.email",
      comments_count: 1,
    },
  },
]);

// 7.  Ratings de IMDB promedio, mínimo y máximo por año de las películas estrenadas en
// los años 80 (desde 1980 hasta 1989), ordenados de mayor a menor por promedio del
// año.
db.movies.aggregate([
  { $match: { year: { $gte: 1980, $lt: 1990 } } },
  // { $match: { "imdb.rating:": { $type: "double" } } },
  {
    $group: {
      _id: "$year",
      min_rating: { $min: "$imdb.rating" },
      max_rating: { $max: "$imdb.rating" },
      avg_rating: { $avg: "$imdb.rating" },
    },
  },
  { $sort: { avg_rating: -1 } },
]);

// 8.  Título, año y cantidad de comentarios de las 10 películas con más comentarios.
db.movies.findOne();
db.comments.findOne();

db.comments.aggregate([
  {
    $group: {
      _id: "$movie_id",
      comments_count: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "movies",
      localField: "_id",
      foreignField: "_id",
      as: "movies",
    },
  },
  { $unwind: "$movies" },
  { $sort: { comments_count: -1 } },
  { $limit: 10 },
  // { $project: { _id: 0, "movies.title": 1, "movies.year": 1, comments_count: 1 } },
  {
    $project: {
      _id: 0,
      title: "$movies.title",
      year: "$movies.year",
      comments_count: 1,
    },
  },
]);

// 9.  Crear una vista con los 5 géneros con mayor cantidad de comentarios, junto con la
// cantidad de comentarios.

// si ya tenemos calculado el numero de comentarios por pelicula
db.createView(
  "cinco_generos_con_mayor_cantidad_de_comentarios",
  "movies",
  [
    {
      $unwind: "$genres",
    },
    {
      $group: {
        _id: "$genres",
        total_comments: {
          $sum: "$num_mflix_comments",
        },
      },
    },
    {
      $sort: {
        total_comments: -1,
      },
    },
    { $limit: 5 },
  ]
);

db.cinco_generos_con_mayor_cantidad_de_comentarios.find();


// si no tenemos calculado el numero de comentarios por pelicula (sin vista)
db.movies.aggregate([
  {
    $unwind: "$genres",
  },
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "movie_id",
      as: "comments",
    },
  },
  {
    $addFields: {
      comments_per_movie: {
        $size: "$comments",
      },
    },
  },
  {
    $group: {
      _id: "$genres",
      total_comments: {
        $sum: "$comments_per_movie",
      },
    },
  },
  {
    $sort: {
      total_comments: -1,
    },
  },
  { $limit: 5 },
]);

// 10. Listar los actores (cast) que trabajaron en 2 o más películas dirigidas por "Jules Bass".
// Devolver el nombre de estos actores junto con la lista de películas (solo título y año)
// dirigidas por “Jules Bass” en las que trabajaron.
// a.  Hint1: addToSet
// b.  Hint2:  {'name.2':  {$exists:  true}}  permite filtrar arrays con al menos 2
// elementos, entender por qué.
// c.  Hint3: Puede que tu solución no use Hint1 ni Hint2 e igualmente sea correcta

db.movies.aggregate([
  { $match: { directors: { $in: ["Jules Bass"] } } },
  { $unwind: "$cast" },
  {
    $group: {
      _id: "$cast",
      movies_count: { $sum: 1 },
      movies: { $addToSet: { title: "$title", year: "$year" } },
    },
  },
  { $match: { movies_count: { $gte: 2 } } },
  { $project: { _id: 0, name: "$_id", movies: 1 } },
]);

// 11. Listar los usuarios que realizaron comentarios durante el mismo mes de lanzamiento de
// la  película  comentada, mostrando Nombre, Email, fecha del comentario, título de la
// película, fecha de lanzamiento. HINT: usar $lookup con multiple condiciones

// movies solo tiene year asi que lo hacemos con el año de lanzamiento
db.movies.aggregate([
  { $match: { released: { $exists: true } } },
  { $addFields: { month: { $month: "$released" } } },
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "movie_id",
      as: "comments",
    },
  },
  { $unwind: "$comments" },
  {
    $match: {
      $expr: {
        $eq: ["$year", { $year: "$comments.date" }],
      },
    },
  },
  {
    $match: {
      $expr: {
        $eq: ["$month", { $month: "$comments.date" }],
      },
    },
  },
  {
    $project: {
      _id: 0,
      name: "$comments.name",
      email: "$comments.email",
      comment_date: "$comments.date",
      movie_date: "$released",
      title: 1,
    },
  },
]);

// 12. Listar el id y nombre de los restaurantes junto con su puntuación máxima, mínima y la
// suma total. Se puede asumir que el restaurant_id es único.

// a.  Resolver con $group y accumulators.
db.restaurants.aggregate([
  { $unwind: "$grades" },
  {
    $group: {
      _id: "$restaurant_id",
      name: { $first: "$name" },
      min: { $min: "$grades.score" },
      max: { $max: "$grades.score" },
      sum: { $sum: "$grades.score" },
    },
  },
]);

// b.  Resolver con expresiones sobre arreglos (por ejemplo, $sum) pero sin $group.
db.restaurants.aggregate([
  {
    $project: {
      _id: 0,
      restaurant_id: 1,
      name: 1,
      sum: { $sum: "$grades.score" },
      min: { $min: "$grades.score" },
      max: { $max: "$grades.score" },
    },
  },
]);

// c.  Resolver como en el punto b) pero usar $reduce para calcular la puntuación
// total.
db.restaurants.aggregate([
  {
    $project: {
      _id: 0,
      restaurant_id: 1,
      name: 1,
      min: { $min: "$grades.score" },
      max: { $max: "$grades.score" },
      sum: {
        $reduce: {
          input: "$grades",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.score"] },
        },
      },
    },
  },
]);

// d.  Resolver con find.
db.restaurants.find(
  {},
  {
    _id: 0,
    restaurant_id: 1,
    name: 1,
    min: { $min: "$grades.score" },
    max: { $max: "$grades.score" },
    sum: {
      $reduce: {
        input: "$grades",
        initialValue: 0,
        in: { $add: ["$$value", "$$this.score"] },
      },
    },
  },
);

// 13. Actualizar los datos de los restaurantes añadiendo dos campos nuevos.

// a.  "average_score": con la puntuación promedio

// b.  "grade": con "A" si "average_score" está entre 0 y 13,
//   con "B" si "average_score" está entre 14 y 27
//   con "C" si "average_score" es mayor o igual a 28

// Se debe actualizar con una sola query.
// a.  HINT1. Se puede usar pipeline de agregación con la operación update
// b.  HINT2. El operador $switch o $cond pueden ser de ayuda.

// primero nos aseguramos que funcione la query
db.restaurants.aggregate(
  [
    { 
      $addFields: {
        average_score: { $avg: "$grades.score" },
        grade: {
          $switch: {
            branches: [
              { case: { $lte: ["$score_average", 13] }, then: "A" },
              { case: { $and: [{ $gte: ["$score_average", 14] }, { $lte: ["$score_average", 27] }]}, then: "B" },
              { case: { $gte: ["$score_average", 28] }, then: "C" },
            ]
          }
        }
      } 
    }
  ]
);

// ahora usamos el contenido de la query para actualizar
db.restaurants.updateMany(
  {},
  [
    {
      $set: {
        average_score: { $avg: "$grades.score" },
        grade: {
          $switch: {
            branches: [
              { case: { $lte: ["$score_average", 13] }, then: "A" },
              { case: { $and: [{ $gte: ["$score_average", 14] }, { $lte: ["$score_average", 27] }]}, then: "B" },
              { case: { $gte: ["$score_average", 28] }, then: "C" },
            ]
          }
        }
      }
    }
  ]
);