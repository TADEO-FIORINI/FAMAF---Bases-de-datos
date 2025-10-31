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

// 2. Actualizar los documentos en la colección grades, ajustando todas las puntuaciones
// para que estén normalizadas entre 0 y 7
// La fórmula para la normalización es:

// Por ejemplo:
// Si un estudiante sacó un 32 y otro sacó un 62, deberían ser actualizadas a:
// ● 2,24, porque (32/100)*7 = 2,24
// ● 4,34, porque (62/100)*7 = 4,34
// HINT: usar updateMany junto con map

db.grades.updateMany({}, [
  {
    $set: {
      scores: {
        $map: {
          input: "$scores",
          as: "scores",
          in: {
            type: "$$scores.type",
            score: { $multiply: [{ $divide: ["$$scores.score", 100] }, 7] },
          },
        },
      },
    },
  },
]);


// 3. Crear una vista "top10students_homework" que liste los 10 estudiantes con los
// mejores promedios para homework. Ordenar por average_homework_score
// descendiente.

db.createView("top10students_homework", "grades", [
  {
    $unwind: "$scores",
  },
  {
    $match: {
      "scores.type": "homework"
    }
  },
  {
    $group: {
      _id: "$student_id",
      average_homework_score: {
        $avg: "$scores.score",
      },
    },
  },
  {
    $sort: {
      average_homework_score: -1,
    },
  },
  {
    $limit: 10,
  },
]);


db.top10students_homework.find();

// 4. Especificar reglas de validación en la colección grades. El único requerimiento es
// que se valide que los type de los scores sólo puedan ser de estos tres tipos:
// [“exam”, “quiz”, “homework”]

db.runCommand({
  collMod: "grades",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        scores: {
          bsonType: "array",
          items: {
            properties: {
              type: {
                enum: ["exam", "quiz", "homework"],
              },
            },
          },
        },
      },
    },
  },
});
