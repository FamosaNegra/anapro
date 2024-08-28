import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { extractPhoneData, extractUserData, storeLeadDaily } from './leadStorage.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear o corpo das requisições como JSON
app.use(bodyParser.json());

// Configuração das chaves e URL do endpoint do Anapro
const ANAPRO_ENDPOINT = "https://crm.anapro.com.br/webcrm/webapi/integracao/v2/CadastrarProspect";
const KEY = "wz2O9Z9BawY1";
const CANAL_KEY = "7aTeATm50Tk1";
const CAMPANHA_KEY = "T8Ds8DuFA781";
const KEY_INTEGRADORA = "883F81F3-32BF-4A1F-BE1D-71E93E900832";
const KEY_AGENCIA = "883F81F3-32BF-4A1F-BE1D-71E93E900832";

// Rota para o webhook
app.post('/webhook', async (req, res) => {
    const userColumnData = req.body.user_column_data || [];

    // Extraímos os dados usando o column_id
    const name = extractUserData(userColumnData, "FULL_NAME") || "Nome Desconhecido";
    const email = extractUserData(userColumnData, "EMAIL") || "email@desconhecido.com";
    let phone = extractUserData(userColumnData, "PHONE_NUMBER") || "";

    // Limpeza do número de telefone para remover caracteres como "+"
    phone = phone.replace(/\D/g, ''); // Remove todos os caracteres que não são dígitos

    // Extrai DDD e número do telefone
    const { DDD, Numero } = extractPhoneData(phone);

    // Obter data e hora atuais
    const currentDateTime = new Date().toISOString(); // Formato ISO 8601

    const body = {
        Key: KEY,
        CanalKey: CANAL_KEY,
        CampanhaKey: CAMPANHA_KEY,
        PoliticaPrivacidadeKey: "",
        PessoaNome: name,
        PessoaEmail: email,
        KeyIntegradora: KEY_INTEGRADORA,
        KeyAgencia: KEY_AGENCIA,
        PessoaTelefones: [
            {
                DDD,
                Numero,
            },
        ],
        Data: currentDateTime, // Adicionando a data e hora ao corpo do envio
    };

    try {
        // Enviar o lead ao Anapro
        const response = await fetch(ANAPRO_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to submit form");
        }

        // Armazenar o lead no arquivo JSON diário
        storeLeadDaily(body);

        console.log("Lead enviado com sucesso:", body);
        res.status(200).send({ message: "Lead enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar lead:", error);
        res.status(500).send({ error: "Erro ao enviar lead" });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
