// Continuando con la base de datos mflix:

// Agregar  las  siguientes  reglas  de  validación  usando  JSON  Schema.  Luego  de  cada
// especificación testear que efectivamente las reglas de validación funcionen, intentando insertar
// 5 documentos válidos y 5 inválidos (por distintos motivos).

// 1.  Especificar en la colección users las siguientes reglas de validación: El campo name
// (requerido) debe ser un string con un máximo de 30 caracteres, email (requerido) debe
// ser  un  string  que  matchee  con  la expresión  regular: "^(.*)@(.*)\\.(.{2,4})$" ,
// password (requerido) debe ser un string con al menos 50 caracteres.

db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 30,
        },
        email: {
          bsonType: "string",
          pattern: "^(.*)@(.*)\\.(.{2,4})$",
        },
        password: {
          bsonType: "string",
          minLength: 50,
        },
      },
    },
  },
  validationLevel: "moderate",
  validationAction: "error",
});

// documentoss validos
db.users.insertOne({
  name: "name 1",
  email: "name1@gmail.com",
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  email: "name1@gmail.co",
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "a",
  email: "name1@gmail.como.com.co",
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});

// documentos invalidos
db.users.insertOne({
  name: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaab", //31
  email: "name1@gmail.com",
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "name 1",
  email: "name1gmail.com", // sin @
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "name 1",
  email: "name1@gmail.c", // extension demasiado corta
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "name 1",
  email: "name1@gmail.comos", // extension demasiado larga
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
db.users.insertOne({
  name: "name 1",
  email: "name1@gmail.com",
  password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // 49
});

// 2.  Obtener  metadata  de  la colección users  que garantice que las reglas de validación
// fueron correctamente aplicadas.

db.getCollectionInfos({ name: "users" });

// 3.  Especificar  en  la  colección  theaters  las  siguientes  reglas  de  validación:  El  campo
// theaterId (requerido) debe ser un int y location (requerido) debe ser un object con:

// a.  un campo address (requerido) que sea un object con campos street1, city, state
// y zipcode todos de tipo string y requeridos

// b.  un campo geo (no requerido) que sea un object con un campo type, con valores
// posibles “Point” o null y coordinates que debe ser una lista de 2 doubles
// Por último, estas reglas de validación no deben prohibir la inserción o actualización de
// documentos que no las cumplan sino que solamente deben advertir.

db.runCommand({
  collMod: "theaters",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["theaterId", "location"],
      properties: {
        theaterId: {
          bsonType: "int",
        },
        location: {
          bsonType: "object",
          required: ["address"],
          properties: {
            address: {
              bsonType: "object",
              required: ["street1", "city", "state", "zipcode"],
              properties: {
                street1: {
                  bsonType: "string",
                },
                city: {
                  bsonType: "string",
                },
                state: {
                  bsonType: "string",
                },
                zipcode: {
                  bsonType: "string",
                },
              },
            },
            geo: {
              bsonType: "object",
              required: ["type", "coordinates"],
              properties: {
                type: {
                  enum: ["Point", null],
                },
                coordinates: {
                  bsonType: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: {
                    bsonType: "double",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  validationLevel: "moderate",
  validationAction: "warn",
});

// 4.  Especificar en la colección movies  las siguientes reglas de validación:  El campo title
// (requerido) es de tipo string, year (requerido) int con mínimo en 1900 y máximo en 3000,
// y  que  tanto  cast,  directors,  countries,  como  genres  sean  arrays  de  strings  sin
// duplicados.

db.runCommand({
  collMod: "movies",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "year"],
      properties: {
        title: {
          bsonType: "string",
        },
        year: {
          bsonType: "int",
          minimum: 1900,
          maximum: 3000,
        },
        cast: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          uniqueItems: true,
        },
        directors: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          uniqueItems: true,
        },
        countries: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          uniqueItems: true,
        },
        genres: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          uniqueItems: true,
        },
      },
    },
  },
});

// a.  Hint: Usar el constructor NumberInt() para especificar valores enteros a la hora
// de insertar documentos. Recordar que mongo shell es un intérprete javascript y
// en javascript los literales numéricos son de tipo Number (double).

// 5.  Crear  una  colección  userProfiles  con  las  siguientes  reglas  de validación: Tenga un
// campo user_id (requerido) de tipo “objectId”, un campo language (requerido) con alguno
// de  los  siguientes  valores  [  “English”,  “Spanish”,  “Portuguese”  ]  y  un  campo
// favorite_genres (no requerido) que sea un array de strings sin duplicados.

db.createCollection("userProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "language"],
      properties: {
        user_id: {
          bsonType: "objectId",
        },
        language: {
          enum: ["English", "Spanish", "portuguese"],
        },
        favorite_genres: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          uniqueItems: true,
        },
      },
    },
  },
});

