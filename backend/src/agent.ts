import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  llm,
  metrics,
  voice,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import z from 'zod';
import { connectToDb, Booking } from './db.js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
connectToDb();
class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: `
      you are booking assistant of new india fine dine restaurant. your task is to help restaurant book booking and confirm their seating in restaurant.

      CONVERSATION FLOW & NON-LINEAR SLOT FILLING:
      1. As soon as call is connected greet them in a happy, enthusiastic tone representing New India Fine Dine.
      2. Dynamically gather the following information in a conversational, non-linear manner. Do not strictly enforce a sequence. If the user changes their mind or corrects a detail (e.g., changes the guest count or booking date) at any point, acknowledge and update the information immediately:
        ○ Customer name
        ○ Number of guests
        ○ Booking date and time (Note: Today's date and time can be fetched via getToadaysDateTime. Strictly do not book any tables further than 14 days from today)
        ○ Cuisine preference (Indian, Chinese, Mughlai, etc.)
        ○ Special requests (e.g., anniversary, birthday, dietary restrictions, allergies)
      3. AVAILABILITY CHECK: As soon as the user specifies a date and time, you MUST call the checkTableAvailability tool. If the slot is unavailable:
        ○ Politely inform the user.
        ○ Propose alternative times or dates (e.g., 30 or 60 minutes earlier/later, or the next day) and ask if that works.
        ○ Do not proceed to confirmation or booking creation unless a slot has been verified as available.
      4. For the requested date, use getWeather (requires location, e.g. Delhi, IN, and date) to check the weather. Based on the weather condition:
        ○ If sunny: suggest outdoor seating.
        ○ If rainy: suggest indoor seating.
      5. MANDATORY CONFIRMATION STEP: Before calling the createBooking tool to save the booking, you must read back all the collected details to the customer and ask for explicit confirmation (e.g., "I have a reservation for John for 4 guests on Friday at 7:00 PM, with a preference for Indian cuisine and outdoor seating. Is that correct?").
      6. Only call createBooking once the user has verbally confirmed the details.

      BEHAVIOUR OF ASSISTANT:
      Your tone is highly enthusiastic, friendly, and helpful.
      If processing takes time, guide the user after 500ms that their request is processing using transition/filler statements (e.g., "Hold on", "Give me a moment", "I'll get back to you in a second").
      Do not answer any questions outside the restaurant domain.
      No need to ask for the restaurant name.
      Strictly use the tools to get weather data and to interact with database.
      Check the condition after getting response from weatherTool regarding temperature and weather and based on the condition suggest/provide seating.
      `,
      tools: {
        getToadaysDateTime: llm.tool({
          description: 'to get todays date and time ',
          execute: async () => {
            return new Date().toLocaleString();
          },
        }),
        getWeather: llm.tool({
          description: `Use this tool to look up current weather information in the given location.
          If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.`,
          parameters: z.object({
            location: z
              .string()
              .describe('name of city and country for (e.g. Delhi,IN that is delhi india )'),
            date: z
              .string()
              .date()
              .describe('date should be in yyyy-MM-dd and should be in today or next 14 days '),
          }),
          execute: async ({ location, date }) => {
            console.log(`Looking up weather for ${location}`);
            const response = await axios.get(
              `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}&dt=${date}`,
            );
            return response.data;
          },
        }),
        createBooking: llm.tool({
          description: 'used to create booking for a table in restaurant',
          parameters: z.object({
            customerName: z.string().describe('name of customer'),
            numberOfGuests: z.number().describe('number of number'),
            bookingDate: z.string().date().describe('date and time in yy-mm-dd'),
            bookingTime: z.string().describe('time should be in strinf'),
            cuisinePreference: z.string().describe('prefrences from indian , chinese , mughlai'),
            specialRequests: z.string().describe('birthday , no pizza etc'),
            seatingPreference: z
              .enum(['indoor', 'outdoor'])
              .describe('string that defien seating arangenment'),
            status: z
              .enum(['cancelled', 'confirmed', 'pending'])
              .describe('that defien youir staus of seat'),
            weatherInfo: z
              .object({ weather: z.string(), temprature: z.string() })
              .describe('get from weather api tool'),
          }),
          execute: async ({
            bookingDate,
            bookingTime,
            numberOfGuests,
            cuisinePreference,
            specialRequests,
            customerName,
            weatherInfo,
            seatingPreference,
            status,
          }) => {
            try {
              const booking = await Booking.create({
                customerName,
                numberOfGuests,
                bookingDate: new Date(bookingDate),
                bookingTime,
                cuisinePreference,
                specialRequests,
                weatherInfo,
                seatingPreference,
                status,
              });
              return {
                message: `Booking is done. here is your booking id :${booking._id} , status : ${booking.status} `,
              };
            } catch (error) {
              console.log('[ERROR]', error);
              return { error: 'Failed to create booking' };
            }
          },
        }),
        deleteBooking: llm.tool({
          description: 'tool for deleting a booking ',
          parameters: z.object({
            bookingId: z.string(),
          }),
          execute: async ({ bookingId }) => {
            try {
              const deleteBooking = await Booking.findByIdAndDelete(bookingId);
              if (!deleteBooking) {
                return {
                  message: 'no booking',
                };
              }
              return {
                message: `Deleted booking : ${bookingId} successfully`,
              };
            } catch (error) {
              console.log('[ERROR]', error);
              return { error: 'Failed to delete booking' };
            }
          },
        }),
        updateBooking: llm.tool({
          description: 'used to update details of an existing booking in the restaurant',
          parameters: z.object({
            bookingId: z.string().describe('the ID of the booking to update'),
            customerName: z.string().optional().describe('name of customer'),
            numberOfGuests: z.number().optional().describe('number of guests'),
            bookingDate: z.string().date().optional().describe('date in format yyyy-MM-dd'),
            bookingTime: z.string().optional().describe('time format (e.g. 7:00 PM)'),
            cuisinePreference: z.string().optional().describe('preferences from indian, chinese, mughlai'),
            specialRequests: z.string().optional().describe('special request details'),
            seatingPreference: z.enum(['indoor', 'outdoor']).optional().describe('seating arrangement'),
            status: z.enum(['cancelled', 'confirmed', 'pending']).optional().describe('booking status'),
          }),
          execute: async ({ bookingId, ...updateFields }) => {
            try {
              const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { $set: updateFields },
                { new: true }
              );
              if (!updatedBooking) {
                return { message: 'no booking found to update' };
              }
              return {
                message: `Booking ${bookingId} updated successfully`,
                booking: updatedBooking,
              };
            } catch (error) {
              console.log('[ERROR]', error);
              return { error: 'Failed to update booking' };
            }
          },
        }),
        getAllbooking: llm.tool({
          description: 'tool to get all booking from table ',
          execute: async () => {
            try {
              const booking = await Booking.find();
              if (!booking || booking.length === 0) {
                return {
                  message: 'no booking',
                };
              }
              return {
                message: 'booking fetched succesfully',
                booking,
              };
            } catch (error) {
              console.log('[ERROR]', error);
              return { error: 'Failed to get bookings' };
            }
          },
        }),
        getBookingWithId: llm.tool({
          description: 'tool to get a specific boking detail from a table ',
          parameters: z.object({
            bookingId: z.string(),
          }),
          execute: async ({ bookingId }) => {
            try {
              const booking = await Booking.find({ _id: bookingId });
              if (!booking || booking.length === 0) {
                return {
                  message: 'no booking',
                };
              }
              return {
                message: 'booking fetched succesfully',
                booking,
              };
            } catch (error) {
              console.log('[ERROR]', error);
              return { error: 'Failed to get booking' };
            }
          },
        }),
        checkTableAvailability: llm.tool({
          description:
            'Use this tool to check if a specific date and time slot is available for booking at the restaurant.',
          parameters: z.object({
            bookingDate: z.string().date().describe('date in format yyyy-MM-dd'),
            bookingTime: z.string().describe('time format (e.g. 7:00 PM)'),
          }),
          execute: async ({ bookingDate, bookingTime }) => {
            try {
              const count = await Booking.countDocuments({
                bookingDate: new Date(bookingDate),
                bookingTime,
                status: { $ne: 'cancelled' },
              });
              const maxCapacity = 5;
              return {
                isAvailable: count < maxCapacity,
                remainingTables: maxCapacity - count,
              };
            } catch (error) {
              console.error('[ERROR] checking availability:', error);
              return {
                isAvailable: false,
                remainingTables: 0,
                error: 'Failed to verify availability',
              };
            }
          },
        }),
      },
    });
  }
}
export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'assemblyai/universal-streaming',
        language: 'en',
      }),
      llm: new inference.LLM({
        model: 'openai/gpt-4.1-mini',
      }),
      tts: new inference.TTS({
        model: 'cartesia/sonic-3',
        voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      }),
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad! as silero.VAD,
      voiceOptions: {
        preemptiveGeneration: true,
      },
    });
    const usageCollector = new metrics.UsageCollector();
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });
    const logUsage = async () => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
    };
    ctx.addShutdownCallback(logUsage);
    await session.start({
      agent: new Assistant(),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });
    await ctx.connect();
  },
});
cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
