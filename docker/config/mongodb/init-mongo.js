db.createUser(
  {
    user: "admin",
    pwd: "secret",
    roles: [
      {
        // role: "readWrite",
        role: "dbOwner",
        db: "test"
      }
    ]
  }
)


db=db.getSiblingDB('spacer')
db.createUser(
  {
    user: "admin",
    pwd: "secret",
    roles: [
      {
        // role: "readWrite",
        role: "dbOwner",
        db: "spacer"
      }
    ]
  }
)
