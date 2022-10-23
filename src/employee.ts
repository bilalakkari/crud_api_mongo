import * as mongodb from 'mongodb'

export interface Employee {
    fname: string;
    lname: string;
    email: string;
    blood: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
    country: 'America' | 'Japan' | 'Canada';
    _id?: mongodb.ObjectId;
}