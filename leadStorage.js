import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

// Configuração para obter o diretório atual em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para extrair DDD e número de telefone
export function extractPhoneData(phone) {
    if (!phone || typeof phone !== 'string' || phone.length < 3) {
        return { DDD: "", Numero: "" };
    }
    return {
        DDD: phone.slice(0, 2),
        Numero: phone.slice(2),
    };
}

// Função para extrair os dados do user_column_data
export function extractUserData(userColumnData, columnId) {
    const data = userColumnData.find(item => item.column_id === columnId);
    return data ? data.string_value : "";
}

// Função para armazenar o lead no arquivo JSON diário
export function storeLeadDaily(lead) {
    const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const fileName = `${date}.json`;
    const filePath = path.join(__dirname, fileName);

    let leadsArray = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        leadsArray = JSON.parse(fileData);
    }

    leadsArray.push(lead);

    fs.writeFileSync(filePath, JSON.stringify(leadsArray, null, 2));
}

// Função para enviar o arquivo JSON diário por e-mail
function sendDailyEmail() {
    const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const fileName = `${date}.json`;
    const filePath = path.join(__dirname, fileName);

    // Configuração do transporte de e-mail (usando Gmail como exemplo)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your.email@gmail.com', // Substitua pelo seu email
            pass: 'yourpassword',         // Substitua pela sua senha ou use OAuth2
        },
    });

    const mailOptions = {
        from: 'your.email@gmail.com',    // Substitua pelo seu email
        to: 'recipient.email@example.com', // Substitua pelo email do destinatário
        subject: `Leads do dia ${date}`,
        text: `Em anexo, os leads coletados no dia ${date}.`,
        attachments: [
            {
                filename: fileName,
                path: filePath,
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Erro ao enviar e-mail:", error);
        } else {
            console.log("E-mail enviado:", info.response);
        }
    });
}

// Agendar o envio do e-mail às 23:59 todos os dias
cron.schedule('59 23 * * *', () => {
    sendDailyEmail();
});