// 6.  Identificar los distintos tipos de relaciones (One-To-One, One-To-Many) en las
// colecciones movies y comments. Determinar si se usó documentos anidados o
// referencias en cada relación y justificar la razón.

// En los documentos de la coleccion `movies`, tenemos anidado el documento `imdb` con props
// `rating` (double), `votes` (int) y `id` (int). Es una relacion One-To-One ya que `imdb`
// es un unico documento, es decir no se encuentra dentro de un arreglo.

// En los documentos `comments`, tenemos dos relaciones One-To-Many diferentes. Por un lado,
// tenemos `name` y `email`, que son referencias a un documento de la coleccion `user`, es
// decir un usuario puede tener varios comentarios. Por otro lado tenemos `movie_id`, un
// objectId que referencia a un documento de la coleccion `movies`, esto quiere decir que
// una pelicula puede tener varios comentarios.

// 7.  Dado el diagrama de la base de datos shop junto con las queries más importantes.

// Queries
// I.  Listar el id, titulo, y precio de los libros y sus categorías de un autor en particular
// II.  Cantidad de libros por categorías
// III.  Listar el nombre y dirección entrega y el monto total (quantity * price) de sus
// pedidos para un order_id dado.

// Debe crear el modelo de datos en mongodb aplicando las estrategias “Modelo de datos
// anidados” y Referencias. El modelo de datos debe permitir responder las queries de
// manera eficiente.

// Inserte algunos documentos para las colecciones del modelo de datos. Opcionalmente
// puede especificar una regla de validación de esquemas para las colecciones.

// Se  provee el archivo shop.tar.gz que contiene algunos datos que puede usar como
// ejemplo para los inserts en mongodb.

// Primero creamos una base de datos
`use shop`;

db.createCollection("books", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author", "price", "category"],
      properties: {
        title: {
          bsonType: "string",
        },
        author: {
          bsonType: ["string", "null"],
        },
        price: {
          bsonType: "double",
        },
        category: {
          bsonType: "string",
        },
      },
    },
  },
});

db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "delivery_name",
        "delivery_address",
        "cc_name",
        "cc_number",
        "cc_expiry",
      ],
      properties: {
        delivery_name: {
          bsonType: "string",
        },
        delivery_address: {
          bsonType: "string",
        },
        cc_name: {
          bsonType: "string",
        },
        cc_number: {
          bsonType: "string",
        },
        cc_expiry: {
          bsonType: "string",
        },
      },
    },
  },
});

db.createCollection("orderDetails", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "book_id"],
      properties: {
        order_id: {
          bsonType: "objectId",
        },
        book_id: {
          bsonType: "objectId",
        },
      },
    },
  },
});

db.books.insertMany([
  {
    title: "Learning MySQL",
    author: "Jesper Wisborg Krogh",
    price: 34.31,
    category: "Web Development",
  },
  {
    title: "JavaScript Next",
    author: "Raju Gandhi",
    price: 36.7,
    category: "Web Development",
  },
  {
    title: "The Complete Robot",
    author: "Isaac Asimov",
    price: 12.13,
    category: "Science Fiction",
  },
  {
    title: "Foundation and Earth",
    author: "Isaac Asimov",
    price: 11.07,
    category: "Science Fiction",
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    price: 7.99,
    category: "Historical Mysteries",
  },
  {
    title: "A Column of Fire",
    author: "Ken Follett",
    price: 6.99,
    category: "Historical Mysteries",
  },
]);

db.orders.insertOne({
  delivery_name: "Andrea Le",
  delivery_address: "Calle Falsa 123, Madrid",
  cc_name: "Andrea Le",
  cc_number: "5500000000000004",
  cc_expiry: "03/27",
});

db.orderDetails.insertMany([
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ad838dbd253790544cad"),
    quantity: 1,
  },
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ad838dbd253790544cae"),
    quantity: 2,
  },
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ad838dbd253790544caf"),
    quantity: 1,
  },
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ad838dbd253790544cb0"),
    quantity: 4,
  },
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ad838dbd253790544cb1"),
    quantity: 1,
  },
  {
    order_id: ObjectId("6902c34a8dbd253790544cb5"),
    book_id: ObjectId("6902ae9a8dbd253790544cb4"),
    quantity: 3,
  },
]);

// la querie III con ObjectId('6902c34a8dbd253790544cb5') deberia dar
// 1 * 34.31 + 2 * 36.70 + 1 * 12.13 + 4 * 11.07 + 1 * 7.99 + 3 * 6.99
// que resulta 193.08

// querie I
db.books.aggregate([
  { $match: { author: "Isaac Asimov" } },
  { $project: { _id: 1, title: 1, price: 1, category: 1 } },
]);

// querie II
db.books.aggregate([
  {
    $group: {
      _id: "$category",
      books_count: { $sum: 1 },
    },
  },
]);

