// 10. Listar el id del restaurante (restaurant_id) y las calificaciones de los restaurantes donde
// al menos una de sus calificaciones haya sido realizada entre 2014 y 2015 inclusive, y
// que tenga una puntuación (score) mayor a 70 y menor o igual a 90.

// al menos una califacion en 2014 o 2015 y una calificacion en el rango (70, 90]
db.restaurants.aggregate([
  {
    $match: {
      grades: {
        $elemMatch: {
          date: { $gte: new Date("2014-01-01"), $lt: new Date("2016-01-01") },
        },
      },
      grades: {
        $elemMatch: {
          score: { $gt: 70, $lte: 90 },
        },
      },
    },
  },
  { $project: { _id: 0, restaurant_id: 1 } },
]);

// al menos una califacion en 2014 o 2015 calificada en el rango (70, 90]
db.restaurants.aggregate([
  {
    $match: {
      grades: {
        $elemMatch: {
          date: { $gte: new Date("2014-01-01"), $lt: new Date("2016-01-01") },
          score: { $gt: 70, $lte: 90 },
        },
      },
    },
  },
  { $project: { _id: 0, restaurant_id: 1 } },
]);

// todas las calificaciones en 2014 o 2015
db.restaurants.aggregate([
  {
    $match: {
      grades: {
        $not: {
          $elemMatch: {
            $or: [
              { date: { $lt: new Date("2014-01-01") } },
              { date: { $gte: new Date("2016-01-01") } },
            ],
          },
        },
      },
    },
  },
  { $project: { _id: 0, restaurant_id: 1 } },
]);

// 11. Agregar dos nuevas calificaciones al restaurante cuyo id es "50018608". A continuación
// se especifican las calificaciones a agregar en una sola consulta.

// {
//   "date" : ISODate("2019-10-10T00:00:00Z"),
//   "grade" : "A",
//   "score" : 18
// }

// {
//   "date" : ISODate("2020-02-25T00:00:00Z"),
//   "grade" : "A",
//   "score" : 21
// }

db.restaurants.updateOne(
  { restaurant_id: "50018608" },
  {
    $push: {
      grades: {
        $each: [
          {
            date: ISODate("2019-10-10T00:00:00Z"),
            grade: "A",
            score: 18,
          },
          {
            date: ISODate("2020-02-25T00:00:00Z"),
            grade: "A",
            score: 21,
          },
        ],
      },
    },
  },
);
