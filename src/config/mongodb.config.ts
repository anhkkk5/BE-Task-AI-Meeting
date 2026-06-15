export const mongodbConfig = () => ({
  uri:
    process.env.MONGODB_URI ??
    'mongodb://root:root@localhost:27017/agile_ai?authSource=admin',
});