// querie III
db.orderDetails.aggregate([
  { $match: { order_id: ObjectId("6902c34a8dbd253790544cb5") } },
  {
    $lookup: {
      from: "books",
      foreignField: "_id",
      localField: "book_id",
      as: "books",
    },
  },
  { $unwind: "$books" },
  { $addFields: { sub_total: { $multiply: ["$quantity", "$books.price"] } } },
  {
    $lookup: {
      from: "orders",
      foreignField: "_id",
      localField: "order_id",
      as: "orders",
    },
  },
  { $unwind: "$orders" },
  {
    $group: {
      _id: "$order_id",
      delivery_name: { $first: "$orders.delivery_name" },
      delivery_address: { $first: "$orders.delivery_address" },
      total: { $sum: "$sub_total" },
    },
  },
]);

// 9. Crear un modelo de datos en mongodb aplicando las estrategias “Modelo de
// datos anidados” y Referencias y considerando las siguientes queries.

// i.  Listar título y url, tags y categorías de los artículos dado un user_id
// ii.  Listar título, url y comentarios que se realizaron en un rango de fechas.
// iii.  Listar nombre y email dado un id de usuario

// Inserte  algunos  documentos  para  las  colecciones  del  modelo  de  datos.
// Opcionalmente puede especificar una regla de validación de esquemas  para las
// colecciones..

`use articles`;

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: {
          bsonType: "string",
        },
        email: {
          bsonType: "string",
        },
      },
    },
  },
});

db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: {
          bsonType: "string",
        },
      },
    },
  },
});

db.createCollection("tags", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: {
          bsonType: "string",
        },
      },
    },
  },
});

db.createCollection("articles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "title", "date", "text", "url"],
      properties: {
        user_id: {
          bsonType: "objectId",
        },
        title: {
          bsonType: "string",
        },
        date: {
          bsonType: "date",
        },
        text: {
          bsonType: "string",
        },
        url: {
          bsonType: "string",
        },
        categories: {
          bsonType: "array",
          items: {
            bsonType: "objectId",
          },
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "objectId",
          },
        },
        comments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["user_id", "date", "text"],
            properties: {
              user_id: {
                bsonType: "objectId",
              },
              date: {
                bsonType: "date",
              },
              text: {
                bsonType: "string",
              },
            },
          },
        },
      },
    },
  },
});

db.users.insertOne({
  name: "user1",
  email: "user1@gmail.com",
});
// ObjectId('6903e16d53d41628bd544ca7')

db.categories.insertMany([
  {
    name: "category1",
  },
  {
    name: "category2",
  },
]);
// ObjectId('6903e1a653d41628bd544ca8')
// ObjectId('6903e1a653d41628bd544ca9')

db.tags.insertMany([
  {
    name: "tag1",
  },
  {
    name: "tag2",
  },
]);
// ObjectId('6903e26a53d41628bd544caa')
// ObjectId('6903e26a53d41628bd544cab')

db.articles.insertOne({
  user_id: ObjectId("6903e16d53d41628bd544ca7"),
  title: "Article 1",
  date: new Date(),
  text: "Article 1 text",
  url: "https://article1.com",
  categories: [
    ObjectId("6903e1a653d41628bd544ca8"),
    ObjectId("6903e1a653d41628bd544ca9"),
  ],
  tags: [
    ObjectId("6903e26a53d41628bd544caa"),
    ObjectId("6903e26a53d41628bd544cab"),
  ],
  comments: [
    {
      user_id: ObjectId("6903e16d53d41628bd544ca7"),
      date: new Date(),
      text: "comment 1",
    },
    {
      user_id: ObjectId("6903e16d53d41628bd544ca7"),
      date: new Date(),
      text: "comment 2",
    },
  ],
});

// querie I
db.articles.aggregate([
  {
    $match: {
      user_id: ObjectId("6903e16d53d41628bd544ca7"),
    },
  },
  {
    $lookup: {
      from: "categories",
      foreignField: "_id",
      localField: "categories",
      as: "categories_info",
    },
  },
  {
    $lookup: {
      from: "tags",
      foreignField: "_id",
      localField: "tags",
      as: "tags_info",
    },
  },
  {
    $project: {
      _id: 0,
      title: 1,
      url: 1,
      tags: "$tags_info.name",
      categories: "$categories_info.name",
    },
  },
]);

// querie II
db.articles.aggregate([
  {
    $match: {
      comments: {
        $elemMatch: {
          date: { $gte: new Date("2025-10-29"), $lt: new Date("2025-10-31") },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      title: 1,
      url: 1,
      comments: 1,
    },
  },
]);

// querie III
db.users.findOne(
  { _id: ObjectId("6903e16d53d41628bd544ca7") },
  { _id: 0, name: 1, email: 1 },
);
