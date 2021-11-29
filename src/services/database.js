import mongoose from 'mongoose';

const database = {
  createConnection: async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL, {
        dbName: 'test',
        authSource: 'admin',
        w: 'majority',
        retryWrites: true,
      });

      console.log('Connected to database', conn.connection.host);
    } catch (error) {
      console.log('Error connecting to database', error);
      process.exit(1);
    }
  },
};

export default database;
