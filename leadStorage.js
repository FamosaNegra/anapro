// leadStorage.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
