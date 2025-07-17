import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface HubContact {
  name: string;
  firstName: string;
  lastName: string;
  picture: string;
  from: string;
  whatsapp?: Whatsapp | null;  // Definindo como opcional e podendo ser null
  channel: string;
  companyId: number;
}

const FindOrCreateContactService = async (
  contact: HubContact
): Promise<Contact> => {
  const { name, picture, firstName, lastName, from, channel, companyId, whatsapp } = contact;

  console.log('contact', contact)
  let numberFb
  let numberIg
  let contactExists

  if(channel === 'facebook'){
    numberFb = from
    contactExists = await Contact.findOne({
      where: {
        messengerId: from,
      }
    });
  }

  if(channel === 'instagram'){
    numberIg = from
    contactExists = await Contact.findOne({
      where: {
        instagramId: from
      }
    });
  }

  // Se o contato já existir, apenas atualizamos as informações
  if (contactExists) {
    await contactExists.update({
      name: name || firstName || 'Name Unavailable',
      firstName,
      lastName,
      profilePicUrl: picture,
      whatsappId: whatsapp ? whatsapp.id : null  // Verificando se o whatsapp é passado corretamente
    });
    return contactExists;
  }

  // Se o contato não existir, criamos um novo
  const newContact = await Contact.create({
    name: name || firstName || 'Name Unavailable',
    number: null,  // Como você está criando o contato via Instagram ou Facebook, número pode ser null
    profilePicUrl: picture,
    messengerId: numberFb || null,
    instagramId: numberIg || null,
    companyId: companyId,
    whatsappId: whatsapp ? whatsapp.id : null // Atribuindo whatsappId ao novo contato, se disponível
  });

  return newContact;
};

export default FindOrCreateContactService;