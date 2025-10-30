import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const REPORTANA_API_URL = "https://api.reportana.com/2022-05";
const REPORTANA_CLIENT_ID = process.env.REPORTANA_CLIENT_ID;
const REPORTANA_CLIENT_SECRET = process.env.REPORTANA_CLIENT_SECRET;
const REPORTANA_SEGMENT_ID = process.env.REPORTANA_SEGMENT_ID || "1"; // ID da lista padrão

/**
 * Gera token Basic Auth
 */
function getBasicAuthToken() {
  const credentials = `${REPORTANA_CLIENT_ID}:${REPORTANA_CLIENT_SECRET}`;
  return Buffer.from(credentials).toString("base64");
}

/**
 * Envia email via Reportana
 */
export async function sendEmail({ to, subject, html, from_name = "Green Rush", from_email = "contato@greenrushoficial.com" }) {
  try {
    if (!REPORTANA_CLIENT_ID || !REPORTANA_CLIENT_SECRET) {
      console.error("❌ Credenciais Reportana não configuradas");
      return { success: false, error: "Credenciais não configuradas" };
    }

    console.log(`📧 Enviando email para: ${to}`);
    console.log(`📝 Assunto: ${subject}`);

    const authToken = getBasicAuthToken();

    const response = await axios.post(
      `${REPORTANA_API_URL}/emails`,
      {
        to: [{ email: to }],
        from: {
          name: from_name,
          email: from_email
        },
        subject: subject,
        html: html
      },
      {
        headers: {
          "Authorization": `Basic ${authToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ Email enviado com sucesso para: ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

/**
 * Adiciona um contato/lead no Reportana
 */
export async function addContact({ email, phone = "", name = "", segmentId = REPORTANA_SEGMENT_ID }) {
  try {
    if (!REPORTANA_CLIENT_ID || !REPORTANA_CLIENT_SECRET) {
      console.error("❌ Credenciais Reportana não configuradas");
      return { success: false, error: "Credenciais não configuradas" };
    }

    console.log(`📝 Adicionando contato ao Reportana (Lista ${segmentId}): ${email}`);

    const authToken = getBasicAuthToken();

    const contactData = {
      email: email,
      // segmentId já está na URL
    };

    if (name) contactData.name = name;
    if (phone) contactData.phone = phone;

    const response = await axios.post(
      `${REPORTANA_API_URL}/segments/${segmentId}/customers`,
      contactData,
      {
        headers: {
          "Authorization": `Basic ${authToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ Contato adicionado ao Reportana: ${email}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes("already exists")) {
      console.log(`ℹ️ Contato já existe no Reportana: ${email}`);
      return { success: true, alreadyExists: true };
    }

    console.error("❌ Erro ao adicionar contato ao Reportana:", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

/**
 * Template de email de boas-vindas
 */
export function emailBoasVindas(nome, email) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Green Rush</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🌿 Green Rush</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Olá, ${nome}! 👋</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Seja muito bem-vindo(a) à <strong>Green Rush</strong>! Estamos muito felizes em ter você conosco.
              </p>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Sua conta foi criada com sucesso e você já pode aproveitar todos os nossos produtos e ofertas exclusivas.
              </p>
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                  <strong>🎁 Dica:</strong> Fique de olho no seu email para receber ofertas especiais e novidades em primeira mão!
                </p>
              </div>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://greenrushoficial.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Começar a Comprar</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2024 Green Rush. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template de email de confirmação de pedido
 */
export function emailConfirmacaoPedido(nome, numeroPedido, produtos, total) {
  const produtosHtml = produtos.map(p => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${p.nome}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${p.quantidade}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">R$ ${p.preco.toFixed(2)}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">✅ Pedido Confirmado!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Olá, ${nome}! 🎉</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Seu pedido foi recebido e está sendo processado!
              </p>
              <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-radius: 6px;">
                <p style="margin: 0; color: #065f46; font-size: 16px;"><strong>Número do Pedido:</strong> #${numeroPedido}</p>
              </div>
              <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 18px;">Resumo do Pedido</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px; text-align: left; color: #6b7280; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Produto</th>
                    <th style="padding: 10px; text-align: center; color: #6b7280; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Qtd</th>
                    <th style="padding: 10px; text-align: right; color: #6b7280; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${produtosHtml}
                  <tr>
                    <td colspan="2" style="padding: 15px 10px; text-align: right; color: #1f2937; font-size: 18px; font-weight: bold;">Total:</td>
                    <td style="padding: 15px 10px; text-align: right; color: #10b981; font-size: 18px; font-weight: bold;">R$ ${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://greenrushoficial.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Acompanhar Pedido</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2024 Green Rush. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template de email de confirmação de newsletter
 */
export function emailConfirmacaoNewsletter(email, nome = "") {
  const nomeDisplay = nome || email.split("@")[0];
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Newsletter Green Rush</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🌿 Green Rush</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Newsletter</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Inscrição Confirmada! 🎉</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Olá${nome ? ", " + nomeDisplay : ""}! 👋
              </p>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Você acaba de se inscrever na <strong>newsletter da Green Rush</strong>! Agora você receberá em primeira mão:
              </p>
              <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                <ul style="margin: 0; padding-left: 20px; color: #065f46;">
                  <li style="margin-bottom: 10px;">🎁 <strong>Ofertas exclusivas</strong> e descontos especiais</li>
                  <li style="margin-bottom: 10px;">🆕 <strong>Lançamentos</strong> de produtos em primeira mão</li>
                  <li style="margin-bottom: 10px;">💡 <strong>Dicas e novidades</strong> sobre emagrecimento saudável</li>
                  <li>✨ <strong>Conteúdo exclusivo</strong> para assinantes</li>
                </ul>
              </div>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://greenrushoficial.com" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Visitar Loja</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Green Rush</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Email: ${email}
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                © 2024 Green Rush. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default { sendEmail, emailBoasVindas, emailConfirmacaoPedido, addContact, emailConfirmacaoNewsletter };
