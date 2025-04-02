import mongoose from 'mongoose';

describe('Database Connection', () => {
  it('should connect to database', async () => {
    await mongoose.connect('mongodb://mock:27017/test');
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://mock:27017/test');
  });

  it('should disconnect from database', async () => {
    await mongoose.disconnect();
    expect(mongoose.disconnect).toHaveBeenCalled();
  });
});