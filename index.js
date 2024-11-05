import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

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

// Função auxiliar para extrair DDD e número de telefone
function extractPhoneData(phone) {
    // Remove todos os caracteres que não são dígitos
    const phoneClean = phone.replace(/\D/g, '');
    
    // Verifica se o telefone tem o código de país do Brasil +55
    if (phoneClean.startsWith('55') && phoneClean.length > 11) {
        phone = phoneClean.slice(2); // Remove o código do país
    } else {
        phone = phoneClean;
    }

    // Extrai o DDD (2 primeiros dígitos após o código do país) e o número restante
    const DDD = phone.length >= 10 ? phone.slice(0, 2) : null;
    const Numero = phone.length >= 10 ? phone.slice(2) : phone;

    return { DDD, Numero };
}

// Função auxiliar para extrair os dados do user_column_data
function extractUserData(userColumnData, columnId) {
    const data = userColumnData.find(item => item.column_id === columnId);
    return data ? data.string_value : "";
}

// Rota para o webhook
app.post('/webhook', async (req, res) => {
    const userColumnData = req.body.user_column_data || [];

    // Extraímos os dados usando o column_id
    const name = extractUserData(userColumnData, "FULL_NAME") || "Nome Desconhecido";
    const email = extractUserData(userColumnData, "EMAIL") || "email@desconhecido.com";
    let phone = extractUserData(userColumnData, "PHONE_NUMBER") || "";

    // Extraímos o DDD e o número do telefone
    const { DDD, Numero } = extractPhoneData(phone);

    // Se o telefone for inválido (sem DDD e sem número), pode ser registrado como nulo
    const pessoaTelefones = DDD && Numero ? [{ DDD, Numero }] : [];

    const body = {
        Key: KEY,
        CanalKey: CANAL_KEY,
        CampanhaKey: CAMPANHA_KEY,
        PoliticaPrivacidadeKey: "",
        PessoaNome: name,
        PessoaEmail: email,
        KeyIntegradora: KEY_INTEGRADORA,
        KeyAgencia: KEY_AGENCIA,
        PessoaTelefones: pessoaTelefones,
        Data: new Date().toISOString(), // Adicionando a data e hora ao corpo do envio
        Midia: "google-ads",
        Peca: "webhook",
    };

    try {
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

        console.log("Lead enviado com sucesso:", body);
        res.status(200).send({ message: "Lead enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar lead:", error);
        res.status(500).send({ error: "Erro ao enviar lead" });
    }
});


app.post('/black', async (req, res) => {
    const userColumnData = req.body.user_column_data || [];

    // Extraímos os dados usando o column_id
    const name = extractUserData(userColumnData, "FULL_NAME") || "Nome Desconhecido";
    const email = extractUserData(userColumnData, "EMAIL") || "email@desconhecido.com";
    let phone = extractUserData(userColumnData, "PHONE_NUMBER") || "";

    // Extraímos o DDD e o número do telefone
    const { DDD, Numero } = extractPhoneData(phone);

    // Se o telefone for inválido (sem DDD e sem número), pode ser registrado como nulo
    const pessoaTelefones = DDD && Numero ? [{ DDD, Numero }] : [];

    const body = {
        Key: KEY,
        CanalKey: CANAL_KEY,
        CampanhaKey: CAMPANHA_KEY,
        PoliticaPrivacidadeKey: "",
        PessoaNome: name,
        PessoaEmail: email,
        KeyIntegradora: KEY_INTEGRADORA,
        KeyAgencia: KEY_AGENCIA,
        PessoaTelefones: pessoaTelefones,
        Data: new Date().toISOString(), // Adicionando a data e hora ao corpo do envio
        Midia: "google-ads",
        Peca: "Black-Friday",
    };

    try {
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