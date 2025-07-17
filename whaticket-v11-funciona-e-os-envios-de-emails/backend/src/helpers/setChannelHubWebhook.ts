import Whatsapp from "../models/Whatsapp";
import { IChannel } from "../controllers/ChannelHubController";
import { showHubToken } from "./showHubToken";
const {
  Client,
  MessageSubscription
} = require("notificamehubsdk");
require("dotenv").config();

export const setChannelWebhook = async (
  whatsapp: IChannel | any,
  whatsappId: string
) => {
  const notificameHubToken = await showHubToken();

  const client = new Client(notificameHubToken);

  
  /* USAR EM TESTE */
  //const url = `https://0513-201-75-90-49.ngrok-free.app/hub-webhook/${whatsapp.qrcode}`;

  /* USAR EM PRODUÇÃO */
  const url = `${process.env.BACKEND_URL}/hub-webhook/${whatsapp.qrcode}`;

  const subscription = new MessageSubscription(
    {
      url
    },
    {
      channel: whatsapp.qrcode
    }
  );

  client
    .createSubscription(subscription)
    .then((response: any) => {
      console.log("Webhook subscribed:", response);
    })
    .catch((error: any) => {
      console.log("Error:", error);
    });

  await Whatsapp.update(
    {
      status: "CONNECTED"
    },
    {
      where: {
        id: whatsappId
      }
    }
  );
};