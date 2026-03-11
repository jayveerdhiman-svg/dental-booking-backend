const express = require("express")
const cors = require("cors")
const { google } = require("googleapis")

const app = express()
app.use(cors())
app.use(express.json())

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
})

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client
})

const CALENDAR_ID = "primary"

const START_HOUR = 9
const END_HOUR = 20

app.get("/", (req,res)=>{
  res.send("Dental Booking API Running")
})

app.get("/available-slots", async (req,res)=>{
  try{

    const today = new Date()
    const start = new Date()
    start.setHours(START_HOUR,0,0,0)

    const end = new Date()
    end.setHours(END_HOUR,0,0,0)

    const events = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    })

    const bookedSlots = events.data.items.map(event=>{
      return new Date(event.start.dateTime).getHours()
    })

    const availableSlots = []

    for(let hour=START_HOUR; hour<END_HOUR; hour++){
      if(!bookedSlots.includes(hour)){
        availableSlots.push(`${hour}:00`)
      }
    }

    res.json(availableSlots)

  }catch(err){
    console.error(err)
    res.status(500).send("Error fetching slots")
  }
})

app.post("/book-appointment", async (req,res)=>{
  try{

    const {name, phone, date, time, treatment} = req.body

    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime)
    endTime.setHours(startTime.getHours()+1)

    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody:{
        summary: `Dental Appointment - ${treatment}`,
        description: `Patient: ${name}\nPhone: ${phone}`,
        start:{
          dateTime: startTime.toISOString()
        },
        end:{
          dateTime: endTime.toISOString()
        }
      }
    })

    res.json({status:"Appointment booked"})

  }catch(err){
    console.error(err)
    res.status(500).send("Booking failed")
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log("Server running on port", PORT)
})
