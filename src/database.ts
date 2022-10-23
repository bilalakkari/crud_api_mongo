import * as mongodb from "mongodb";
import { Employee } from "./employee";
import { User } from "./user";

export const collections: {
    employees?: mongodb.Collection<Employee>;
    users?: mongodb.Collection<User>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("CRUD");
    await applySchemaValidation_Employee(db);
    await applySchemaValidation_User(db);

    const employeesCollection = db.collection<Employee>("employees");
    collections.employees = employeesCollection;

    const usersCollection = db.collection<User>("users");
    collections.users = usersCollection;
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation_Employee(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["fname", "lname", "email", "blood", "country"],
            additionalProperties: false,
            properties: {
                _id: {},
                fname: {
                    bsonType: "string",
                    description: "'fname' is required and is a string",
                },
                lname: {
                    bsonType: "string",
                    description: "'lname' is required and is a string",
                },
                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string",
                },
                blood: {
                    bsonType: "string",
                    description: "'Blood' is required and is one of 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', or 'AB-'",
                    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
                },
                country: {
                    bsonType: "string",
                    description: "'country' is required and is one of 'America', 'Japan', or 'Canada'",
                    enum: ["America", "Japan", "Canada"],
                },
            },
        },
    };

    // Try applying the modification to the collection, if the collection doesn't exist, create it
    await db.command({
        collMod: "employees",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection("employees", { validator: jsonSchema });
        }
    });
}

async function applySchemaValidation_User(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "pwd"],
            additionalProperties: false,
            properties: {
                _id: {},
                username: {
                    bsonType: "string",
                    description: "'username' is required and is a string",
                },
                pwd: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                }
            },
        },
    };

    // Try applying the modification to the collection, if the collection doesn't exist, create it
    await db.command({
        collMod: "users",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection("users", { validator: jsonSchema });
        }
    });
}