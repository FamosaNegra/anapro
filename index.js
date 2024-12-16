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

// Função auxiliar para normalizar os dados
function normalizeLeadData(userColumnData) {
    const normalizedData = {};

    userColumnData.forEach((item) => {
        if (item.column_name) { // Verifica se column_name existe
            const columnName = item.column_name.toLowerCase();

            if (columnName.includes('full name')) {
                normalizedData.name = item.string_value || "Nome Desconhecido";
            } else if (columnName.includes('email')) {
                normalizedData.email = item.string_value || "email@desconhecido.com";
            } else if (columnName.includes('phone')) {
                normalizedData.phone = item.string_value || "";
            } else if (columnName.includes('que tipo de imóvel você está procurando?')) {
                normalizedData.observacao = item.string_value || "";
            } else if (columnName.includes('observacao') || columnName.includes('observação')) {
                normalizedData.observacao = item.string_value || "";
            }
        }
    });

    return normalizedData;
}

// Rota para o webhook
app.post('/webhook', async (req, res) => {
    // Log do JSON recebido
    console.log("Dados recebidos do Google:", JSON.stringify(req.body, null, 2));

    const userColumnData = req.body.user_column_data || [];

    // Normaliza os dados recebidos
    const leadData = normalizeLeadData(userColumnData);

    // Ignora leads com observações indesejadas
    if (leadData.observacao === "Não quero Comprar" || leadData.observacao === "Quero Alugar") {
        console.log("Lead ignorado devido à observação:", leadData.observacao);
        return res.status(200).send({ message: "Lead ignorado." });
    }

    // Extraímos o DDD e o número do telefone
    const { DDD, Numero } = extractPhoneData(leadData.phone);
    const pessoaTelefones = DDD && Numero ? [{ DDD, Numero }] : [];

    const body = {
        Key: KEY,
        CanalKey: CANAL_KEY,
        CampanhaKey: CAMPANHA_KEY,
        PoliticaPrivacidadeKey: "",
        PessoaNome: leadData.name,
        PessoaEmail: leadData.email,
        KeyIntegradora: KEY_INTEGRADORA,
        KeyAgencia: KEY_AGENCIA,
        PessoaTelefones: pessoaTelefones,
        Data: new Date().toISOString(),
        Midia: "google-ads",
        Peca: "webhook",
        Observacoes: leadData.observacao
    };

    // Log do JSON enviado ao CRM
    console.log("Dados enviados ao CRM:", JSON.stringify(body, null, 2));

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
