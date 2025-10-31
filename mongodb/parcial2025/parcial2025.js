// 1.  Calcular el rating promedio por país. Listar el país, rating promedio, y cantidad de
// rating.  Listar  en  orden  descendente  por  rating  promedio.  Usar  el  campo
// “review_scores.review_scores_rating” para calcular el rating promedio.

db.listingsAndReviews.aggregate([
  {
    $group: {
      _id: "$address.country",
      avg: { $avg: "$review_scores.review_scores_rating" },
      count: { $sum: 1 },
    },
  },
  {
    $sort: {
      avg: -1,
    },
  },
  {
    $project: {
      _id: 0,
      country: "$_id",
      rating_count: "$count",
      rating_avg: "$avg",
    },
  },
]);

// 2.  Listar los 20 alojamientos que tienen las reviews más recientes. Listar el id, nombre,
// fecha de la última review, y cantidad de reviews del alojamiento. Listar en orden
// descendente por cantidad de reviews.

// HINT: $first pueden ser de utilidad.

db.listingsAndReviews.aggregate([
  { $sort: { "reviews.date": -1 } },
  { $limit: 20 },
  {
    $project: {
      _id: 1,
      name: 1,
      last_review_date: { $last: "$reviews.date" },
      reviews_count: { $size: "$reviews" },
    },
  },
  { $sort: { reviews_count: -1 } },
]);

// 3.  Crear la vista “top10_most_common_amenities” con información de los 10 amenities
// que  aparecen  con  más  frecuencia.  El  resultado  debe  mostrar  el  amenity  y  la
// cantidad de veces que aparece cada amenity.

db.createView("top10_most_common_amenities", "listingsAndReviews", [
  { $unwind: "$amenities" },
  {
    $group: {
      _id: "$amenities",
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      amenitie: "$_id",
      amenitie_appearances: "$count",
    },
  },
]);

// 4.  Actualizar  los  alojamientos  de  Brazil  que  tengan  un  rating  global
// (“review_scores.review_scores_rating”)  asignado,  agregando  el  campo
// "quality_label" que clasifique el alojamiento como “High” (si el rating global es mayor
// o  igual  a  90),  “Medium”  (si  el  rating global es mayor o igual a 70), “Low” (valor por
// defecto) calidad..

// HINTS:
// (i) para actualizar se puede usar pipeline de agregación.
// (ii) El operador $cond o $switch pueden ser de utilidad.

db.listingsAndReviews.updateMany(
  {
    "address.country": "Brazil",
    "review_scores.review_scores_rating": { $exists: true, $ne: null },
  },
  [
    {
      $set: {
        quality_label: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $gte: ["$review_scores.review_scores_rating", 70] },
                    { $lt: ["$review_scores.review_scores_rating", 90] },
                  ],
                },
                then: "Medium",
              },
              {
                case: { $gte: ["$review_scores.review_scores_rating", 90] },
                then: "High",
              },
            ],
            default: "Low",
          },
        },
      },
    },
  ],
);

// 5.
//  (a)  Especificar  reglas  de  validación  en  la  colección  listingsAndReviews  a  los
// siguientes  campos  requeridos:  name,  address,  amenities,  review_scores,  and
// reviews ( y todos sus campos anidados). Inferir los tipos y otras restricciones que
// considere adecuados para especificar las reglas a partir de los documentos de la
// colección.

db.listingsAndReviews.findOne({}, { review_scores: 1 });

