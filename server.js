const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
    res.send("Dental Booking API Running")
})

app.get("/available-slots",(req,res)=>{

const slots=[
"9:00 AM","10:00 AM","11:00 AM","12:00 PM",
"1:00 PM","2:00 PM","3:00 PM","4:00 PM",
"5:00 PM","6:00 PM","7:00 PM","8:00 PM"
]

res.json(slots)

})

app.post("/book-appointment",(req,res)=>{

const booking=req.body

console.log("New booking:",booking)

res.json({
status:"success"
})

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})