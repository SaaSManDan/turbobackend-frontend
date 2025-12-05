"use server"
import { LogSnag } from "@logsnag/node";
import { sendEmail } from '../services/emailSender';

const logsnag = new LogSnag({
    token: process.env.LOGSNAG_API_TOKEN,
    project: ""
});

export async function errorLogger(errorLocation, errorDetails, userId){
    if(process.env.NODE_ENV == "development"){
        console.log("There was an error at " + errorLocation + ": \n" + errorDetails || errorDetails.stack)
    } else if(process.env.NODE_ENV == "production"){
        await logsnag.track({
            channel: "backend-errors",
            event: "API Error",
            description: "There was an error at:\n" + errorLocation + ": \n" + errorDetails || errorDetails.stack,
            icon: ":warning:",
            user_id: userId,
        });
        if(errorLocation != "emailSender"){ // to prevent infinite loop
            await sendEmail("drodriguez.dcr@gmail.com", "API Error", "There was an error at " + errorLocation + ": \n" + errorDetails || errorDetails.stack)
        }
   }
}