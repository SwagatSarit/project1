const express = require("express")
const app = express()
const mongoose = require ("mongoose")
const Listing = require("./models/listing.js")
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust"
const path = require("path")
const methodOverride = require("method-override")
const ejsMate =require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require ("./schema.js")
const Review = require("./models/review.js")
const {reviewSchema} = require ("./schema.js")
const listings= require("./routes/lisitng.js")


main().then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);

});
async function main() {
    await mongoose.connect(mongo_url)

    

}
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended :true}))
app.use(methodOverride("_method"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))



app.get("/",(req,res) =>{
    res.send("Hello World");
})


const validateReview= (req,res,next) => {
  let {error} = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",")

    throw new ExpressError(400 ,errMsg);
  
  }
  else {
    next()
  }
}

app.use("/listings",listings)

  //reviews
  //post review route
  app.post("/listings/:id/reviews",validateReview,wrapAsync( async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    listing.reviews.push(newReview)

    await newReview.save();
    await listing.save()
    res.redirect(`/listings/${listing._id}`)

    

 
  }));

  //delete review route
  app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)

  }))





// app.get("/testListing" ,async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"balangir",
//         country:"india",
//     })
//     await sampleListing.save();
//     console.log("saved")
//     res.send("saved")
// })


app.all("*",(req,res,next) => {
  next(new ExpressError(404,"Page not found"))
})
app.use((err,req,res,next) => {
  let {statusCode =500, message="Something Went Wrong"} = err;
  res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080, () =>{
    console.log("Server is running on port 8080");

})