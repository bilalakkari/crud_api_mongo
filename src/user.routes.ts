import * as express from 'express'
import * as mongodb from 'mongodb'
import * as bcrypt from 'bcrypt'
import { collections } from './database';

export const userRouter = express.Router();
userRouter.use(express.json())

userRouter.get('/', async (req, res) => {
    try {
        const user = await collections.users.find({}).toArray();
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

userRouter.post('/', async (req, res) => {
    try {
        const user = req.body;
        const saltRounds = 10;
        const myPlaintextPassword = user.pwd;
        bcrypt.genSalt(saltRounds, (err: any, salt: any) => {
            bcrypt.hash(myPlaintextPassword, salt, async (err: any, hash: any) => {
                user.pwd = hash;
                const result = await collections.users.insertOne(user)
                if (result.acknowledged) {
                    res.status(201).send(`Created a new User: ID ${result.insertedId}`)
                } else {
                    res.status(500).send('Failed to create a new User')
                }
            });
        });

    } catch (error) {
        console.error(error);
        res.status(400).send(`Failed to create the User ID: Reason: ${error.message} `)
    }
})

userRouter.post('/authenticate', async (req, res) => {
    try {
        const user = req.body;
        const query = { username: user.username };
        const FoundUser = await collections.users.findOne(query)
        if (FoundUser) {
            bcrypt.compare(user.pwd, FoundUser.pwd, (err: any, result: any) => {
                if (result) {
                    res.status(200).send('Mabrouk, Tfadal')
                } else {
                    res.status(401).send(`Jarreb Marra 2oukhra`)
                }
            })
        }
        else {
            res.status(404).send(`XYZ`)
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(`Failed to create the User ID: Reason: ${error.message} `)
    }
})