db.runCommand({
  collMod: "listingsAndReviews",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "address", "amenities", "review_scores", "reviews"],
      properties: {
        name: {
          bsonType: "string",
        },
        address: {
          bsonType: "object",
          properties: {
            street: {
              bsonType: "string",
            },
            suburb: {
              bsonType: "string",
            },
            government_area: {
              bsonType: "string",
            },
            market: {
              bsonType: "string",
            },
            country: {
              bsonType: "string",
            },
            country_code: {
              bsonType: "string",
            },
            location: {
              bsonType: "object",
              properties: {
                type: {
                  bsonType: "string",
                },
                coordinates: {
                  bsonType: "array",
                  items: {
                    bsonType: "double",
                  },
                },
                is_location_exact: {
                  bsonType: "bool",
                },
              },
            },
          },
        },
        amenities: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
        },
        review_scores: {
          bsonType: "object",
          properties: {
            review_scores_accuracy: {
              bsonType: "int",
            },
            review_scores_cleanliness: {
              bsonType: "int",
            },
            review_scores_checkin: {
              bsonType: "int",
            },
            review_scores_communication: {
              bsonType: "int",
            },
            review_scores_location: {
              bsonType: "int",
            },
            review_scores_value: {
              bsonType: "int",
            },
            review_scores_rating: {
              bsonType: "int",
            },
          },
        },
        reviews: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              _id: {
                bsonType: "string",
              },
              date: {
                bsonType: "date",
              },
              listing_id: {
                bsonType: "string",
              },
              reviewer_id: {
                bsonType: "string",
              },
              reviewer_name: {
                bsonType: "string",
              },
              comments: {
                bsonType: "string",
              },
            },
          },
        },
      },
    },
  },
});

// (b)  Testear  la  regla  de validación generando dos casos de fallas en la regla de
// validación y un caso de éxito en la regla de validación. Aclarar en la entrega cuales
// son los casos y por qué fallan y cuales cumplen la regla de validación. Los casos no
// deben  ser  triviales,  es  decir  los  ejemplos  deben  contener  todos  los  campos
// especificados en la regla.

