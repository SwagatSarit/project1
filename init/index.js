const mongoose=require('mongoose');
const Listing=require('../models/listing');
const initData=require('./data');

// Connect to MongoDB

async function main(){
      await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
};

main().then(res=>{
      console.log("Connected to DB");
}).catch(err=>{
      console.log(err);
});

const initDB = async () => {
      await Listing.deleteMany({});
      await Listing.insertMany(initData.data);
    //   for (let item of initData.data) {
    //     console.log('Saved item:', item);
    //   }
    //   console.log('data was saved');
};

initDB();