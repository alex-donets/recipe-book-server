const db = connect("mongodb://localhost/recipe");

db.createRole(
    {
      role: "recipe_app_role",
      privileges: [
        {
          actions: [ "find", "update", "insert", "remove", "createCollection" ,"listCollections", "dropCollection", "listIndexes", "createIndex"],
          resource: { db: "recipe", collection: "" }
        }
      ],
      roles: [  ]
    }
);

db.createUser(
    {
      user: "root",
      pwd: "root",
      roles: [ { role: "root", db: "admin" } ]
    }
);

db.createUser(
    {
      user: "recipeUser",
      pwd: "devEnvPass",
      roles: [ { role: "recipe", db: "recipe" } ]
    }
);