// CASO DE EXITO
// este caso esta sacado de un documento de la bases de datos, por lo que si nuestro validator
// es correcto deberia insertarse correctamente
db.listingsAndReviews.insertOne({
  name: "Ribeira Charming Duplex",
  address: {
    street: "Porto, Porto, Portugal",
    suburb: "",
    government_area: "Cedofeita, Ildefonso, Sé, Miragaia, Nicolau, Vitória",
    market: "Porto",
    country: "Portugal",
    country_code: "PT",
    location: {
      type: "Point",
      coordinates: [-8.61308, 41.1413],
      is_location_exact: false,
    },
  },
  amenities: [
    "TV",
    "Cable TV",
    "Wifi",
    "Kitchen",
    "Paid parking off premises",
    "Smoking allowed",
    "Pets allowed",
    "Buzzer/wireless intercom",
    "Heating",
    "Family/kid friendly",
    "Washer",
    "First aid kit",
    "Fire extinguisher",
    "Essentials",
    "Hangers",
    "Hair dryer",
    "Iron",
    "Pack ’n Play/travel crib",
    "Room-darkening shades",
    "Hot water",
    "Bed linens",
    "Extra pillows and blankets",
    "Microwave",
    "Coffee maker",
    "Refrigerator",
    "Dishwasher",
    "Dishes and silverware",
    "Cooking basics",
    "Oven",
    "Stove",
    "Cleaning before checkout",
    "Waterfront",
  ],
  review_scores: {
    review_scores_accuracy: 9,
    review_scores_cleanliness: 9,
    review_scores_checkin: 10,
    review_scores_communication: 10,
    review_scores_location: 10,
    review_scores_value: 9,
    review_scores_rating: 89,
  },
  reviews: [
    {
      _id: "364728730",
      date: ISODate("2018-12-31T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "91827533",
      reviewer_name: "Mr",
      comments:
        "Ana & Goncalo were great on communication, responding instantly to questions.\n" +
        "5 of us stayed in their home for 3 nights and found the location to be great and central to all the amazing sights Porto has to offer. \n" +
        "We found the home to be difficult to heat on our first night, the rooms have heaters but took time to get the room to a comfortable temperature level. But in warmer months Im sure this isn't an issue.\n" +
        "The beds are a little hard with one slightly out of shape,  and the shower is fairly basic (hand held) but does the job. Because of the central location some noise can be expected early in the mornings. \n" +
        "Overall the apartment suited our needs for our short stay and the price is more than reasonable for what we got.",
    },
    {
      _id: "403055315",
      date: ISODate("2019-01-20T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "15138940",
      reviewer_name: "Milo",
      comments:
        "The house was extremely well located and Ana was able to give us some really great tips on locations to have lunch and eat out. The house was perfectly clean and the easily able to accommodate 6 people despite only having one bathroom. The beds and living room were comfortable. \n" +
        "\n" +
        "However, we always felt somewhat on edge in the house due to the number of signs posted around the kitchen, bedrooms and bathroom about being charged 15€ for all sorts of extras like not washing up or using extra towels and bed linen. Not that this would be particularly unreasonable but it made us feel like we were walking on egg shells in and around the house. \n" +
        "\n" +
        "The hosts were aware that we were a group of six yet one of the beds was not prepared and we ran out of toilet paper well before we were due to check out despite only being there 2 nights. It really wasn't the end of the world but the shower head does not have a wall fitting meaning you had to hold it yourself if you wanted to stand underneath it.",
    },
  ],
});

// CASO DE FALLO 1
// el campo `name` deberia ser string y le pasamos un bool
db.listingsAndReviews.insertOne({
  name: true,
  address: {
    street: "Porto, Porto, Portugal",
    suburb: "",
    government_area: "Cedofeita, Ildefonso, Sé, Miragaia, Nicolau, Vitória",
    market: "Porto",
    country: "Portugal",
    country_code: "PT",
    location: {
      type: "Point",
      coordinates: [-8.61308, 41.1413],
      is_location_exact: false,
    },
  },
  amenities: [
    "TV",
    "Cable TV",
    "Wifi",
    "Kitchen",
    "Paid parking off premises",
    "Smoking allowed",
    "Pets allowed",
    "Buzzer/wireless intercom",
    "Heating",
    "Family/kid friendly",
    "Washer",
    "First aid kit",
    "Fire extinguisher",
    "Essentials",
    "Hangers",
    "Hair dryer",
    "Iron",
    "Pack ’n Play/travel crib",
    "Room-darkening shades",
    "Hot water",
    "Bed linens",
    "Extra pillows and blankets",
    "Microwave",
    "Coffee maker",
    "Refrigerator",
    "Dishwasher",
    "Dishes and silverware",
    "Cooking basics",
    "Oven",
    "Stove",
    "Cleaning before checkout",
    "Waterfront",
  ],
  review_scores: {
    review_scores_accuracy: 9,
    review_scores_cleanliness: 9,
    review_scores_checkin: 10,
    review_scores_communication: 10,
    review_scores_location: 10,
    review_scores_value: 9,
    review_scores_rating: 89,
  },
  reviews: [
    {
      _id: "364728730",
      date: ISODate("2018-12-31T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "91827533",
      reviewer_name: "Mr",
      comments:
        "Ana & Goncalo were great on communication, responding instantly to questions.\n" +
        "5 of us stayed in their home for 3 nights and found the location to be great and central to all the amazing sights Porto has to offer. \n" +
        "We found the home to be difficult to heat on our first night, the rooms have heaters but took time to get the room to a comfortable temperature level. But in warmer months Im sure this isn't an issue.\n" +
        "The beds are a little hard with one slightly out of shape,  and the shower is fairly basic (hand held) but does the job. Because of the central location some noise can be expected early in the mornings. \n" +
        "Overall the apartment suited our needs for our short stay and the price is more than reasonable for what we got.",
    },
    {
      _id: "403055315",
      date: ISODate("2019-01-20T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "15138940",
      reviewer_name: "Milo",
      comments:
        "The house was extremely well located and Ana was able to give us some really great tips on locations to have lunch and eat out. The house was perfectly clean and the easily able to accommodate 6 people despite only having one bathroom. The beds and living room were comfortable. \n" +
        "\n" +
        "However, we always felt somewhat on edge in the house due to the number of signs posted around the kitchen, bedrooms and bathroom about being charged 15€ for all sorts of extras like not washing up or using extra towels and bed linen. Not that this would be particularly unreasonable but it made us feel like we were walking on egg shells in and around the house. \n" +
        "\n" +
        "The hosts were aware that we were a group of six yet one of the beds was not prepared and we ran out of toilet paper well before we were due to check out despite only being there 2 nights. It really wasn't the end of the world but the shower head does not have a wall fitting meaning you had to hold it yourself if you wanted to stand underneath it.",
    },
  ],
});

// CASO DE FALLO 2
// el campo `amenities` es un arreglo de string, y en uno de los items le pasamos un int
db.listingsAndReviews.insertOne({
  name: "Ribeira Charming Duplex",
  address: {
    street: "Porto, Porto, Portugal",
    suburb: "",
    government_area: "Cedofeita, Ildefonso, Sé, Miragaia, Nicolau, Vitória",
    market: "Porto",
    country: "Portugal",
    country_code: "PT",
    location: {
      type: "Point",
      coordinates: [-8.61308, 41.1413],
      is_location_exact: false,
    },
  },
  amenities: [
    1,
    "Cable TV",
    "Wifi",
    "Kitchen",
    "Paid parking off premises",
    "Smoking allowed",
    "Pets allowed",
    "Buzzer/wireless intercom",
    "Heating",
    "Family/kid friendly",
    "Washer",
    "First aid kit",
    "Fire extinguisher",
    "Essentials",
    "Hangers",
    "Hair dryer",
    "Iron",
    "Pack ’n Play/travel crib",
    "Room-darkening shades",
    "Hot water",
    "Bed linens",
    "Extra pillows and blankets",
    "Microwave",
    "Coffee maker",
    "Refrigerator",
    "Dishwasher",
    "Dishes and silverware",
    "Cooking basics",
    "Oven",
    "Stove",
    "Cleaning before checkout",
    "Waterfront",
  ],
  review_scores: {
    review_scores_accuracy: 9,
    review_scores_cleanliness: 9,
    review_scores_checkin: 10,
    review_scores_communication: 10,
    review_scores_location: 10,
    review_scores_value: 9,
    review_scores_rating: 89,
  },
  reviews: [
    {
      _id: "364728730",
      date: ISODate("2018-12-31T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "91827533",
      reviewer_name: "Mr",
      comments:
        "Ana & Goncalo were great on communication, responding instantly to questions.\n" +
        "5 of us stayed in their home for 3 nights and found the location to be great and central to all the amazing sights Porto has to offer. \n" +
        "We found the home to be difficult to heat on our first night, the rooms have heaters but took time to get the room to a comfortable temperature level. But in warmer months Im sure this isn't an issue.\n" +
        "The beds are a little hard with one slightly out of shape,  and the shower is fairly basic (hand held) but does the job. Because of the central location some noise can be expected early in the mornings. \n" +
        "Overall the apartment suited our needs for our short stay and the price is more than reasonable for what we got.",
    },
    {
      _id: "403055315",
      date: ISODate("2019-01-20T05:00:00.000Z"),
      listing_id: "10006546",
      reviewer_id: "15138940",
      reviewer_name: "Milo",
      comments:
        "The house was extremely well located and Ana was able to give us some really great tips on locations to have lunch and eat out. The house was perfectly clean and the easily able to accommodate 6 people despite only having one bathroom. The beds and living room were comfortable. \n" +
        "\n" +
        "However, we always felt somewhat on edge in the house due to the number of signs posted around the kitchen, bedrooms and bathroom about being charged 15€ for all sorts of extras like not washing up or using extra towels and bed linen. Not that this would be particularly unreasonable but it made us feel like we were walking on egg shells in and around the house. \n" +
        "\n" +
        "The hosts were aware that we were a group of six yet one of the beds was not prepared and we ran out of toilet paper well before we were due to check out despite only being there 2 nights. It really wasn't the end of the world but the shower head does not have a wall fitting meaning you had to hold it yourself if you wanted to stand underneath it.",
    },
  ],
});
