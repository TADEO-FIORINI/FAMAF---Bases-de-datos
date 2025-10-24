// Mostrar la base de datos actual
`db`

// Listar todas las bases de datos
`show dbs`

// Crear o usar una base de datos (si no existe, se crea al guardar algo)
`use test`

// Insertar un documento de prueba
db.users.insertOne({ name: "Tadeo", rol: "admin" })

// Consultar documentos
db.users.find()

// Ver la base de datos actual
db.getName()

// Eliminar documento
db.users.deleteOne({ name: "Tadeo"})

// Listar colecciones
"show collections"

// regex:

// prefijo
db.movies.find({ title: { $regex: /^The/ } })
// sufijo
db.movies.find({ title: { $regex: /Knight$/ } })
// contiene
db.movies.find({ title: { $regex: /dark/ } })
// para ignorar mayusculas
db.movies.find({ title: { $regex: /dark/i } })
db.movies.find({ title: { $regex: /^dark/i } })
db.movies.find({ title: { $regex: /dark$/i } })

// ver que un campo existe y no es null
db.collection.find({
  field: { $exists: true, $ne: null }
})
