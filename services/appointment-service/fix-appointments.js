const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://year3semester2kdy_db_user:fgSHzLPZDgFNFSld@ac-jtvjobw-shard-00-00.fa7keoe.mongodb.net:27017,ac-jtvjobw-shard-00-01.fa7keoe.mongodb.net:27017,ac-jtvjobw-shard-00-02.fa7keoe.mongodb.net:27017/?ssl=true&replicaSet=atlas-6j0c45-shard-0&authSource=admin&appName=Cluster0';

async function fixAppointmentCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('appointments');

    // Check if the problematic index exists
    const indexes = await collection.indexes();
    const problematicIndex = indexes.find(index => index.name === 'appointmentNumber_1');

    if (problematicIndex) {
      console.log('Dropping problematic index...');
      await collection.dropIndex('appointmentNumber_1');
      console.log('Problematic index dropped');
    }

    // Update all documents that have null appointmentNumber
    console.log('Updating existing appointments with appointment numbers...');
    const appointments = await collection.find({ appointmentNumber: { $exists: false } }).toArray();

    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      const timestamp = Date.now() + i; // Add i to ensure uniqueness
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const appointmentNumber = `APT-${timestamp}-${randomSuffix}`;

      await collection.updateOne(
        { _id: appointment._id },
        { $set: { appointmentNumber } }
      );
      console.log(`Updated appointment ${appointment._id} with number ${appointmentNumber}`);
    }

    // Create the proper unique index
    console.log('Creating proper unique index on appointmentNumber...');
    await collection.createIndex({ appointmentNumber: 1 }, { unique: true });
    console.log('Unique index created successfully');

    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAppointmentCollection();