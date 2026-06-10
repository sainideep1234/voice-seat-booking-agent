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

dotenv.config({ path: '.env.local' });
const BASE_EXPRESS_URL = 'http://localhost:3001/api';
class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: `
      you are booking assistant of new india fine dine restaurant. your task is to help restaurant  book booking and confirm their seating in restaurant.
      conversation starts with:
      1. Greet the user and understand their booking intent from  new india fine dine restaurant booking system side.
      2. Collect booking information through voice:
        ○ Number of guests
        ○ Preferred date and time
        ○ Cuisine preference (Italian, Chinese, Indian, etc.)
        ○ Special requests (birthday, anniversary, dietary restrictions)
      3. Fetch real-time weather for the booking date and suggest indoor/outdoor seating and tell to user.
      4. Confirm booking details via voice with name of the cutomer .
      5. Store booking in a database .
      
      BEHAVIOUR OF ASSITANT:
      Your tone is high enthusiastic , you are friendly and helpful.
      If taking time guide user after 500ms that his request is processing.
      Their should be transition or filling statements like hold on , give me a moment , i'll get back to yuo etc.during processing orders.
      TOOLS:
      getWeather:to get weather on teh basis of location and date ,
      createBooking : to create a booking or creating a booking of a client based on his requirements in database table,
      deleteBooking: to delete a particular booking from database table ,
      getAllbooking:get the details of every booking in the database table ,
      getBookingWithId: get a specific booking based on  booking id from database table .
      getToadaysDateTime : to get get todays date and time .

      you should use above tools in order to navigate a user query like a proficient and senior worker.
      
      CONDITION:
      if (weather.condition === 'sunny') {
        return "Perfect weather for outdoor dining!";
      } 
      else if (weather.condition === 'rainy') {
        return "Looks like rain. Indoor seating would be better.";
      }
        
      STRICTLY :
      As soon as call is connected greet them , from my restaurant side in happy tone.
      Do not answer any of the question outside the restaurant domain 
      Strictly use aboev tools to get weatehr data adn to interact with database.
      No need to ask restaurant name.
      Check the condition after getting rsponse from weatherTool regarding temprature and weather and based on the condition provide seating .
      NO ticket booking after 14 days from today.
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
          execute: async ({ location, date }, { ctx }) => {
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
              const response = await axios.post(
                `${BASE_EXPRESS_URL}/booking`,
                {
                  bookingTime,
                  bookingDate,
                  numberOfGuests,
                  cuisinePreference,
                  specialRequests,
                  customerName,
                  seatingPreference,
                  status,
                  weatherInfo,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );
              return response.data;
            } catch (error) {
              console.log('[ERROR]', error);
            }
          },
        }),
        deleteBooking: llm.tool({
          description: 'tool for deleting a booking ',
          parameters: z.object({
            bookingId: z.string(),
          }),
          execute: async ({ bookingId }) => {
            const response = await axios.delete(`${BASE_EXPRESS_URL}/booking/${bookingId}`);
            return response.data;
          },
        }),
        getAllbooking: llm.tool({
          description: 'tool to get all booking from table ',
          execute: async () => {
            const response = await axios.get(`${BASE_EXPRESS_URL}/booking`);
            return response.data;
          },
        }),
        getBookingWithId: llm.tool({
          description: 'tool to get a specific boking detail from a table ',
          parameters: z.object({
            bookingId: z.string(),
          }),
          execute: async ({ bookingId }) => {
            const response = await axios.get(`${BASE_EXPRESS_URL}/booking/${bookingId}`);
            return response.data;
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
