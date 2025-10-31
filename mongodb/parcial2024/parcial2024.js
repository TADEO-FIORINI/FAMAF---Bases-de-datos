// 1. Escribir una consulta para calcular el promedio de puntuaciones de cada clase
// (class_id) y compararlo con el promedio general de todas las clases. La consulta
// debe devolver un documento para cada clase que incluya el class_id, el promedio de
// puntuaciones de esa clase y un campo adicional que indique si el promedio de la
// clase está por encima o por debajo del promedio general de todas las clases. Los
// resultados deben ordenarse de manera ascendente por class_id y de manera
// descendente por average_score.
// Estructura de cada documento del output:

// {
// "class_id": <class_id>,
// "average_score": <average_score>, // puntuación promedio de esta clase
// "comparison_to_overall_average": "above" | "below" | "equal" // comparación con el
// promedio general de todas las clases
// }

// HINT: una de las stages usa lookup con un pipeline adentro:

db.grades.aggregate([
  { $match: { class_id: { $exists: true } } },
  { $unwind: "$scores" },
  {
    $group: {
      _id: "$class_id",
      average_score: { $avg: "$scores.score" },
    },
  },
  {
    $lookup: {
      from: "grades",
      pipeline: [
        { $unwind: "$scores" },
        {
          $group: {
            _id: null,
            score: { $avg: "$scores.score" },
          },
        },
      ],
      as: "overall_average",
    },
  },
  { $unwind: "$overall_average" },
  {
    $addFields: {
      comparison_to_overall_average: {
        $switch: {
          branches: [
            {
              case: { $lt: ["$average_score", "$overall_average.score"] },
              then: "bellow",
            },
            {
              case: { $gt: ["$average_score", "$overall_average.score"] },
              then: "above",
            },
            {
              case: { $eq: ["$average_score", "$overall_average.score"] },
              then: "equal",
            },
          ],
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      class_id: "$_id",
      average_score: "$average_score",
      overall_average_score: "$overall_average.score",
      comparison_to_overall_average: "$comparison_to_overall_average",
    },
  },
  {
    $sort: {
      class_id: 1,
      average_score: -1,
    },
  },
]);
