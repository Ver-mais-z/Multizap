import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import Setting from '../../models/Setting';

interface Response {
  transcription: string;
}

class TranscribeAudioMessageToText {
  public async execute(fileName: string, companyId: number): Promise<Response | { error: string }> {
    // Validação dos parâmetros de entrada
    if (!fileName || typeof fileName !== 'string') {
      return { error: 'fileName é obrigatório e deve ser uma string.' };
    }
    if (!companyId || typeof companyId !== 'number') {
      return { error: 'companyId é obrigatório e deve ser um número.' };
    }

    // Construção e verificação do caminho do arquivo
    const publicFolder = path.resolve(__dirname, '..', '..', '..', 'public');
    const filePath = `${publicFolder}/company${companyId}/${fileName}`;

    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${filePath}`);
      return { error: 'Arquivo não encontrado' };
    }

    // Busca da chave da API no banco de dados
    const transcriptionSetting = await Setting.findOne({
      where: { key: 'openaikeyaudio', companyId },
    });

    const apiKey = transcriptionSetting?.value;
    if (!apiKey) {
      console.error(`Chave da API não encontrada para openaikeyaudio e companyId: ${companyId}`);
      return { error: 'Chave da API não configurada' };
    }

    // Identificação do provedor baseado na chave da API
    let transcriptionProvider: string;
    if (apiKey.startsWith('sk-')) {
      transcriptionProvider = 'openai';
    } else if (apiKey.startsWith('AIzaSy')) {
      transcriptionProvider = 'gemini';
    } else {
      console.error(`Formato de chave da API desconhecido: ${apiKey} para companyId: ${companyId}`);
      return { error: 'Formato de chave da API inválido' };
    }

    try {
      if (transcriptionProvider === 'openai') {
        // Configuração para a API da OpenAI
        const form = new FormData();
        const audioFile = fs.createReadStream(filePath);
        form.append('file', audioFile);
        form.append('model', 'whisper-1');
        form.append('response_format', 'text');
        form.append('language', 'pt');

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${apiKey}`,
          },
        });

        return { transcription: response.data };
      } else if (transcriptionProvider === 'gemini') {
        // Implementação correta para a API do Gemini
        
        // 1. Primeiro, fazer upload do arquivo de áudio
        const audioFileBuffer = fs.readFileSync(filePath);
        const audioBase64 = audioFileBuffer.toString('base64');
        
        // Determinar o tipo MIME com base na extensão do arquivo
        const fileExtension = path.extname(fileName).toLowerCase();
        let mimeType: string;
        
        switch (fileExtension) {
          case '.mp3':
            mimeType = 'audio/mp3';
            break;
          case '.wav':
            mimeType = 'audio/wav';
            break;
          case '.aac':
            mimeType = 'audio/aac';
            break;
          case '.ogg':
            mimeType = 'audio/ogg';
            break;
          case '.flac':
            mimeType = 'audio/flac';
            break;
          case '.aiff':
            mimeType = 'audio/aiff';
            break;
          default:
            mimeType = 'audio/mp3'; // Padrão para outros formatos
        }
        
        // Método 1: Usando transmissão inline dos dados de áudio (para arquivos pequenos < 20MB)
        const requestData = {
          contents: [
            { 
              parts: [
                { text: "Generate a transcript of the speech." },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: audioBase64
                  }
                }
              ] 
            }
          ],
          generationConfig: {
            temperature: 0,
          }
        };

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Extrair a transcrição da resposta
        if (response.data && 
            response.data.candidates && 
            response.data.candidates[0] && 
            response.data.candidates[0].content && 
            response.data.candidates[0].content.parts && 
            response.data.candidates[0].content.parts[0] && 
            response.data.candidates[0].content.parts[0].text) {
          return { transcription: response.data.candidates[0].content.parts[0].text };
        } else {
          return { error: 'Formato de resposta do Gemini inesperado' };
        }
      } else {
        console.error(`Provedor de transcrição desconhecido: ${transcriptionProvider} para companyId: ${companyId}`);
        return { error: 'Provedor de transcrição inválido' };
      }
    } catch (error: any) {
      console.error(`Erro ao transcrever áudio para fileName: ${fileName}, companyId: ${companyId}`, error);
      
      // Mensagem de erro mais detalhada
      if (error.response) {
        console.error('Detalhes do erro da API:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      return { error: `Conversão para texto falhou: ${error.message || 'Erro desconhecido'}` };
    }
  }
}

export default TranscribeAudioMessageToText;